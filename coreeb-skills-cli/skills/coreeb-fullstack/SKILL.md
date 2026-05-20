---
name: coreeb-fullstack
description: Protocolo estricto para construir aplicaciones Fullstack usando Next.js, Prisma, PostgreSQL con Docker y la librería UI coreeb.
---

# COREEB — SKILL FULLSTACK UNIFICADO

## ⚠️ DIRECTIVA SUPREMA
Este documento es la **ÚNICA FUENTE DE VERDAD**. Cualquier petición del usuario DEBE ejecutarse siguiendo este protocolo de forma automática.
- **Stack:** Next.js (App Router) — proyecto unificado, frontend y backend en uno.
- **Backend API:** Route Handlers en `src/app/api/...` bajo **ARQUITECTURA HEXAGONAL ESTRICTA**.
- **ORM:** Prisma + PostgreSQL **SIEMPRE**.
- **Entorno local:** PostgreSQL vía Docker Compose con healthcheck. `pnpm dev` levanta todo automáticamente.
- **Producción:** Solo cambiar `DATABASE_URL`. El código no se toca.
- **UI:** Librería `coreeb` exclusivamente (https://www.npmjs.com/package/coreeb).
- **Paquetes:** pnpm obligatorio.

## 🚫 REGLA CERO: INSTALACIÓN-PRIMERO
**PROHIBIDO** escribir código sin completar instalación, `.env` y scaffolding. En este orden:

```bash
pnpm dlx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --use-pnpm
pnpm add -D prisma tsx @types/node
pnpm add @prisma/client
pnpm dlx prisma init --datasource-provider postgresql
pnpm dlx prisma generate
pnpm add coreeb sonner tw-animate-css @tailwindcss/postcss tailwindcss
pnpm add socket.io socket.io-client
```

Estructura de módulos hexagonales en `src/modules/[modulo]/`:
- `domain/entities`, `domain/repositories`
- `application/dtos`, `application/use-cases`
- `infrastructure/repositories`
- `infrastructure/socket` (Gateways WebSocket)
- `src/shared/infrastructure/prisma/prisma.client.ts`
- `src/shared/infrastructure/socket/` (socket.server.ts, socket.types.ts, useSocket.ts)

## 1. Docker & PostgreSQL

### `docker-compose.yml`:
```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: ${COMPOSE_PROJECT_NAME:-app}_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-appdb}
    ports:
      - "${DB_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-postgres} -d ${DB_NAME:-appdb}"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 10s

volumes:
  postgres_data:
```

### `scripts/wait-for-db.js`:
```js
const { execSync } = require('child_process');
const MAX_RETRIES = 30;
const RETRY_INTERVAL_MS = 2000;

function isDbHealthy() {
  try {
    const result = execSync('docker compose ps --format json db', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return result.trim().split('\n').filter(Boolean).some(line => {
      try { return JSON.parse(line).Health === 'healthy'; }
      catch { return line.includes('healthy'); }
    });
  } catch { return false; }
}

async function waitForDb() {
  console.log('⏳ Esperando a que PostgreSQL esté listo...');
  for (let i = 0; i < MAX_RETRIES; i++) {
    if (isDbHealthy()) { console.log('✅ PostgreSQL listo. Iniciando Next.js...'); return; }
    process.stdout.write(`   Intento ${i + 1}/${MAX_RETRIES}...\r`);
    await new Promise(r => setTimeout(r, RETRY_INTERVAL_MS));
  }
  console.error('❌ PostgreSQL no respondió. Verifica que Docker esté corriendo.');
  process.exit(1);
}

waitForDb();
```

### `.env` (no commitear — copiar desde `.env.example`):
```env
COMPOSE_PROJECT_NAME=mi_proyecto
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=appdb
DB_PORT=5432
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb?schema=public"
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000
```

### `.env.example` (sí commitear):
```env
COMPOSE_PROJECT_NAME=mi_proyecto
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=appdb
DB_PORT=5432
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb?schema=public"
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000
```

### `scripts/dev.js` — Orquestador cross-platform (Windows + Unix):
```js
const { execSync, spawn } = require('child_process');

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', shell: true });
}

async function main() {
  run('docker compose up -d');
  // wait-for-db es async, lo ejecutamos y esperamos
  await new Promise((resolve, reject) => {
    const waiter = spawn('node', ['scripts/wait-for-db.js'], { stdio: 'inherit', shell: true });
    waiter.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`wait-for-db salió con código ${code}`))));
  });
  const server = spawn('tsx', ['server.ts'], { stdio: 'inherit', shell: true });
  server.on('close', (code) => process.exit(code ?? 0));
  process.on('SIGINT', () => server.kill('SIGINT'));
}

main().catch((err) => {
  console.error('❌ Error al iniciar el entorno de desarrollo:', err.message);
  process.exit(1);
});
```

### Scripts en `package.json`:
```json
"dev": "node scripts/dev.js",
"build": "next build",
"start": "NODE_ENV=production tsx server.ts",
"db:start": "docker compose up -d",
"db:stop": "docker compose down",
"db:reset": "docker compose down -v && docker compose up -d",
"db:migrate": "prisma migrate dev",
"db:studio": "prisma studio"
```

## 2. Configuración de `coreeb`

### `next.config.mjs`:
```js
const nextConfig = { transpilePackages: ['coreeb'] };
export default nextConfig;
```

### `postcss.config.mjs`:
```js
const config = { plugins: { '@tailwindcss/postcss': {} } };
export default config;
```

### `src/app/globals.css`:
```css
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));
@source "../../node_modules/coreeb/dist";
@import "coreeb/styles.css";

.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
}
```

### `src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'coreeb';

export const metadata: Metadata = { title: 'Mi Proyecto' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
```

### Reglas de UI:
- Solo componentes de `coreeb`. Nada externo.
- Iconos: `<span className="material-symbols-outlined">nombre</span>`
- Loading: `<Spinner size={72} message="Cargando..." />` centrado en pantalla.
- Routing: solo `next/link` y `next/navigation`.
- Variables públicas: prefijo `NEXT_PUBLIC_`.

## 3. Backend Hexagonal

### Prisma Client Singleton — `src/shared/infrastructure/prisma/prisma.client.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
const prismaClientSingleton = () => new PrismaClient();
declare global { var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>; }
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
export default prisma;
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
```

### Reglas:
- Flujo obligatorio: Prisma → Entidades → Repositorios → Casos de Uso → Route Handlers.
- Route Handlers solo capturan la petición y delegan al Caso de Uso. Cero lógica de negocio en ellos.
- Prohibido SQL nativo (`$queryRaw`).

## 4. Tiempo Real con Socket.IO

> Next.js App Router **no soporta WebSockets nativamente** en Route Handlers. La solución de producción es un **custom HTTP server** (`server.ts`) que expone Next.js y Socket.IO en el mismo puerto.

### Dependencias adicionales:
```bash
pnpm add socket.io socket.io-client
pnpm add -D tsx @types/node
```

### Arquitectura:
```
Puerto 3000
├── HTTP  → Next.js (páginas + API routes)
└── WS    → Socket.IO (path: /api/socket)

Capa de infraestructura (hexagonal):
Domain/Use Cases (puros, sin IO)
       ↓
Gateway (infraestructura)   ← análogo al Route Handler
       ↓
Socket.IO Server Singleton
       ↓
Cliente (browser hook)
```

### `server.ts` (raíz del proyecto):
```typescript
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { initSocketServer } from './src/shared/infrastructure/socket/socket.server';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    path: '/api/socket',
  });

  initSocketServer(io);

  const PORT = parseInt(process.env.PORT || '3000', 10);
  httpServer.listen(PORT, () => {
    console.log(`✅ Servidor listo en http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('❌ Error al iniciar el servidor:', err);
  process.exit(1);
});
```

### `src/shared/infrastructure/socket/socket.types.ts` — Contrato de eventos tipados:
```typescript
// Eventos que el SERVIDOR envía al CLIENTE
export interface ServerToClientEvents {
  [key: string]: (...args: unknown[]) => void;
  // Definir eventos concretos por módulo:
  // 'product:created': (data: ProductDto) => void;
  // 'order:updated': (data: OrderDto) => void;
  'notification': (payload: { message: string; type: 'info' | 'success' | 'error' }) => void;
}

// Eventos que el CLIENTE envía al SERVIDOR
export interface ClientToServerEvents {
  [key: string]: (...args: unknown[]) => void;
  // 'room:join': (roomId: string) => void;
  // 'room:leave': (roomId: string) => void;
}
```

### `src/shared/infrastructure/socket/socket.server.ts` — Singleton del servidor IO:
```typescript
import type { Server as SocketIOServer } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from './socket.types';

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null = null;

/**
 * Inicializa el servidor Socket.IO. Llamar UNA sola vez desde server.ts.
 */
export function initSocketServer(
  server: SocketIOServer<ClientToServerEvents, ServerToClientEvents>,
) {
  io = server;

  io.on('connection', (socket) => {
    console.log(`[Socket] Cliente conectado: ${socket.id}`);

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Cliente desconectado: ${socket.id} — ${reason}`);
    });
  });
}

/**
 * Obtiene la instancia global del servidor IO.
 * Usar en Gateways y Route Handlers para emitir eventos.
 */
export function getIO(): SocketIOServer<ClientToServerEvents, ServerToClientEvents> {
  if (!io) {
    throw new Error(
      '[Socket] Socket.IO no está inicializado. Asegúrate de llamar initSocketServer en server.ts.',
    );
  }
  return io;
}
```

### `src/modules/[modulo]/infrastructure/socket/[modulo].gateway.ts` — Patrón Gateway Hexagonal:
```typescript
import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@/shared/infrastructure/socket/socket.types';
import { getIO } from '@/shared/infrastructure/socket/socket.server';

type TypedIO = SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

/**
 * Gateway de infraestructura para el módulo [Modulo].
 * Patrón hexagonal: conecta los Casos de Uso con el canal WebSocket.
 * No contiene lógica de negocio.
 */
export class [Modulo]Gateway {
  // ✅ Getter lazy: getIO() no se llama en construcción, solo al emitir.
  // Evita errores si el Gateway se instancia antes de que initSocketServer() corra.
  private get io(): TypedIO { return getIO(); }

  /** Emitir un evento a TODOS los clientes conectados */
  broadcast<K extends keyof ServerToClientEvents>(
    event: K,
    ...args: Parameters<ServerToClientEvents[K]>
  ) {
    this.io.emit(event as string, ...args);
  }

  /** Emitir un evento a una sala específica */
  emitToRoom<K extends keyof ServerToClientEvents>(
    room: string,
    event: K,
    ...args: Parameters<ServerToClientEvents[K]>
  ) {
    this.io.to(room).emit(event as string, ...args);
  }

  /** Registrar handlers de eventos del cliente en una conexión */
  registerHandlers(socket: TypedSocket) {
    // socket.on('room:join', (roomId) => socket.join(roomId));
    // socket.on('room:leave', (roomId) => socket.leave(roomId));
  }
}
```

### Ejemplo concreto — `src/modules/notifications/infrastructure/socket/notifications.gateway.ts`:
```typescript
import { getIO } from '@/shared/infrastructure/socket/socket.server';
import type { ServerToClientEvents } from '@/shared/infrastructure/socket/socket.types';

/**
 * Gateway de notificaciones en tiempo real.
 * Uso: inyectar en Casos de Uso para emitir tras operaciones CRUD.
 */
type NotificationType = ServerToClientEvents['notification'] extends (p: infer P) => void ? P['type'] : never;

export class NotificationsGateway {
  // ✅ Getter lazy: seguro si se instancia antes de que el servidor Socket.IO esté listo
  private get io() { return getIO(); }

  notifyAll(message: string, type: NotificationType = 'info') {
    this.io.emit('notification', { message, type });
  }

  notifyRoom(room: string, message: string, type: NotificationType = 'info') {
    this.io.to(room).emit('notification', { message, type });
  }
}

// ── Uso en un Caso de Uso ────────────────────────────────────────────────────
// export class CreateProductUseCase {
//   constructor(
//     private repo: ProductRepository,
//     private notifier: NotificationsGateway,   // ← inyectado
//   ) {}
//
//   async execute(dto: CreateProductDto) {
//     const product = await this.repo.create(dto);
//     this.notifier.notifyAll(`Producto "${product.name}" creado`, 'success');
//     return product;
//   }
// }
```

### `src/shared/infrastructure/socket/useSocket.ts` — Hook del cliente:
```typescript
'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from './socket.types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseSocketOptions {
  namespace?: string;
  autoConnect?: boolean;
}

/**
 * Hook para conectarse al servidor Socket.IO.
 * Gestiona el ciclo de vida de la conexión automáticamente.
 *
 * @example
 * const { isConnected, on, emit } = useSocket();
 *
 * useEffect(() => {
 *   // on() retorna el cleanup — úsalo directamente en useEffect
 *   return on('notification', (payload) => toast(payload.message));
 * }, [on]);
 */
export function useSocket({ namespace = '/', autoConnect = true }: UseSocketOptions = {}) {
  const socketRef = useRef<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!autoConnect) return;

    const socket: TypedSocket = io(namespace, {
      path: '/api/socket',
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Conectado:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Desconectado:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Error de conexión:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [namespace, autoConnect]);

  /**
   * Suscribirse a un evento del servidor.
   * ✅ Retorna una función de limpieza — usar siempre dentro de useEffect:
   * useEffect(() => on('event', handler), [on]);
   */
  const on = useCallback(
    <K extends keyof ServerToClientEvents>(event: K, handler: ServerToClientEvents[K]) => {
      socketRef.current?.on(event as string, handler as (...args: unknown[]) => void);
      return () => {
        socketRef.current?.off(event as string, handler as (...args: unknown[]) => void);
      };
    },
    [],
  );

  /** Emitir un evento al servidor */
  const emit = useCallback(
    <K extends keyof ClientToServerEvents>(event: K, ...args: Parameters<ClientToServerEvents[K]>) => {
      socketRef.current?.emit(event as string, ...args);
    },
    [],
  );

  // ✅ No se expone socket directamente (siempre sería null en el primer render).
  // Usar on() para suscripciones y emit() para enviar eventos.
  return { isConnected, on, emit };
}
```

### Variables de entorno adicionales en `.env`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000
```

### Reglas del Gateway:
- El Gateway es **infraestructura**. No contiene lógica de negocio.
- Los Casos de Uso reciben el Gateway como **dependencia inyectada** (no lo instancian internamente).
- El dominio (Entidades, Repositorios, Casos de Uso) **NUNCA importa** `socket.io` directamente.
- Los Gateways usan `private get io() { return getIO(); }` — getter lazy, nunca en el constructor.
- El hook `useSocket` es solo para Client Components (`'use client'`).
- `on()` retorna cleanup — siempre consumir dentro de `useEffect`.

## 5. Checklist
- [ ] `docker-compose.yml` con healthcheck creado
- [ ] `scripts/wait-for-db.js` creado
- [ ] `scripts/dev.js` creado — orquestador cross-platform (compatible Windows PowerShell)
- [ ] Script `dev` es `node scripts/dev.js` (NO usa `&&` directo en package.json)
- [ ] `.env` configurado con `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `PORT`
- [ ] `.env.example` commiteado como referencia
- [ ] Instalación incluye `prisma generate` después de `prisma init`
- [ ] Instalación incluye `socket.io`, `socket.io-client`, `tsx`
- [ ] `next.config.mjs`, `postcss.config.mjs`, `globals.css`, `layout.tsx` configurados
- [ ] UI 100% `coreeb`, iconos Material Symbols, Spinner en loadings
- [ ] Prisma Singleton en `src/shared/infrastructure/prisma/prisma.client.ts`
- [ ] Route Handlers delegan a Casos de Uso. Sin lógica de negocio en ellos.
- [ ] `server.ts` con `.catch()` — custom server HTTP que une Next.js + Socket.IO
- [ ] `socket.types.ts` define contratos de eventos (`ServerToClientEvents`, `ClientToServerEvents`)
- [ ] `socket.server.ts` expone `initSocketServer()` y `getIO()` como Singleton
- [ ] Gateways usan getter lazy `private get io() { return getIO(); }` — no en constructor
- [ ] Gateway hexagonal en `src/modules/[modulo]/infrastructure/socket/[modulo].gateway.ts`
- [ ] Hook `useSocket` expone `{ isConnected, on, emit }` — NO expone `socket` directamente
- [ ] `on()` del hook se usa dentro de `useEffect` (retorna cleanup)
- [ ] El dominio NUNCA importa `socket.io` directamente (solo la infraestructura)
