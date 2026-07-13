import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const catalogPath = path.join(root, 'docs', 'command-catalog.json');
const summaryPath = path.join(root, 'docs', 'command-summary.md');
const checkOnly = process.argv.includes('--check');

const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const summaryMarkdown = renderSummary(catalog);

if (checkOnly) {
  const currentMarkdown = await readFile(summaryPath, 'utf8');
  if (currentMarkdown !== summaryMarkdown) {
    console.error('Command summary is out of date. Run npm run summary:generate.');
    process.exitCode = 1;
  } else {
    console.log('Command summary is up to date.');
  }
} else {
  await mkdir(path.dirname(summaryPath), { recursive: true });
  await writeFile(summaryPath, summaryMarkdown);
  console.log(`Command summary written to ${path.relative(root, summaryPath)}.`);
}

function renderSummary(commandCatalog) {
  const commands = commandCatalog.commands;
  const groups = [
    ['public-rest', 'Public REST'],
    ['private-rest', 'Authenticated REST'],
    ['write-rest', 'Write REST'],
    ['websocket', 'WebSocket'],
  ];
  const riskLevels = ['low', 'medium', 'high'];
  const authScopes = ['public', 'private'];
  const writeCommands = commands.filter((command) => command.group === 'write-rest');
  const writeValidationCount = writeCommands.filter((command) => command.validation).length;
  const confirmCommandCount = commands.filter((command) =>
    command.group === 'write-rest' || command.requiresConfirm,
  ).length;

  return [
    '# BYDOXE CLI Command Summary',
    '',
    'This file is generated from `docs/command-catalog.json`. Run `npm run summary:generate` after changing command registries.',
    '',
    '## Totals',
    '',
    `- Package: ${code(commandCatalog.packageName)}`,
    `- Version: ${code(commandCatalog.packageVersion)}`,
    `- Schema version: ${code(commandCatalog.schemaVersion)}`,
    `- Command count: ${code(commandCatalog.commandCount)}`,
    `- Write commands with local validation rules: ${code(`${writeValidationCount}/${writeCommands.length}`)}`,
    `- Commands requiring exact confirmation: ${code(confirmCommandCount)}`,
    '',
    '## Command Groups',
    '',
    '| Group | Commands | Auth Scope | Risk Profile | Parameter Modes |',
    '| --- | --- | --- | --- | --- |',
    ...groups.map(([group, label]) => {
      const groupCommands = commands.filter((command) => command.group === group);
      return [
        label,
        code(groupCommands.length),
        summarizeValues(groupCommands, authScopes, 'auth'),
        summarizeValues(groupCommands, riskLevels, 'riskLevel'),
        summarizeDistinctValues(groupCommands, 'parameterMode'),
      ].join(' | ');
    }).map((row) => `| ${row} |`),
    '',
    '## Safety Summary',
    '',
    '- Public REST commands are read-only market and exchange data operations.',
    '- Authenticated REST read commands require local credentials but do not require `CONFIRM`.',
    '- Write REST commands require local credentials, dry-run review, and exact `CONFIRM` before live execution.',
    '- WebSocket public commands support bounded live execution; private WebSocket live execution remains disabled behind safety gates.',
    '- Generated references expose auth scope, risk level, required parameters, optional parameters, and write validation rules.',
    '',
    '## Generated References',
    '',
    '- Full human-readable command surface: [command-reference.md](command-reference.md)',
    '- Machine-readable command catalog: [command-catalog.json](command-catalog.json)',
    '',
  ].join('\n');
}

function summarizeValues(commands, orderedValues, key) {
  const parts = orderedValues
    .map((value) => [value, commands.filter((command) => command[key] === value).length])
    .filter(([, count]) => count > 0)
    .map(([value, count]) => `${value}: ${count}`);

  return parts.length > 0 ? parts.join('<br>') : 'none';
}

function summarizeDistinctValues(commands, key) {
  const values = [...new Set(commands.map((command) => command[key]))].sort();
  return values.length > 0 ? values.map(code).join(', ') : 'none';
}

function code(value) {
  return `\`${String(value).replaceAll('|', '\\|')}\``;
}
