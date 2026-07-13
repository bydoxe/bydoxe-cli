import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const expectedDomains = [
  'https://open-api.bydoxe.com/api/v1',
  'wss://open-api.bydoxe.com/v1/ws/public',
  'wss://open-api.bydoxe.com/v1/ws/private',
];
const unfinishedMarkerPattern = new RegExp(
  `\\b(${['TO' + 'DO', 'FIX' + 'ME', 'T' + 'BD'].join('|')})\\b`,
  'u',
);
const ignoredDirectories = new Set(['.git', 'dist', 'node_modules']);
const scannedExtensions = new Set([
  '.json',
  '.md',
  '.mjs',
  '.ts',
  '.yml',
  '.yaml',
]);

const files = await collectFiles(root);
const problems = [
  ...await findPatternProblems(files, /\p{Script=Hangul}/u, 'Hangul text'),
  ...await findPatternProblems(files, unfinishedMarkerPattern, 'unfinished marker'),
  ...await findMissingDomainProblems(files),
];

if (problems.length > 0) {
  console.error('Project validation failed:');
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exitCode = 1;
} else {
  console.log('Project validation passed.');
}

async function collectFiles(directory) {
  const entries = await readdir(directory);
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const entryStat = await stat(fullPath);

    if (entryStat.isDirectory()) {
      if (!ignoredDirectories.has(entry)) {
        results.push(...await collectFiles(fullPath));
      }
      continue;
    }

    if (scannedExtensions.has(path.extname(entry))) {
      results.push(fullPath);
    }
  }

  return results;
}

async function findPatternProblems(filesToScan, pattern, label) {
  const problems = [];

  for (const file of filesToScan) {
    const text = await readFile(file, 'utf8');
    if (pattern.test(text)) {
      problems.push(`${label} found in ${path.relative(root, file)}`);
    }
  }

  return problems;
}

async function findMissingDomainProblems(filesToScan) {
  const combinedText = (
    await Promise.all(filesToScan.map((file) => readFile(file, 'utf8')))
  ).join('\n');

  return expectedDomains
    .filter((domain) => !combinedText.includes(domain))
    .map((domain) => `Expected domain is missing: ${domain}`);
}
