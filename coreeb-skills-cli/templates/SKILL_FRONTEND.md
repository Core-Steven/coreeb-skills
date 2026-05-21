---
name: coreeb-frontend
description: Protocolo de maquetación y diseño UI de COREEB utilizando la librería de componentes bajo Tailwind CSS v4.
---

# COREEB — FRONTEND & UI SKILL

## ⚠️ DIRECTIVA SUPREMA
- **Stack Base:** Next.js (App Router) + Tailwind CSS v4.
- **UI:** Librería `coreeb` exclusivamente.
- **Estilo Obligatorio:** Todos los formularios, páginas, modales, iconos, avatares, navbars y tablas **DEBEN** seguir rigurosamente la estética premium de la librería `coreeb` sin inventar estilos ad-hoc.
- **Compilación Obligatoria:** Se debe configurar Tailwind CSS v4 para escanear `node_modules/coreeb` mediante la directiva `@source` para asegurar que todos los estilos dinámicos de los componentes se compilen correctamente en producción.

---

## 🛠️ CATÁLOGO DE DISEÑO Y COMPONENTES FRONTEND

### 1. Fix crítico de CSS — @source para Tailwind v4
Tailwind CSS v4 no escanea carpetas dentro de `node_modules` por defecto. Si usas componentes complejos como `Dialog`, `Table` u otros, estos se verán transparentes, sin bordes o completamente en blanco si no agregas la ruta `@source` en tu archivo global.
**Ubicación obligatoria:** `src/app/globals.css`
```css
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));

/* ESCANEO CRÍTICO DE COMPONENTES DE COREEB */
@source "../../node_modules/coreeb/**/*.js";
@source "../../node_modules/coreeb/dist/**/*.js";

@import "coreeb/styles.css";

/* Cualquier estilo específico del proyecto va aquí debajo */
```

---

### 2. Iconos Material Symbols
Para usar iconos consistentes y de alta definición alineados a la librería:
**A. En `src/app/layout.tsx` (CDN de Iconos):**
```tsx
import './globals.css';
import { Toaster } from 'coreeb';

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

**B. Uso en Componentes (Mediante la clase base o el componente `Icons`):**
```tsx
import { Icons } from 'coreeb';

// Opción recomendada 1:
<Icons name="add" className="w-5 h-5 text-primary-500" />

// Opción 2 (HTML nativo):
<span className="material-symbols-outlined text-[20px]">add</span>
```

---

### 3. Spinner Fullscreen
Para mostrar pantallas de carga centradas con efecto de cristal esmerilado (glassmorphism):
```tsx
import { Spinner } from 'coreeb';

export function ScreenLoader({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <Spinner size="lg" className="text-primary" />
      <span className="mt-3 text-sm font-medium text-muted-foreground animate-pulse">
        {label}
      </span>
    </div>
  );
}
```

---

### 4. Validación de Formularios y Limpieza de Errores al Escribir
Patrón obligatorio para el manejo de inputs flotantes, selectores y textareas con control de errores en tiempo real y limpieza activa al escribir:
```tsx
'use client';
import { useState } from 'react';
import { FloatingInput, FloatingSelect, Button } from 'coreeb';

export function FormularioCliente() {
  const [form, setForm] = useState({ nombre: '', tipo: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // LIMPIEZA INMEDIATA DEL ERROR AL ESCRIBIR
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.nombre) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.tipo) newErrors.tipo = 'Debes seleccionar un tipo de cliente';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // Proceder con envío...
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FloatingInput
        label="Nombre del Cliente"
        name="nombre"
        value={form.nombre}
        onChange={handleChange}
        error={errors.nombre} // Prop de error nativa de coreeb
      />
      
      <FloatingSelect
        label="Tipo de Cliente"
        name="tipo"
        value={form.tipo}
        onChange={handleChange}
        error={errors.tipo}
        options={[
          { value: 'Frecuente', label: 'Cliente Frecuente' },
          { value: 'VIP', label: 'Cliente VIP' }
        ]}
      />
      <Button type="submit">Guardar</Button>
    </form>
  );
}
```

---

### 5. Dialog de Formulario Completo
Estructura premium para diálogos de creación o edición con divisiones limpias y scroll independiente si el formulario es extenso:
```tsx
import { Dialog, Separator, Button, FloatingInput, ScrollArea } from 'coreeb';

export function DialogFormulario({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={setOpen} title="Registrar Producto">
      <ScrollArea className="max-h-[70vh] pr-2">
        <div className="space-y-6 py-2">
          {/* Sección 1 */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Información del Producto
            </h3>
            <div className="space-y-4">
              <FloatingInput label="Nombre de artículo" name="nombre" />
              <FloatingInput label="Código SKU" name="sku" />
            </div>
          </div>

          <Separator className="my-2" />

          {/* Sección 2 */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Precios e Inventario
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <FloatingInput label="Precio Venta" name="precio" type="number" />
              <FloatingInput label="Existencias" name="stock" type="number" />
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/60">
        <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button onClick={() => console.log('Guardar')}>Crear Producto</Button>
      </div>
    </Dialog>
  );
}
```

---

### 6. Dialog de Confirmación (Patrón de Eliminación)
Estructura clara, compacta y destructiva para confirmación de acciones irreversibles:
```tsx
import { Dialog, Button, Icons } from 'coreeb';

export function DialogConfirmacion({ open, setOpen, onConfirm }: { open: boolean; setOpen: (o: boolean) => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onOpenChange={setOpen} title="¿Confirmar Eliminación?">
      <div className="flex items-start gap-4 py-3">
        <div className="p-3 bg-destructive/10 text-destructive rounded-full">
          <Icons name="warning" className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">¿Estás seguro de eliminar este registro?</p>
          <p className="text-xs text-muted-foreground mt-1">
            Esta acción es irreversible. Se borrarán permanentemente todos los datos asociados de forma definitiva.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button variant="destructive" onClick={onConfirm}>Confirmar y Eliminar</Button>
      </div>
    </Dialog>
  );
}
```

---

### 7. Cabecera de Página Estandarizada
Estructura adaptada para pantallas principales que contiene título, descripción y botón de llamada a la acción en grid adaptativo:
```tsx
import { Button, Icons } from 'coreeb';

export function CabeceraPagina({ titulo, descripcion, accionBtn, onAccion }: { titulo: string; descripcion: string; accionBtn: string; onAccion: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/80 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{titulo}</h1>
        <p className="text-sm text-muted-foreground mt-1">{descripcion}</p>
      </div>
      <Button onClick={onAccion} className="flex items-center gap-2 self-start sm:self-auto shadow-sm">
        <Icons name="add" className="w-4 h-4" />
        <span>{accionBtn}</span>
      </Button>
    </div>
  );
}
```

---

### 8. Tabla con Hover Actions (Patrón `group` / `group-hover`)
Diseño de filas limpias que ocultan los botones de acción secundarios (Editar/Eliminar) y los muestran suavemente solo cuando el usuario pasa el mouse encima, evitando el ruido visual en listas densas:
```tsx
import { Table, Button, Icons } from 'coreeb';

export function ListadoTabla({ datos }: { datos: any[] }) {
  return (
    <div className="border border-border/60 rounded-xl overflow-hidden shadow-sm">
      <Table>
        <thead>
          <tr className="bg-muted/40 border-b border-border/60">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Nombre</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((item) => (
            <tr key={item.id} className="group border-b border-border/40 hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3.5 text-sm text-muted-foreground">#{item.id}</td>
              <td className="px-4 py-3.5 text-sm font-medium text-foreground">{item.nombre}</td>
              <td className="px-4 py-3.5 text-right">
                {/* ACCIONES VISIBLES SOLO AL HACER HOVER */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center justify-end gap-1.5 transition-all duration-200">
                  <Button variant="ghost" size="icon" onClick={() => console.log('Editar', item.id)} className="w-8 h-8 rounded-lg hover:bg-background">
                    <Icons name="edit" className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => console.log('Eliminar', item.id)} className="w-8 h-8 rounded-lg hover:bg-destructive/10 text-destructive">
                    <Icons name="delete" className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
```

---

### 9. Avatares con Paleta Cíclica
Generador de avatares con colores armónicos y legibles basados en el valor hash del nombre de los usuarios:
```tsx
const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
];

export function AvatarUsuario({ nombre }: { nombre: string }) {
  const getStyle = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
  };

  const getInitials = (str: string) => {
    return str.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs border border-transparent shadow-sm ${getStyle(nombre)}`}>
      {getInitials(nombre)}
    </div>
  );
}
```

---

### 10. Estado Vacío (Empty State Placeholder)
Componente visual de cortesía cuando no existen datos cargados en un módulo:
```tsx
import { Button, Icons } from 'coreeb';

export function EstadoVacio({ modulo, onCrear }: { modulo: string; onCrear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-16 border border-dashed border-border/80 rounded-2xl bg-card/40 animate-in fade-in duration-300">
      <div className="p-4 bg-muted/60 rounded-full mb-4 text-muted-foreground/80 shadow-inner">
        <Icons name="folder_open" className="w-12 h-12" />
      </div>
      <h3 className="text-base font-semibold text-foreground">Sin registros guardados</h3>
      <p className="text-xs text-muted-foreground max-w-xs mt-1.5 mb-6">
        Aún no hay ningún elemento disponible en {modulo}. Registra el primero para comenzar a operar.
      </p>
      <Button onClick={onCrear} className="shadow-sm">
        <Icons name="add" className="mr-2 w-4 h-4" />
        <span>Crear primer registro</span>
      </Button>
    </div>
  );
}
```

---

### 11. Navbar Sticky con Glass-Panel y Link Activo
Cabecera y barra de navegación superior fija en pantalla, con desenfoque de fondo y resaltado visual en el link del módulo activo actual:
```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/productos', label: 'Productos', icon: 'inventory' },
    { href: '/clientes', label: 'Clientes', icon: 'group' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-base tracking-wider text-foreground hover:opacity-90">
            GAP CRM
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {menuItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 py-5 border-b-2 transition-all hover:text-foreground ${
                    active 
                      ? 'text-foreground font-semibold border-primary' 
                      : 'text-muted-foreground border-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
```
