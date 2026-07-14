import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline/promises';
import process from 'node:process';

export interface CredentialProfile {
  accessKey?: string;
  secretKey?: string;
  passphrase?: string;
}

export interface CredentialStatus {
  configPath: string;
  configured: boolean;
  accessKey: string;
  secretKey: string;
  passphrase: string;
}

const CONFIG_DIR = '.bydoxe';
const CONFIG_FILE = 'config';

export function getConfigPath(env: NodeJS.ProcessEnv = process.env): string {
  return env.BYDOXE_CONFIG_PATH ?? path.join(os.homedir(), CONFIG_DIR, CONFIG_FILE);
}

export function loadCredentialProfile(
  env: NodeJS.ProcessEnv = process.env,
): CredentialProfile {
  const configPath = getConfigPath(env);

  if (!existsSync(configPath)) {
    return {};
  }

  const parsed = JSON.parse(readFileSync(configPath, 'utf8')) as Partial<CredentialProfile>;

  return {
    accessKey: readOptionalString(parsed.accessKey),
    secretKey: readOptionalString(parsed.secretKey),
    passphrase: readOptionalString(parsed.passphrase),
  };
}

export function saveCredentialProfile(
  profile: Required<CredentialProfile>,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const configPath = getConfigPath(env);
  mkdirSync(path.dirname(configPath), { recursive: true, mode: 0o700 });
  writeFileSync(
    configPath,
    `${JSON.stringify(
      {
        accessKey: profile.accessKey,
        secretKey: profile.secretKey,
        passphrase: profile.passphrase,
      },
      null,
      2,
    )}\n`,
    { mode: 0o600 },
  );
  chmodSync(configPath, 0o600);
  return configPath;
}

export function clearCredentialProfile(env: NodeJS.ProcessEnv = process.env): string {
  const configPath = getConfigPath(env);
  rmSync(configPath, { force: true });
  return configPath;
}

export function getCredentialStatus(
  profile: CredentialProfile,
  env: NodeJS.ProcessEnv = process.env,
): CredentialStatus {
  return {
    configPath: getConfigPath(env),
    configured: Boolean(profile.accessKey && profile.secretKey && profile.passphrase),
    accessKey: profile.accessKey ? maskAccessKey(profile.accessKey) : 'missing',
    secretKey: profile.secretKey ? 'configured' : 'missing',
    passphrase: profile.passphrase ? 'configured' : 'missing',
  };
}

export async function promptCredentialProfile(
  existing: CredentialProfile = {},
  input = process.stdin,
  output = process.stdout,
): Promise<Required<CredentialProfile>> {
  if (!input.isTTY || !output.isTTY) {
    throw new Error(
      'Interactive credential setup requires a TTY. Pass --access-key, --secret-key, and --passphrase for non-interactive setup.',
    );
  }

  const rl = readline.createInterface({ input, output });

  try {
    const accessKey = await promptVisible(
      rl,
      `Access key${existing.accessKey ? ` (${maskAccessKey(existing.accessKey)})` : ''}: `,
      existing.accessKey,
    );
    const secretKey = await promptHidden(
      rl,
      output,
      `Secret key${existing.secretKey ? ' (configured)' : ''}: `,
      existing.secretKey,
    );
    const passphrase = await promptHidden(
      rl,
      output,
      `Passphrase${existing.passphrase ? ' (configured)' : ''}: `,
      existing.passphrase,
    );

    return assertCompleteProfile({ accessKey, secretKey, passphrase });
  } finally {
    rl.close();
  }
}

export function assertCompleteProfile(
  profile: CredentialProfile,
): Required<CredentialProfile> {
  const missing = [
    ['access key', profile.accessKey],
    ['secret key', profile.secretKey],
    ['passphrase', profile.passphrase],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing credential profile value(s): ${missing.join(', ')}.`);
  }

  return profile as Required<CredentialProfile>;
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function maskAccessKey(value: string): string {
  const visible = value.slice(-4);
  return `${'*'.repeat(Math.max(4, value.length - visible.length))}${visible}`;
}

async function promptVisible(
  rl: readline.Interface,
  question: string,
  fallback?: string,
): Promise<string | undefined> {
  const answer = await rl.question(question);
  return answer.length > 0 ? answer : fallback;
}

async function promptHidden(
  rl: readline.Interface,
  output: NodeJS.WriteStream,
  question: string,
  fallback?: string,
): Promise<string | undefined> {
  const originalWrite = output.write.bind(output);

  output.write = ((chunk: string | Uint8Array, ...args: unknown[]) => {
    const text = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
    if (text.includes(question)) {
      return originalWrite(chunk, ...(args as []));
    }
    return true;
  }) as typeof output.write;

  try {
    const answer = await rl.question(question);
    originalWrite('\n');
    return answer.length > 0 ? answer : fallback;
  } finally {
    output.write = originalWrite;
  }
}
