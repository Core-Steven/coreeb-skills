---
name: coreeb-fullstack
description: Protocolo Next.js, Prisma, PostgreSQL y coreeb UI bajo Clean Architecture.
---

# COREEB — SKILL CLEAN ARCHITECTURE

## ⚠️ DIRECTIVA SUPREMA
- **Frontend y Backend:** Next.js (App Router).
- **Arquitectura:** **Clean Architecture** modular.
- **ORM:** Prisma + PostgreSQL.
- **Entorno local:** PostgreSQL en Docker + Next.js local (`next dev`).
- **UI:** Librería `coreeb` exclusivamente.
- **Paquetes:** pnpm.
- **Verificación de Dependencias Previa:** Antes de comenzar a escribir cualquier archivo de código, el agente **DEBE** revisar el archivo `package.json` de la raíz. Si no están presentes las dependencias obligatorias (`coreeb`, `sonner`, `tw-animate-css`, `axios`, `@prisma/client`, `prisma`, `tsx`, `@types/node`), el agente **debe proceder a instalarlas automáticamente** mediante `pnpm` antes de realizar otra tarea.
- **Estilo de Páginas Obligatorio:** Cada página, vista, formulario y sub-componente frontend generado **DEBE** seguir y heredar rigurosamente el sistema de diseño, la maquetación, los iconos y la estética unificada de la librería `coreeb` de forma obligatoria.

> [!IMPORTANT]
> **GUÍA DE ESTILOS GLOBALES (`coreeb` UI Base):**
> Para proyectos desde cero, el agente **debe generar una base de CSS limpia y bien documentada en `globals.css`** (por ejemplo, implementando clases de scrollbar personalizadas como `.custom-scrollbar` para las tablas, resets de diseño compatibles o utilidades específicas) para que sirva de guía y ejemplo a los desarrolladores.
> Sin embargo, **toda esta base y cualquier estilo creado debe estar en estricta sincronía con la librería `coreeb`**, heredando y respetando siempre sus tokens, variables, inputs y estructura para que actúe como una extensión natural del sistema de diseño oficial, y nunca como estilos conflictivos.

---

## 📦 INSTALACIÓN & DEPENDENCIAS (Solo para Proyectos desde Cero)
```bash
pnpm add coreeb sonner tw-animate-css axios
pnpm add @prisma/client
pnpm add -D prisma tsx @types/node
pnpm dlx prisma init --datasource-provider postgresql
```

---

## 📁 ESTRUCTURA DE DIRECTORIOS
```
src
├── Components/         # Componentes comunes globales
├── Hooks/              # Hooks comunes globales
├── Helpers/            # Helpers comunes globales
├── app/                # Enrutador (Pages y Endpoints API delgados)
├── API/                # Capa lógica de Datos y Backend por módulo
│     └── [Modulo]/
│           ├── router/    # Controladores de endpoints
│           └── Servicios/ # Lógica de negocio y base de datos
└── Views/              # Capa de Presentación (UI) por módulo
      └── [Modulo]/
            ├── Components/
            ├── Hooks/
            └── Helpers/
```

---

## 1. CONFIGURACIÓN DOCKER & ENTORNO

### A. **`docker-compose.yml`**
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

volumes:
  postgres_data:
```

### B. **`.env`**
```env
# === VARIABLES EXCLUSIVAS DE DOCKER COMPOSE ===
COMPOSE_PROJECT_NAME=coreeb_proyecto
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=appdb
DB_PORT=5432

# === VARIABLES EXCLUSIVAS DEL PROYECTO (NEXT.JS / PRISMA) ===
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb?schema=public"
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000
```

### C. Scripts en **`package.json`**
```json
"scripts": {
  "dev": "docker compose up -d db && next dev",
  "build": "next build",
  "start": "next start",
  "db:migrate": "prisma migrate dev",
  "db:studio": "prisma studio"
}
```

---

## 2. CONFIGURACIÓN DE LIBRERÍA `coreeb` (UI)

### A. **`next.config.mjs`**
```js
const nextConfig = { transpilePackages: ['coreeb'] };
export default nextConfig;
```

### B. **`postcss.config.mjs`**
```js
const config = { plugins: { '@tailwindcss/postcss': {} } };
export default config;
```

### C. **`src/app/globals.css`**
Esta es la importación base y obligatoria para todos los desarrollos de COREEB. Cualquier estilo adicional de maquetación (como scrollbars, resets extra o tokens específicos) lo agregará libremente cada desarrollador debajo de estas importaciones según las necesidades del proyecto.

```css
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));
@import "coreeb/styles.css";

/* Cualquier estilo específico del proyecto va aquí debajo */
```

### D. **`src/app/layout.tsx`**
```tsx
import './globals.css';
import { Toaster } from 'coreeb';

export const metadata = { title: 'App' };

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

### E. **CATÁLOGO DE COMPONENTES `coreeb` (Obligatorio)**
Para que el proyecto tenga una apariencia uniforme y agradable desde el inicio, todo el diseño y maquetación de vistas y formularios debe utilizar los componentes nativos de `coreeb`:

* **General / Layout:** `Icons`, `Button`, `Badge`, `Separator`, `Skeleton`, `Spinner`, `Visually Hidden`, `Card`, `Collapsible`, `Scroll Area`, `Tabs`.
* **Formularios:** `Floating Input`, `Floating Select`, `Floating Date Picker`, `Chip Selector`, `Checkbox`, `Form`, `Radio Group`, `Switch`, `Textarea`, `File Dropzone`, `Date Range Pill`.
* **Data Display & Feedback:** `Avatar`, `Table`, `Sonner (Toast)` (Toaster), `Tooltip`.
* **Overlay:** `Command`, `Dialog`, `Dropdown Menu`, `Popover`, `Sheet`.

*Nota: La interfaz debe crearse inicialmente al 100% usando estos componentes. La navegación general y la distribución de paneles de cada vista debe estar perfectamente coordinada con el estilo de pestañas de la aplicación, utilizando los componentes `Tabs` y `Sheet` de la librería de forma estricta. Cambios o personalizaciones se aplican después a petición del desarrollador.*

---

## 3. GUÍA DE DESARROLLO CLEAN ARCHITECTURE

### A. Prisma Singleton (`src/shared/infrastructure/prisma/prisma.client.ts`)
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = globalThis.prismaGlobal ?? new PrismaClient();
export default prisma;
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
```

### B. Capa Lógica y Datos (API)

#### Servicio: `src/API/productos/Servicios/producto.service.ts`
```typescript
import prisma from '@/shared/infrastructure/prisma/prisma.client';

export class ProductoService {
  async obtenerTodos() {
    return prisma.producto.findMany();
  }
}
```

#### Router modular: `src/API/productos/router/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { ProductoService } from '../Servicios/producto.service';

const service = new ProductoService();

export async function GET() {
  try {
    return NextResponse.json(await service.obtenerTodos());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### Endpoint Next.js Router: `src/app/api/productos/route.ts`
```typescript
export { GET } from '@/API/productos/router/route';
```

### C. Capa de Presentación (Views)

#### Hook de Vista: `src/Views/productos/Hooks/useProducts.ts`
```typescript
'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useProducts() {
  const [productos, setProductos] = useState([]);

  const cargarProductos = async () => {
    try {
      const { data } = await axios.get('/api/productos');
      setProductos(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  return { productos, cargarProductos };
}
```

#### Componente de Vista: `src/Views/productos/Components/ProductList.tsx`
```tsx
'use client';
import { useProducts } from '../Hooks/useProducts';
import { Card } from 'coreeb';

export function ProductList() {
  const { productos } = useProducts();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {productos.map((p: any) => (
        <Card key={p.id} className="p-4">
          <h3>{p.nombre}</h3>
          <p>${p.precio}</p>
        </Card>
      ))}
    </div>
  );
}
```

#### Frontend Router: `src/app/productos/page.tsx`
```tsx
import { ProductList } from '@/Views/productos/Components/ProductList';

export default function Page() {
  return <ProductList />;
}
```

---

## 4. Checklist de Cumplimiento
- [ ] Scaffolding inicial y dependencias instaladas.
- [ ] Base de datos PostgreSQL levantada en Docker en segundo plano (`docker compose up -d db`).
- [ ] Servidor de desarrollo Next.js ejecutándose localmente de forma nativa (`next dev`).
- [ ] Clean Architecture estructurada con carpetas compartidas y módulos independientes.
- [ ] API routes de Next.js delegando mediante re-exports directos al API del módulo.
- [ ] Frontend routes de Next.js delegando al renderizado de componentes dentro de Views.
- [ ] Conexión a base de datos gestionada por el Prisma Singleton en localhost.
- [ ] Interfaz construida exclusivamente con componentes e iconos de la librería coreeb.
