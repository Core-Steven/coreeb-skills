---
name: coreeb-fullstack
description: Protocolo Next.js, Prisma, PostgreSQL y coreeb UI bajo Clean Architecture.
---

# COREEB — SKILL CLEAN ARCHITECTURE

## DIRECTIVA SUPREMA
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

## ESTRUCTURA DE DIRECTORIOS — CLEAN ARCHITECTURE

> Todo proyecto generado con esta skill sigue esta estructura modular. Cada módulo es independiente y vive dentro de `API/` o `Views/`.

### Estructura de carpetas (OBLIGATORIA)
```
src/
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

### Reglas que nunca se rompen
1. `app/` solo tiene pages y API routes delgadas — **nunca** lógica de negocio.
2. `API/[Modulo]/router/` recibe la request y delega a `Servicios/` — **nunca** accede a la BD directamente.
3. `API/[Modulo]/Servicios/` contiene toda la lógica de negocio y acceso a Prisma.
4. `Views/` **nunca** importa de `API/` directamente — consume datos via fetch/axios a los endpoints de `app/`.
5. `Components/`, `Hooks/` y `Helpers/` globales son solo para código verdaderamente compartido entre módulos.
6. Cada módulo en `Views/` tiene sus propios `Components/`, `Hooks/` y `Helpers/` locales.

### ¿Dónde pongo esto?

| Lo que necesitas crear                   | Va en                                          |
| ---------------------------------------- | ---------------------------------------------- |
| Una nueva página                         | `app/[modulo]/page.tsx`                        |
| Un nuevo endpoint API                    | `app/api/[modulo]/route.ts`                    |
| Lógica de negocio o acceso a BD          | `API/[Modulo]/Servicios/`                      |
| Controlador del endpoint                 | `API/[Modulo]/router/`                         |
| Vista / UI de un módulo                  | `Views/[Modulo]/`                              |
| Componente reutilizable del módulo       | `Views/[Modulo]/Components/`                   |
| Hook específico del módulo               | `Views/[Modulo]/Hooks/`                        |
| Helper específico del módulo             | `Views/[Modulo]/Helpers/`                      |
| Componente compartido entre módulos      | `Components/`                                  |
| Hook compartido entre módulos            | `Hooks/`                                       |
| Helper compartido entre módulos          | `Helpers/`                                     |

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
COMPOSE_PROJECT_NAME=coreeb_proyectos
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=appdb
DB_PORT=5432

# === VARIABLES EXCLUSIVAS DEL PROYECTO (NEXT.JS / PRISMA) ===
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb?schema=public"
NEXT_PUBLIC_COREEB_LOGIN_API= # Producción: URL del Coreeb Backend 
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
Esta es la importación base y obligatoria para todos los desarrollos de COREEB.

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

## 3. AUTENTICACIÓN — INTEGRACIÓN CON COREEB AUTH SERVICE

> [!IMPORTANT]
> **REGLA CRÍTICA:** Todo proyecto generado con esta skill **DEBE** conectar su sistema de login al **Coreeb Auth Service centralizado** (backend Express independiente). El frontend **NUNCA** maneja autenticación propia, encriptación de contraseñas ni base de datos de usuarios directamente. Solo consume el Auth Service mediante API.

---

### A. Variable de Entorno Obligatoria (`.env`)
Agregar al `.env` del proyecto:
```env
NEXT_PUBLIC_COREEB_LOGIN_API= # Producción: URL del Coreeb Backend 
```
> La URL real del Auth Service se configura aquí. **Nunca hardcodear URLs en el código.**

---

### B. **`src/Helpers/apiClient.ts`** — Cliente HTTP centralizado
```typescript
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_COREEB_LOGIN_API!;

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AUTH_SKIP_REFRESH = ['/auth/login', '/auth/refresh', '/auth/reset-password'];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const url: string = error.config?.url ?? '';
    const isAuthRoute = AUTH_SKIP_REFRESH.some((p) => url.includes(p));

    if (error.response?.status === 401 && !isAuthRoute) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = '/';
        return Promise.reject(error);
      }
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        error.config.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api.request(error.config);
      } catch {
        localStorage.clear();
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

### C. **`src/API/auth/Servicios/auth.service.ts`**
```typescript
import api from '@/Helpers/apiClient';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data.data;
  },
  me: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data.data;
  },
  requestReset: async (email: string): Promise<{ resetToken: string }> => {
    const { data } = await api.post('/auth/reset-password/request', { email });
    return data.data;
  },
  confirmReset: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password/confirm', { token, newPassword });
  },
};
```

---

### D. Reglas de integración (NO negociables)
- La URL del Auth Service **siempre** viene de `NEXT_PUBLIC_COREEB_LOGIN_API` — nunca hardcodeada en el código.
- Los tokens (`accessToken`, `refreshToken`, `user`) se almacenan en `localStorage` tras un login exitoso.
- El interceptor de Axios **auto-refresca** el `accessToken` en cualquier 401, excepto en rutas de auth.
- Las rutas `/auth/login`, `/auth/refresh` y `/auth/reset-password` están en `AUTH_SKIP_REFRESH` — **no** disparan el refresco automático para evitar bucles infinitos.
- Toda pantalla protegida debe verificar `localStorage.getItem('accessToken')` en `useEffect` y redirigir a `/` si no existe.
- El diseño del formulario de login y cualquier pantalla de autenticación queda **USANDO LA LIBRERIA DE COREEB**. Solo es obligatorio que la conexión al Auth Service use `apiClient.ts` y `auth.service.ts`.
- Toda creación, actualización, desactivación o activación de usuarios **debe pasar siempre** por el Coreeb Auth Service — nunca manejar usuarios directamente en el frontend ni en otros backends.

---

## 5. Checklist de Cumplimiento
- [ ] Scaffolding inicial y dependencias instaladas.
- [ ] Base de datos PostgreSQL levantada en Docker en segundo plano (`docker compose up -d db`).
- [ ] Servidor de desarrollo Next.js ejecutándose localmente de forma nativa (`next dev`).
- [ ] Clean Architecture estructurada con carpetas compartidas y módulos independientes.
- [ ] API routes de Next.js delegando mediante re-exports directos al API del módulo.
- [ ] Frontend routes de Next.js delegando al renderizado de componentes dentro de Views.
- [ ] Conexión a base de datos gestionada por el Prisma Singleton en localhost.
- [ ] Interfaz construida exclusivamente con componentes e iconos de la librería coreeb.
- [ ] `NEXT_PUBLIC_COREEB_LOGIN_API` definida en `.env` apuntando al Coreeb Auth Service.
- [ ] `apiClient.ts` configurado con interceptores de token y auto-refresco, usando `AUTH_SKIP_REFRESH`.
- [ ] `auth.service.ts` implementado con `login`, `me`, `requestReset`, `confirmReset`.
- [ ] Formulario de login llama a `authService.login` y guarda los tokens en `localStorage`.
- [ ] Rutas protegidas verifican `accessToken` en `localStorage` y redirigen a `/` si no existe.
