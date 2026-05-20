---
name: coreeb-fullstack
description: Protocolo estricto para construir aplicaciones Fullstack usando Next.js, Prisma y la librería UI coreeb en este espacio de trabajo.
---

# COREEB — SKILL -FULLSTACK UNIFICADO

## ⚠️ DIRECTIVA SUPREMA
Este documento es la **ÚNICA FUENTE DE VERDAD**. Cualquier petición del usuario DEBE ejecutarse siguiendo este protocolo de forma automática.
- **Frontend y Backend:** Next.js (App Router) - Monorepo/Proyecto Unificado.
- **Backend API:** Route Handlers (`app/api/...`) en Next.js bajo **ARQUITECTURA HEXAGONAL ESTRICTA**.
- **ORM:** Prisma.
- **Frontend UI:** Next.js + Librería `coreeb` (NPM: https://www.npmjs.com/package/coreeb).
- **Paquetes:** pnpm obligatorio.

## 🚫 REGLA CERO: ANTES DE CUALQUIER ACCIÓN ES OBLIGATORIO LA INSTALACIÓN-PRIMERO
**PROHIBIDO** escribir código fuente sin haber completado el 100% de la instalación de dependencias, configuración de `.env` y scaffolding inicial. Si no está instalado, no existe.

1. **Estructura del Workspace:**
   Crear un único proyecto unificado de Next.js en la raíz del proyecto.

2. **Scaffolding del Proyecto Next.js Fullstack (desde Cero):**
   - Ejecutar la creación de Next.js: `pnpm dlx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --use-pnpm`.
   - Instalar Prisma: `pnpm add -D prisma tsx @types/node` y `pnpm add @prisma/client`.
   - Inicializar base de datos local SQLite: `pnpm dlx prisma init --datasource-provider sqlite`.
   - Ejecutar `pnpm dlx prisma generate` para generar los tipos del cliente.
   - Instalar librería UI y dependencias: `pnpm add coreeb sonner tw-animate-css @tailwindcss/postcss tailwindcss`.
   - Instalar dependencias de tiempo real: `pnpm add socket.io socket.io-client`.
   - Crear directorios de arquitectura hexagonal obligatorios para cada módulo:
     - `src/modules/[nombre-modulo]/domain/entities`
     - `src/modules/[nombre-modulo]/domain/repositories`
     - `src/modules/[nombre-modulo]/application/dtos`
     - `src/modules/[nombre-modulo]/application/use-cases`
     - `src/modules/[nombre-modulo]/infrastructure/repositories` (Implementaciones Prisma)
     - `src/modules/[nombre-modulo]/infrastructure/socket` (Gateways WebSocket por módulo)
     - `src/shared/infrastructure/prisma/prisma.client.ts` (Prisma Client Singleton)
     - `src/shared/infrastructure/socket/` (socket.server.ts, socket.types.ts, useSocket.ts)

## 1. Frontend & Configuración de Librería `coreeb` (NPM)
Para usar correctamente la librería de componentes `coreeb` (https://www.npmjs.com/package/coreeb), es **OBLIGATORIO** configurar los siguientes archivos de forma exacta en el orden indicado:

### A. **`next.config.mjs`** (en la raíz del proyecto):
```js
/** @type {import('next').NextConfig} */
const nextConfig = { transpilePackages: ['coreeb'] };
export default nextConfig;
```

### B. **`postcss.config.mjs`** (en la raíz del proyecto):
```js
const config = { plugins: { '@tailwindcss/postcss': {} } };
export default config;
```

### C. **`src/app/globals.css`**
El orden de los imports es **INNEGOCIABLE**. Si falta el directive `@source` apuntando a la librería en `node_modules`, Tailwind no escaneará `coreeb` y no se generará ninguna clase utilitaria (el diseño saldrá roto):
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

### D. **`src/app/layout.tsx`**
Es **OBLIGATORIO** incluir el `<link>` de Google Fonts para renderizar la iconografía y el componente `<Toaster>` en el layout raíz:
```tsx
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'coreeb';

export const metadata: Metadata = { title: 'Mi Proyecto' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
```

### E. Directrices de Estética Coreeb:
- **UI/UX:** Queda terminantemente prohibido usar estilos genéricos o componentes externos. TODO debe ser de la librería `coreeb` (documentación en https://www.npmjs.com/package/coreeb).
- **Iconos:** Usar siempre `<span className="material-symbols-outlined">nombre_icono</span>`.
- **Loading:** Todo estado de carga debe usar el `Spinner` de `72px` perfectamente centrado:
  ```tsx
  <div className="flex items-center justify-center min-h-[60vh]">
    <Spinner size={72} message="Cargando..." />
  </div>
  ```
- **Routing:** Uso estricto de `next/link` y `next/navigation`.
- **Variables:** Todas las variables de frontend deben usar el prefijo `NEXT_PUBLIC_`.

## 2. Backend: Next.js API Routes & Arquitectura Hexagonal Innegociable
- **Flujo:** Prisma -> Domain Entities/Repos -> Use Cases -> Route Handlers (Infrastructure Controllers).
- **Prisma Client Singleton:** Es **OBLIGATORIO** instanciar Prisma a través de un Singleton global en `src/shared/infrastructure/prisma/prisma.client.ts` para prevenir la saturación de conexiones en desarrollo:
  ```typescript
  import { PrismaClient } from '@prisma/client';
  const prismaClientSingleton = () => new PrismaClient();
  declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
  }
  const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
  export default prisma;
  if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
  ```
- **Controladores (Route Handlers):** Los archivos `src/app/api/[ruta]/route.ts` actúan únicamente como controladores de infraestructura. Deben capturar la petición, instanciar los repositorios y casos de uso, ejecutar el caso de uso y retornar el JSON respectivo con la gestión de excepciones adecuada.
- **Persistencia Agnóstica:** El código debe ser **100% agnóstico**. Debe permitir la migración de SQLite (dev) a PostgreSQL (prod) sin cambios en el código, solo modificando el `DATABASE_URL`. Prohibido SQL nativo (`$queryRaw`).
- **Desacoplamiento:** La lógica de negocio reside exclusivamente en los Casos de Uso. Los Route Handlers no contienen lógica de negocio.

## 3. Tiempo Real con Socket.IO

> Next.js App Router **no soporta WebSockets nativamente** en Route Handlers. La solución de producción es un **custom HTTP server** (`server.ts`) que expone Next.js y Socket.IO en el mismo puerto.

### Dependencias:
```bash
pnpm add socket.io socket.io-client
pnpm add -D tsx @types/node
```

### `scripts/dev.js` — Orquestador cross-platform (Windows + Unix):
```js
const { spawn } = require('child_process');

async function main() {
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
"start": "NODE_ENV=production tsx server.ts"
```

### A. `server.ts` (raíz del proyecto) — Custom HTTP Server:
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

### B. `src/shared/infrastructure/socket/socket.types.ts` — Contrato de eventos tipados:
```typescript
export interface ServerToClientEvents {
  [key: string]: (...args: unknown[]) => void;
  'notification': (payload: { message: string; type: 'info' | 'success' | 'error' }) => void;
}

export interface ClientToServerEvents {
  [key: string]: (...args: unknown[]) => void;
}
```

### C. `src/shared/infrastructure/socket/socket.server.ts` — Singleton del servidor IO:
```typescript
import type { Server as SocketIOServer } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from './socket.types';

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null = null;

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

export function getIO(): SocketIOServer<ClientToServerEvents, ServerToClientEvents> {
  if (!io) throw new Error('[Socket] Socket.IO no está inicializado.');
  return io;
}
```

### D. `src/modules/[modulo]/infrastructure/socket/[modulo].gateway.ts` — Gateway Hexagonal:
```typescript
import type { Server as SocketIOServer, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@/shared/infrastructure/socket/socket.types';
import { getIO } from '@/shared/infrastructure/socket/socket.server';

type TypedIO = SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export class [Modulo]Gateway {
  // ✅ Getter lazy: evita errores si se instancia antes de initSocketServer()
  private get io(): TypedIO { return getIO(); }

  broadcast<K extends keyof ServerToClientEvents>(event: K, ...args: Parameters<ServerToClientEvents[K]>) {
    this.io.emit(event as string, ...args);
  }

  emitToRoom<K extends keyof ServerToClientEvents>(room: string, event: K, ...args: Parameters<ServerToClientEvents[K]>) {
    this.io.to(room).emit(event as string, ...args);
  }

  registerHandlers(socket: TypedSocket) {
    // socket.on('room:join', (roomId) => socket.join(roomId));
  }
}
```

### Ejemplo — `src/modules/notifications/infrastructure/socket/notifications.gateway.ts`:
```typescript
import { getIO } from '@/shared/infrastructure/socket/socket.server';
import type { ServerToClientEvents } from '@/shared/infrastructure/socket/socket.types';

type NotificationType = ServerToClientEvents['notification'] extends (p: infer P) => void ? P['type'] : never;

export class NotificationsGateway {
  private get io() { return getIO(); }

  notifyAll(message: string, type: NotificationType = 'info') {
    this.io.emit('notification', { message, type });
  }

  notifyRoom(room: string, message: string, type: NotificationType = 'info') {
    this.io.to(room).emit('notification', { message, type });
  }
}


// Ejemplo de uso //
// export class CreateProductUseCase {
//   constructor(
//     private repo: ProductRepository,
//     private notifier: NotificationsGateway, // ← inyectado
//   ) {}
//   async execute(dto: CreateProductDto) {
//     const product = await this.repo.create(dto);
//     this.notifier.notifyAll(`Producto "${product.name}" creado`, 'success');
//     return product;
//   }
// }
```

### E. `src/shared/infrastructure/socket/useSocket.ts` — Hook del cliente:
```typescript
'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from './socket.types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

/**
 * @example
 * const { isConnected, on, emit } = useSocket();
 * useEffect(() => on('notification', (p) => toast(p.message)), [on]);
 */
export function useSocket({ namespace = '/', autoConnect = true } = {}) {
  const socketRef = useRef<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!autoConnect) return;
    const socket: TypedSocket = io(namespace, { path: '/api/socket', withCredentials: true });
    socketRef.current = socket;
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect_error', (err) => console.error('[Socket] Error:', err.message));
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [namespace, autoConnect]);


  const on = useCallback(
    <K extends keyof ServerToClientEvents>(event: K, handler: ServerToClientEvents[K]) => {
      socketRef.current?.on(event as string, handler as (...args: unknown[]) => void);
      return () => { socketRef.current?.off(event as string, handler as (...args: unknown[]) => void); };
    },
    [],
  );

  const emit = useCallback(
    <K extends keyof ClientToServerEvents>(event: K, ...args: Parameters<ClientToServerEvents[K]>) => {
      socketRef.current?.emit(event as string, ...args);
    },
    [],
  );

  return { isConnected, on, emit };
}
```

### Reglas del Gateway:
- El Gateway es **infraestructura**. No contiene lógica de negocio.
- Los Casos de Uso reciben el Gateway como **dependencia inyectada** (no lo instancian internamente).
- El dominio (Entidades, Repositorios, Casos de Uso) **NUNCA importa** `socket.io` directamente.
- Los Gateways usan `private get io() { return getIO(); }` — getter lazy, nunca en el constructor.
- El hook `useSocket` es solo para Client Components (`'use client'`).
- `on()` retorna cleanup — siempre consumir dentro de `useEffect`.

## 4. Checklist de Cumplimiento
- [ ] ¿Se creó el proyecto unificado de Next.js (App Router)?
- [ ] ¿Se instaló todo antes de codificar? (Regla Cero): incluye `socket.io`, `socket.io-client`, `tsx`, `prisma generate`
- [ ] ¿Se configuró `next.config.mjs` con `transpilePackages: ['coreeb']`?
- [ ] ¿Se configuró `postcss.config.mjs` with `@tailwindcss/postcss`?
- [ ] ¿`src/app/globals.css` tiene la ruta relativa `@source "../../node_modules/coreeb/dist"` y los imports en orden?
- [ ] ¿Se incluyó el link de Google Fonts e importó `<Toaster>` en `src/app/layout.tsx`?
- [ ] ¿La UI es 100% `coreeb` sin estilos inventados (https://www.npmjs.com/package/coreeb)?
- [ ] ¿Los iconos son Material Symbols Outlined?
- [ ] ¿Se implementó el Prisma Client Singleton global en `src/shared/infrastructure/prisma/prisma.client.ts`?
- [ ] ¿Los Route Handlers (`src/app/api/...`) actúan únicamente como controladores delegando a los Casos de Uso?
- [ ] ¿El backend es 100% agnóstico a la DB (SQLite → PostgreSQL)?
- [ ] ¿Los estados de carga usan el Spinner de 72px centrado?
- [ ] ¿`scripts/dev.js` existe como orquestador cross-platform (compatible Windows)?
- [ ] Script `dev` es `node scripts/dev.js` (NO usa `&&` directo en package.json)?
- [ ] ¿`server.ts` en raíz tiene `.catch()` — inicia Next.js + Socket.IO en el mismo puerto?
- [ ] ¿`socket.types.ts` define contratos tipados de eventos (`ServerToClientEvents`, `ClientToServerEvents`)?
- [ ] ¿`socket.server.ts` expone `initSocketServer()` y `getIO()` como Singleton?
- [ ] ¿Los Gateways usan getter lazy `private get io() { return getIO(); }` — no en constructor?
- [ ] ¿Hay un Gateway hexagonal por módulo en `src/modules/[modulo]/infrastructure/socket/`?
- [ ] ¿El hook `useSocket` expone `{ isConnected, on, emit }` — NO expone `socket` directamente?
- [ ] ¿`on()` del hook se usa dentro de `useEffect` (retorna cleanup)?
- [ ] ¿El dominio NUNCA importa `socket.io` directamente (solo la infraestructura)?
