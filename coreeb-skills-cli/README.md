# COREEB Skills Installer CLI

CLI ultra-rápido y con **cero dependencias** diseñado para instalar las directivas de desarrollo **COREEB Fullstack unificado (Next.js + Prisma)** en tu proyecto o de forma global para tus agentes de inteligencia artificial (Claude Code, Cursor, Cline, etc.).

## 🚀 Instalación y Uso Directo (NPX)

No necesitas instalar nada previamente. Puedes ejecutar el instalador directamente con `npx`:

### 1. Instalación local en tu proyecto actual
Este comando creará la skill en la ruta `./.agents/skills/coreeb-fullstack/SKILL.md` de tu proyecto:
```bash
npx coreeb-skills-cli add --project
```
*(Nota: `--project` es el comportamiento por defecto si no especificas otra opción)*.

### 2. Instalación global para tus agentes de IA
Este comando guardará la directiva de forma global en la carpeta del sistema `~/.agents/skills/coreeb-fullstack/SKILL.md`, haciéndola accesible para tus agentes en cualquier proyecto:
```bash
npx coreeb-skills-cli add --global
```

### 3. Copiar directamente a un archivo específico
Si necesitas copiar el protocolo como un archivo individual de forma directa:
```bash
npx coreeb-skills-cli add --dest ./SKILL.md
```

---

## 🛠️ Instalación Global (Opcional)

Si deseas tener el comando disponible siempre en tu sistema:

```bash
npm install -g coreeb-skills-cli
```

Una vez instalado globalmente, puedes usarlo directamente:
```bash
coreeb-skills add --project
coreeb-skills add --global
```

---

## 📖 Comandos y Opciones Disponibles

Para ver toda la documentación de ayuda integrada:
```bash
npx coreeb-skills-cli --help
```

### Opciones
- `add` (Comando): Ejecuta el instalador.
- `--global`, `-g`: Guarda de forma global en `~/.agents/skills/`.
- `--project`, `-p`: Guarda de forma local en el proyecto (`./.agents/skills/`).
- `--dest <ruta>`, `-d <ruta>`: Especifica una ruta de archivo de destino personalizada.
- `--help`, `-h`: Muestra el menú de ayuda.

---

## 📦 Publicación a NPM (Paso a Paso)

Si deseas publicar este CLI a la registry pública de npm para que cualquier desarrollador pueda usarlo en cualquier lugar:

1. **Inicia sesión en NPM en tu terminal:**
   ```bash
   npm login
   ```
2. **Navega al directorio del CLI:**
   ```bash
   cd skill/coreeb-skills-cli
   ```
3. **Publica el paquete públicamente:**
   ```bash
   npm publish --access public
   ```
   *(Nota: Asegúrate de que el nombre del paquete `coreeb-skills-cli` no esté tomado en npmjs.com. Si lo está, puedes renombrar el campo `"name"` en `package.json` a algo único como `@tu-usuario/coreeb-skills-cli`)*.
