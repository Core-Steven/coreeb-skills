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
pnpm add -D prisma
pnpm add @prisma/client
pnpm dlx prisma init --datasource-provider postgresql
pnpm add coreeb sonner tw-animate-css @tailwindcss/postcss tailwindcss
```

Estructura de módulos hexagonales en `src/modules/[modulo]/`:
- `domain/entities`, `domain/repositories`
- `application/dtos`, `application/use-cases`
- `infrastructure/repositories`
- `src/shared/infrastructure/prisma/prisma.client.ts`

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

### `.env` (no commitear):
```env
COMPOSE_PROJECT_NAME=mi_proyecto
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=appdb
DB_PORT=5432
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb?schema=public"
```

### Scripts en `package.json`:
```json
"dev": "npm run db:start && node scripts/wait-for-db.js && next dev",
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

## 4. Checklist
- [ ] `docker-compose.yml` con healthcheck creado
- [ ] `scripts/wait-for-db.js` creado
- [ ] Script `dev` ejecuta: `db:start → wait-for-db.js → next dev`
- [ ] `.env` configurado con `DATABASE_URL` local
- [ ] Instalación completa antes de codificar (Regla Cero)
- [ ] `next.config.mjs`, `postcss.config.mjs`, `globals.css`, `layout.tsx` configurados
- [ ] UI 100% `coreeb`, iconos Material Symbols, Spinner en loadings
- [ ] Prisma Singleton en `src/shared/infrastructure/prisma/prisma.client.ts`
- [ ] Route Handlers delegan a Casos de Uso. Sin lógica de negocio en ellos.
