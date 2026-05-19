---
name: coreeb-fullstack
description: Protocolo estricto para construir aplicaciones Fullstack usando Next.js, Prisma, PostgreSQL con Docker y la librería UI coreeb.
---

# COREEB — SKILL FULLSTACK UNIFICADO

## ⚠️ DIRECTIVA SUPREMA
Este documento es la **ÚNICA FUENTE DE VERDAD**. Cualquier petición del usuario DEBE ejecutarse siguiendo este protocolo de forma automática.
- **Frontend y Backend:** Next.js (App Router) - Proyecto Unificado.
- **Backend API:** Route Handlers (`src/app/api/...`) bajo **ARQUITECTURA HEXAGONAL ESTRICTA**.
- **ORM:** Prisma.
- **Base de Datos:** PostgreSQL **SIEMPRE** — tanto en local como en producción.
- **Entorno Local:** PostgreSQL levantado con **Docker Compose** (`pnpm dev` lo arranca todo automáticamente).
- **Entorno Producción:** Cambiar únicamente `DATABASE_URL` en las variables de entorno. El código NO cambia.
- **Frontend UI:** Next.js + Librería `coreeb` (NPM: https://www.npmjs.com/package/coreeb).
- **Paquetes:** pnpm obligatorio.

## 🚫 REGLA CERO: ANTES DE CUALQUIER ACCIÓN ES OBLIGATORIO LA INSTALACIÓN-PRIMERO
**PROHIBIDO** escribir código fuente sin haber completado el 100% de la instalación de dependencias, configuración de `.env` y scaffolding inicial. Si no está instalado, no existe.

1. **Estructura del Workspace:**
   Crear un único proyecto unificado de Next.js en la raíz del proyecto.

2. **Scaffolding del Proyecto Next.js Fullstack (desde Cero):**
   - Crear el proyecto Next.js: `pnpm dlx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --use-pnpm`.
   - Instalar Prisma: `pnpm add -D prisma` y `pnpm add @prisma/client`.
   - Inicializar Prisma con PostgreSQL: `pnpm dlx prisma init --datasource-provider postgresql`.
   - Instalar librería UI y dependencias: `pnpm add coreeb sonner tw-animate-css @tailwindcss/postcss tailwindcss`.
   - Crear directorios de arquitectura hexagonal para cada módulo:
     - `src/modules/[nombre-modulo]/domain/entities`
     - `src/modules/[nombre-modulo]/domain/repositories`
     - `src/modules/[nombre-modulo]/application/dtos`
     - `src/modules/[nombre-modulo]/application/use-cases`
     - `src/modules/[nombre-modulo]/infrastructure/repositories`
     - `src/shared/infrastructure/prisma/prisma.client.ts` (Prisma Client Singleton)

## 1. Docker & Base de Datos: PostgreSQL con Docker Compose
**OBLIGATORIO** en todo proyecto. Se deben crear estos archivos antes de escribir cualquier línea de código de la aplicación.

### A. **`docker-compose.yml`** (raíz del proyecto — se commitea):
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

volumes:
  postgres_data:
```

### B. **`.env`** (raíz del proyecto — NO se commitea):
```env
COMPOSE_PROJECT_NAME=mi_proyecto
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=appdb
DB_PORT=5432

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb?schema=public"
```
> **Para pasar a producción:** Solo reemplaza `DATABASE_URL` con la URL de tu base de datos en la nube (Neon, Railway, Supabase, etc.). El código y el schema de Prisma **NO cambian**.

### C. **`.env.example`** (raíz del proyecto — se commitea como referencia):
```env
COMPOSE_PROJECT_NAME=mi_proyecto
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=appdb
DB_PORT=5432

# Local (Docker):
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb?schema=public"

# Producción (reemplazar con tu URL real):
# DATABASE_URL="postgresql://usuario:password@servidor:5432/db_prod?schema=public"
```

### D. Scripts en **`package.json`** (agregar al objeto `scripts`):
```json
"dev": "npm run db:start && next dev",
"db:start": "docker compose up -d",
"db:stop": "docker compose down",
"db:reset": "docker compose down -v && docker compose up -d",
"db:migrate": "prisma migrate dev",
"db:studio": "prisma studio"
```
> Con este setup, `pnpm dev` levanta el contenedor de PostgreSQL **automáticamente** y luego arranca Next.js. Un solo comando para tener todo el entorno listo.

## 2. Frontend & Configuración de Librería `coreeb` (NPM)
Para usar correctamente la librería de componentes `coreeb` (https://www.npmjs.com/package/coreeb), es **OBLIGATORIO** configurar los siguientes archivos de forma exacta en el orden indicado:

### A. **`next.config.mjs`**:
```js
/** @type {import('next').NextConfig} */
const nextConfig = { transpilePackages: ['coreeb'] };
export default nextConfig;
```

### B. **`postcss.config.mjs`**:
```js
const config = { plugins: { '@tailwindcss/postcss': {} } };
export default config;
```

### C. **`src/app/globals.css`**
El orden de los imports es **INNEGOCIABLE**. Sin el directive `@source`, Tailwind no escaneará `coreeb` y el diseño saldrá roto:
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

### D. **`src/app/layout.tsx`**:
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

### E. Reglas de UI:
- **Componentes:** Solo librería `coreeb`. Prohibido usar estilos o componentes externos.
- **Iconos:** `<span className="material-symbols-outlined">nombre_icono</span>`.
- **Loading:** Spinner de 72px centrado:
  ```tsx
  <div className="flex items-center justify-center min-h-[60vh]">
    <Spinner size={72} message="Cargando..." />
  </div>
  ```
- **Routing:** Solo `next/link` y `next/navigation`.
- **Variables de entorno del frontend:** Siempre con prefijo `NEXT_PUBLIC_`.

## 3. Backend: Arquitectura Hexagonal Innegociable
- **Flujo:** Prisma → Repos → Use Cases → Route Handlers.
- **Prisma Client Singleton** en `src/shared/infrastructure/prisma/prisma.client.ts`:
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
- **Route Handlers** (`src/app/api/[ruta]/route.ts`): Solo capturan la petición y delegan al caso de uso. Cero lógica de negocio.
- **Persistencia Agnóstica:** Prohibido SQL nativo (`$queryRaw`). Para producción, solo cambiar `DATABASE_URL`.
- **Desacoplamiento total:** Lógica de negocio solo en los Casos de Uso.

## 4. Checklist de Cumplimiento
- [ ] ¿Existe `docker-compose.yml` con el servicio `db` de PostgreSQL?
- [ ] ¿Existe `.env` con `DATABASE_URL` apuntando al contenedor local?
- [ ] ¿Existe `.env.example` commiteado con los valores de ejemplo?
- [ ] ¿El script `dev` en `package.json` ejecuta `db:start` antes de `next dev`?
- [ ] ¿Se instaló todo antes de codificar? (Regla Cero)
- [ ] ¿`next.config.mjs` tiene `transpilePackages: ['coreeb']`?
- [ ] ¿`postcss.config.mjs` tiene el plugin `@tailwindcss/postcss`?
- [ ] ¿`globals.css` tiene `@source "../../node_modules/coreeb/dist"` y los imports en orden?
- [ ] ¿`layout.tsx` tiene el link de Google Fonts y el `<Toaster>`?
- [ ] ¿La UI es 100% `coreeb` (https://www.npmjs.com/package/coreeb)?
- [ ] ¿Los iconos son Material Symbols Outlined?
- [ ] ¿Existe el Prisma Client Singleton en `src/shared/infrastructure/prisma/prisma.client.ts`?
- [ ] ¿Los Route Handlers solo delegan a los Casos de Uso?
- [ ] ¿Para producción solo cambia `DATABASE_URL`? (código sin cambios)
- [ ] ¿Los estados de carga usan el Spinner de 72px centrado?
