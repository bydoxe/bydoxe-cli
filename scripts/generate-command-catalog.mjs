import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const catalogPath = path.join(root, 'docs', 'command-catalog.json');
const checkOnly = process.argv.includes('--check');

const catalog = await buildCatalog();
const catalogJson = `${JSON.stringify(catalog, null, 2)}\n`;

if (checkOnly) {
  const currentJson = await readFile(catalogPath, 'utf8');
  if (currentJson !== catalogJson) {
    console.error('Command catalog is out of date. Run npm run catalog:generate.');
    process.exitCode = 1;
  } else {
    console.log('Command catalog is up to date.');
  }
} else {
  await mkdir(path.dirname(catalogPath), { recursive: true });
  await writeFile(catalogPath, catalogJson);
  console.log(`Command catalog written to ${path.relative(root, catalogPath)}.`);
}

async function buildCatalog() {
  const [
    packageJson,
    publicRest,
    privateRest,
    writeRest,
    websocket,
  ] = await Promise.all([
    readPackageJson(),
    importDistModule('commands/public-rest.js'),
    importDistModule('commands/private-rest.js'),
    importDistModule('commands/write-rest.js'),
    importDistModule('commands/websocket.js'),
  ]);
  const commands = [
    ...publicRest.PUBLIC_REST_COMMANDS.map((command) =>
      toRestCatalogEntry(command, 'public-rest'),
    ),
    ...privateRest.PRIVATE_REST_COMMANDS.map((command) =>
      toRestCatalogEntry(command, 'private-rest'),
    ),
    ...writeRest.WRITE_REST_COMMANDS.map((command) =>
      toRestCatalogEntry(command, 'write-rest'),
    ),
    ...websocket.WEBSOCKET_COMMANDS.map(toWebSocketCatalogEntry),
  ];

  return {
    schemaVersion: 1,
    packageName: packageJson.name,
    packageVersion: packageJson.version,
    commandCount: commands.length,
    commands,
  };
}

async function readPackageJson() {
  return JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
}

async function importDistModule(relativePath) {
  const modulePath = path.join(root, 'dist', relativePath);
  return import(pathToFileURL(modulePath).href);
}

function toRestCatalogEntry(command, group) {
  return {
    command: toCommandString(command.command),
    group,
    transport: 'rest',
    auth: command.auth,
    riskLevel: command.riskLevel,
    parameterMode: command.parameterMode,
    requiredParams: command.requiredParams,
    optionalParams: command.optionalParams,
    method: command.method,
    path: command.path,
    description: command.description,
  };
}

function toWebSocketCatalogEntry(command) {
  return {
    command: toCommandString(command.command),
    group: 'websocket',
    transport: 'websocket',
    auth: command.auth,
    riskLevel: command.riskLevel,
    parameterMode: command.parameterMode,
    requiredParams: command.requiredParams,
    optionalParams: command.optionalParams,
    scope: command.scope,
    requiresConfirm: command.requiresConfirm === true,
    description: command.description,
  };
}

function toCommandString(parts) {
  return `bydoxe ${parts.join(' ')}`;
}
