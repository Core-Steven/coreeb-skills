const fs = require('fs');
const path = require('path');
const os = require('os');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  bold: '\x1b[1m'
};

const print = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✔${colors.reset} ${colors.bold}${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}✘ Error:${colors.reset} ${msg}`)
};

const helpText = `
${colors.bold}${colors.cyan}COREEB Skills Installer CLI${colors.reset}
Instalador de las directivas de desarrollo COREEB para Agentes de IA.

${colors.bold}Uso:${colors.reset}
  npx coreeb-skills-cli [comando] [opciones]

${colors.bold}Comandos:${colors.reset}
  add                 Instala la skill de desarrollo COREEB (Fullstack por defecto).

${colors.bold}Opciones de Skill:${colors.reset}
  --fullstack, -fs    Instala la skill de desarrollo COREEB Fullstack (Next.js + Prisma) (Por defecto).
  --frontend, -fe     Instala la skill de desarrollo COREEB Frontend (Tailwind v4 + Componentes UI).

${colors.bold}Opciones de Ubicación:${colors.reset}
  --global, -g        Instala la skill de forma global en la carpeta del sistema (~/.agents/skills/).
  --project, -p       Instala la skill localmente en el proyecto actual (./.agents/skills/) (Por defecto).
  --dest <ruta>, -d   Instala la skill directamente en una ruta de archivo específica (ej: ./SKILL.md).
  --help, -h          Muestra este mensaje de ayuda.

${colors.bold}Ejemplos:${colors.reset}
  npx coreeb-skills-cli add --project
  npx coreeb-skills-cli add --frontend --project
  npx coreeb-skills-cli add --global
  npx coreeb-skills-cli add --dest ./SKILL.md
`;

function getHomeDir() {
  return os.homedir();
}

function run() {
  const args = process.argv.slice(2);

  // Mostrar ayuda si se solicita
  if (args.includes('--help') || args.includes('-h')) {
    console.log(helpText);
    process.exit(0);
  }

  // Determinar comando (por defecto "add")
  let command = 'add';
  if (args.length > 0 && !args[0].startsWith('-')) {
    command = args[0];
  }

  if (command !== 'add') {
    print.error(`Comando desconocido "${command}". Usa --help para ver la lista de comandos disponibles.`);
    process.exit(1);
  }

  // Parsear opciones
  const isGlobal = args.includes('--global') || args.includes('-g');
  const isProject = args.includes('--project') || args.includes('-p') || (!isGlobal && !args.includes('--dest') && !args.includes('-d'));
  const isFrontend = args.includes('--frontend') || args.includes('-fe');

  const skillName = isFrontend ? 'coreeb-frontend' : 'coreeb-fullstack';
  const templateName = isFrontend ? 'SKILL_FRONTEND.md' : 'SKILL.md';
  const skillLabel = isFrontend ? 'COREEB Frontend' : 'COREEB Fullstack';

  let customDest = null;
  const destIndex = args.indexOf('--dest') !== -1 ? args.indexOf('--dest') : args.indexOf('-d');
  if (destIndex !== -1 && args[destIndex + 1]) {
    customDest = args[destIndex + 1];
  }

  const sourcePath = path.join(__dirname, '../templates', templateName);

  if (!fs.existsSync(sourcePath)) {
    print.error(`No se encontró la plantilla de la skill ${skillName} en el paquete de instalación.`);
    process.exit(1);
  }

  let targetPath = '';

  if (customDest) {
    targetPath = path.resolve(customDest);
  } else if (isGlobal) {
    targetPath = path.join(getHomeDir(), '.agents', 'skills', skillName, 'SKILL.md');
  } else {
    targetPath = path.join(process.cwd(), '.agents', 'skills', skillName, 'SKILL.md');
  }

  const targetDir = path.dirname(targetPath);

  try {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.copyFileSync(sourcePath, targetPath);

    print.success(`¡Skill ${skillLabel} instalada con éxito!`);
    console.log(`${colors.bold}Ubicación:${colors.reset} ${targetPath}`);
    console.log(`${colors.cyan}El agente de IA cargará esta directiva como fuente de verdad en sus tareas.${colors.reset}\n`);
  } catch (err) {
    print.error(`No se pudo instalar la skill. Detalle: ${err.message}`);
    process.exit(1);
  }
}

run();
