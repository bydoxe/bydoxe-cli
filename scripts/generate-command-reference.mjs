import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const catalogPath = path.join(root, 'docs', 'command-catalog.json');
const referencePath = path.join(root, 'docs', 'command-reference.md');
const checkOnly = process.argv.includes('--check');

const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const referenceMarkdown = renderReference(catalog);

if (checkOnly) {
  const currentMarkdown = await readFile(referencePath, 'utf8');
  if (currentMarkdown !== referenceMarkdown) {
    console.error('Command reference is out of date. Run npm run reference:generate.');
    process.exitCode = 1;
  } else {
    console.log('Command reference is up to date.');
  }
} else {
  await mkdir(path.dirname(referencePath), { recursive: true });
  await writeFile(referencePath, referenceMarkdown);
  console.log(`Command reference written to ${path.relative(root, referencePath)}.`);
}

function renderReference(commandCatalog) {
  return [
    '# BYDOXE CLI Command Reference',
    '',
    'This file is generated from `docs/command-catalog.json`. Run `npm run reference:generate` after changing command registries.',
    '',
    '## Summary',
    '',
    `- Package: \`${commandCatalog.packageName}\``,
    `- Version: \`${commandCatalog.packageVersion}\``,
    `- Schema version: \`${commandCatalog.schemaVersion}\``,
    `- Command count: \`${commandCatalog.commandCount}\``,
    '',
    renderRestGroup(commandCatalog, 'public-rest', 'Public REST Commands'),
    renderRestGroup(commandCatalog, 'private-rest', 'Authenticated REST Commands'),
    renderRestGroup(commandCatalog, 'write-rest', 'Write REST Commands'),
    renderWebSocketGroup(commandCatalog),
  ].join('\n');
}

function renderRestGroup(commandCatalog, group, title) {
  const commands = commandCatalog.commands.filter((command) => command.group === group);
  return [
    `## ${title}`,
    '',
    '| Command | Method | Endpoint | Auth | Risk | Parameters |',
    '| --- | --- | --- | --- | --- | --- |',
    ...commands.map((command) =>
      [
        code(command.command),
        code(command.method),
        code(command.path),
        command.auth,
        command.riskLevel,
        formatParams(command),
      ].join(' | '),
    ).map((row) => `| ${row} |`),
    '',
  ].join('\n');
}

function renderWebSocketGroup(commandCatalog) {
  const commands = commandCatalog.commands.filter((command) => command.group === 'websocket');
  return [
    '## WebSocket Commands',
    '',
    '| Command | Scope | Auth | Risk | Confirm | Parameters |',
    '| --- | --- | --- | --- | --- | --- |',
    ...commands.map((command) =>
      [
        code(command.command),
        command.scope,
        command.auth,
        command.riskLevel,
        command.requiresConfirm ? code('CONFIRM') : 'No',
        formatParams(command),
      ].join(' | '),
    ).map((row) => `| ${row} |`),
    '',
  ].join('\n');
}

function formatParams(command) {
  const required = command.requiredParams ?? [];
  const optional = command.optionalParams ?? [];
  const parts = [];

  if (required.length > 0) {
    parts.push(`required: ${required.map(code).join(', ')}`);
  }
  if (optional.length > 0) {
    parts.push(`optional: ${optional.map(code).join(', ')}`);
  }

  return parts.length > 0 ? parts.join('<br>') : 'none';
}

function code(value) {
  return `\`${String(value).replaceAll('|', '\\|')}\``;
}
