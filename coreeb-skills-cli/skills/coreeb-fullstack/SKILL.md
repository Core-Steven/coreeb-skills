---
name: coreeb-fullstack
description: Protocolo Next.js
---

# COREEB — SKILL

## PRIORIDADES
**Simplicidad > Legibilidad > Mantenibilidad > Reutilización > Consistencia.**
La solución más simple es casi siempre la correcta.

---

## DIRECTIVA SUPREMA
- **Frontend:** Next.js (App Router).
- **Arquitectura:** Estructura modular organizada en 4 niveles (Routing, Modules, Global UI, Infrastructure).
- **UI:** Librería `coreeb` exclusivamente. Siempre buscar en `coreeb` antes de crear cualquier componente. La librería ya incluye Tailwind CSS internamente.
- **Paquetes:** pnpm exclusivamente. Nunca usar npm ni yarn.
- **Verificación de Dependencias Previa:** Antes de comenzar a escribir cualquier archivo de código, el agente **DEBE** revisar el archivo `package.json` de la raíz. Si no están presentes las dependencias obligatorias (`coreeb`, `sonner`, `tw-animate-css`, `axios`), el agente **debe instalarlas automáticamente** mediante `pnpm add` antes de realizar otra tarea.
- **Estilo de Páginas Obligatorio:** Cada página, vista, formulario y sub-componente **DEBE** construirse con componentes de `coreeb`. No se permite usar otras librerías de UI ni estilos en línea.

> [!IMPORTANT]
> **REGLA DE UI:**
> 1. **`coreeb` primero y único** — si existe un componente en `coreeb` que cubre la necesidad, usarlo obligatoriamente. La librería ya incluye Tailwind CSS.
> 2. **CSS custom solo como último recurso** — únicamente para casos excepcionales que `coreeb` no puede cubrir (ej. `.custom-scrollbar`).

---

## REGLAS DE DESARROLLO

### Arquitectura
- Seguir estrictamente la estructura de proyecto existente.
- No inventar nuevas carpetas ni cambiar la organización del proyecto.
- No introducir patrones de diseño que no estén ya en uso.
- Antes de crear algo nuevo, verificar si ya existe algo reutilizable.

### Componentes
- Los componentes son responsables únicamente del renderizado. **Cero lógica de negocio dentro de componentes.**
- Los componentes deben ser pequeños, fáciles de leer y fáciles de mantener.
- Si un componente empieza a crecer con lógica, moverla inmediatamente a su hook.

### Hooks
- Cada componente tiene su propio hook dedicado.
- Toda la lógica vive dentro del hook: estado, handlers, efectos, cálculos, valores derivados, llamadas a servicios.
- Los hooks deben ser simples. Si un hook crece demasiado, dividir su responsabilidad.
- Todos los hooks deben estar listos para integrarse con un backend real.

### Servicios
- Todos los datos deben obtenerse a través de servicios (`lib/api/` del módulo o `src/lib/api/` global).
- **Nunca** hacer llamadas HTTP directamente desde componentes o hooks.
- Los servicios son responsables de: consumir APIs, obtener/enviar datos, transformar respuestas.
- Aunque existan datos mock inicialmente, la estructura debe estar lista para un backend real.

### Tipos
- Cada tipo va en un archivo `index.ts` dentro de una carpeta `types/`.
- Los tipos locales de un módulo van en `src/modules/[module]/[action]/lib/types/index.ts`.
- Los tipos globales compartidos van en `src/lib/types/index.ts`.

### Código
- Explícito sobre "inteligente".
- Funciones pequeñas, archivos pequeños, nombres descriptivos.
- Sin funciones demasiado genéricas, sin abstracciones innecesarias, sin optimizaciones prematuras.

### Reutilización
Antes de crear cualquier cosa nueva, verificar si ya existe — especialmente para:
buttons, tables, inputs, selects, modals, cards, badges, pagination, dialogs, empty states, loaders, alerts, shared components.
**Siempre reutilizar antes de crear.**

### Aislamiento de Módulos
- No modificar ningún otro módulo fuera del solicitado.
- Solo trabajar dentro del módulo solicitado.
- Sin refactorizaciones fuera del alcance de la tarea.

### Backend Readiness
- Los servicios deben poder reemplazar datos mock con llamadas API reales fácilmente.
- La UI nunca debe depender de datos hardcodeados.

### Librerías
- Usar las librerías existentes: Axios (via `apiClient.ts`), date-fns.
- No instalar nuevas dependencias a menos que sea estrictamente necesario y autorizado.
- Gestionar paquetes siempre con `pnpm`.

### Lenguaje
Todo el código debe estar escrito en **inglés**: variables, funciones, interfaces, types, enums, componentes, hooks, servicios, carpetas, archivos.
El texto mostrado al usuario puede seguir el idioma del proyecto.

### Comentarios
**No escribir comentarios.** El código debe ser autoexplicativo mediante buenos nombres y organización.

---

## ✅ CHECKLIST ANTES DE GENERAR CÓDIGO
- [ ] ¿Existe un componente en `coreeb` que cubre la necesidad?
- [ ] ¿Existe un componente reutilizable en el proyecto?
- [ ] ¿Existe un hook reutilizable?
- [ ] ¿Existe un servicio reutilizable?
- [ ] ¿Estoy respetando la estructura actual del proyecto?
- [ ] ¿Toda la lógica está dentro de hooks?
- [ ] ¿Todas las llamadas HTTP están dentro de servicios?
- [ ] ¿Estoy usando `coreeb` para todos los componentes UI?
- [ ] ¿Todo el código está escrito en inglés?
- [ ] ¿La solución es simple?
- [ ] ¿Estoy evitando over-engineering?
- [ ] ¿Solo estoy modificando el módulo solicitado?

**Si alguna respuesta es No — corregir antes de generar código.**

---

## 📦 INSTALACIÓN & DEPENDENCIAS

```bash
pnpm add coreeb@latest
```

> [!IMPORTANT]
> Usar **siempre `pnpm`**. Nunca usar `npm install` ni `yarn add`.

---

## ESTRUCTURA DE DIRECTORIOS (OBLIGATORIA)

> Esta es la estructura exacta del proyecto. No agregar, renombrar ni reorganizar carpetas.

```
POINT-FRONT-V1/
├── pnpm-workspace.yaml          # pnpm v11 config
├── next.config.ts
├── tsconfig.json                # Path alias @/* → ./src/*
├── postcss.config.mjs
└── src/
    ├── app/                     # ── LEVEL 1: Routing (App Router)
    │   ├── globals.css          # Global styles and design tokens
    │   ├── layout.tsx           # Root HTML shell
    │   ├── page.tsx             # Initial redirect to /dashboard
    │   └── (pages)/             # Authenticated route group
    │       ├── layout.tsx       # Sidebar + Header + <main>
    │       ├── dashboard/page.tsx
    │       ├── campanas/
    │       │   ├── page.tsx
    │       │   ├── create/page.tsx
    │       │   └── [id]/
    │       │       ├── page.tsx
    │       │       └── edit/page.tsx
    │       ├── mi-cuenta/
    │       │   ├── page.tsx
    │       │   ├── create/page.tsx
    │       │   └── [id]/page.tsx
    │       ├── monitoreo-bdd/page.tsx
    │       ├── planner/
    │       │   ├── page.tsx
    │       │   └── create/page.tsx
    │       ├── visual-senalizacion/
    │       │   ├── page.tsx
    │       │   ├── create/page.tsx
    │       │   └── [id]/page.tsx
    │       ├── software-pdv/page.tsx
    │       ├── experiencia-cliente/page.tsx
    │       └── administracion/page.tsx
    │
    ├── modules/                 # ── LEVEL 2: Business Logic per Module
    │   │   # Patrón uniforme en cada acción CRUD (list · create · detail · edit):
    │   │   ├── screens/         # Full view (imported by page.tsx)
    │   │   ├── components/      # Local components of the action
    │   │   ├── hooks/           # Data fetching and local state
    │   │   ├── helpers/         # Pure functions and formatters
    │   │   └── lib/
    │   │       ├── api/         # HTTP client and data requests
    │   │       └── types/       # Domain TypeScript types (index.ts)
    │   │
    │   ├── campanas/{list,create,detail,edit}/
    │   ├── mi-cuenta/{list,create,detail}/
    │   ├── monitoreo-bdd/list/
    │   ├── planner/{list,create}/
    │   ├── visual-senalizacion/{list,create,detail}/
    │   ├── software-pdv/list/
    │   ├── experiencia-cliente/list/
    │   └── administracion/list/
    │
    ├── components/              # ── LEVEL 3: Global Shared UI
    │   ├── Sidebar.tsx          # Side navigation bar
    │   └── Header.tsx           # Top bar (profile, notifications)
    │
    └── lib/                     # ── LEVEL 4: Infrastructure & Utilities
        ├── api/                 # HTTP client and data requests
        └── types/               # Global TypeScript types (index.ts)
```

### Reglas que nunca se rompen
1. **LEVEL 1 — Routing (`src/app/`)**: Solo `page.tsx` y `layout.tsx`. Cada `page.tsx` es un contenedor delgado que importa y renderiza el `Screen` de LEVEL 2. Cero lógica aquí.
2. **LEVEL 2 — Modules (`src/modules/`)**: Toda la lógica de negocio, hooks, helpers y subcomponentes organizados por módulo y acción. Cada acción tiene `screens/`, `components/`, `hooks/`, `helpers/` y `lib/{api,types}`.
3. **LEVEL 3 — Global UI (`src/components/`)**: Solo componentes de UI compartidos globalmente (`Sidebar.tsx`, `Header.tsx`).
4. **LEVEL 4 — Infrastructure (`src/lib/`)**: Cliente HTTP global (`src/lib/api/`) y tipos globales (`src/lib/types/index.ts`).
5. **Solo los módulos definidos:** `campanas`, `mi-cuenta`, `monitoreo-bdd`, `planner`, `visual-senalizacion`, `software-pdv`, `experiencia-cliente`, `administracion`. No agregar módulos no listados.

### ¿Dónde pongo esto?

| Lo que necesitas crear                  | Va en                                                             |
| --------------------------------------- | ----------------------------------------------------------------- |
| Una nueva ruta/página                   | `src/app/(pages)/[modulo]/page.tsx`                               |
| Vista principal (Screen) de una acción  | `src/modules/[modulo]/[action]/screens/[ScreenName].tsx`          |
| Componente local de una acción          | `src/modules/[modulo]/[action]/components/`                       |
| Hook de una acción                      | `src/modules/[modulo]/[action]/hooks/`                            |
| Helper de una acción                    | `src/modules/[modulo]/[action]/helpers/`                          |
| Servicio/cliente HTTP de una acción     | `src/modules/[modulo]/[action]/lib/api/`                          |
| Tipos locales de una acción             | `src/modules/[modulo]/[action]/lib/types/index.ts`                |
| Componente global reutilizable          | `src/components/`                                                 |
| Cliente HTTP global                     | `src/lib/api/`                                                    |
| Tipos globales compartidos              | `src/lib/types/index.ts`                                          |

---

## 1. CONFIGURACIÓN DE LIBRERÍA `coreeb` (UI)

### A. **`next.config.ts`**
```ts
const nextConfig = { transpilePackages: ['coreeb'] };
export default nextConfig;
```

### B. **`postcss.config.mjs`**
```js
const config = { plugins: { '@tailwindcss/postcss': {} } };
export default config;
```

### C. **`src/app/globals.css`**
```css
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));
@import "coreeb/styles.css";

/* Project-specific styles below */
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

### E. **CATÁLOGO DE COMPONENTES `coreeb`**

> [!IMPORTANT]
> **Siempre consultar este catálogo antes de crear cualquier componente UI.** Si existe en `coreeb`, usarlo obligatoriamente.

- **General / Layout:** `Icons`, `Button`, `Badge`, `Separator`, `Skeleton`, `Spinner`, `Visually Hidden`, `Card`, `Collapsible`, `Scroll Area`, `Tabs`.
- **Formularios:** `Floating Input`, `Floating Select`, `Floating Date Picker`, `Chip Selector`, `Checkbox`, `Form`, `Radio Group`, `Switch`, `Textarea`, `File Dropzone`, `Date Range Pill`.
- **Data Display & Feedback:** `Avatar`, `Table`, `Sonner (Toast)` (Toaster), `Tooltip`.
- **Overlay:** `Command`, `Dialog`, `Dropdown Menu`, `Popover`, `Sheet`.

La interfaz se construye al 100% con estos componentes. La navegación y distribución de paneles usa `Tabs` y `Sheet` de `coreeb` de forma estricta.

---

## 2. Checklist de Cumplimiento del Proyecto
- [ ] Estructura de directorios POINT-FRONT-V1 respetada exactamente.
- [ ] Dependencias instaladas con `pnpm add`.
- [ ] `coreeb` usada en todo componente UI — consultado el catálogo antes de crear.
- [ ] Las rutas en `src/app/` son contenedores delgados que importan `Screen` desde `src/modules/`.
- [ ] Todo el código en inglés (variables, funciones, archivos, carpetas).
- [ ] Cero lógica de negocio en componentes — todo en hooks.
- [ ] Cero llamadas HTTP desde componentes o hooks — todo en servicios.
- [ ] No se instalaron dependencias nuevas sin autorización.
- [ ] No se modificó ningún módulo fuera del solicitado.
- [ ] No hay comentarios en el código.
