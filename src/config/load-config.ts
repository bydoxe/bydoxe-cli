export const DEFAULT_REST_BASE_URL = 'https://open-api.bydoxe.com/api/v1';
export const DEFAULT_PUBLIC_WS_URL = 'wss://open-api.bydoxe.com/v1/ws/public';
export const DEFAULT_PRIVATE_WS_URL = 'wss://open-api.bydoxe.com/v1/ws/private';

export interface BydoxeConfig {
  accessKey?: string;
  secretKey?: string;
  passphrase?: string;
  restBaseUrl: string;
  publicWebSocketUrl: string;
  privateWebSocketUrl: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): BydoxeConfig {
  return {
    accessKey: env.BYDOXE_ACCESS_KEY,
    secretKey: env.BYDOXE_SECRET_KEY,
    passphrase: env.BYDOXE_PASSPHRASE,
    restBaseUrl: env.BYDOXE_REST_BASE_URL ?? DEFAULT_REST_BASE_URL,
    publicWebSocketUrl: env.BYDOXE_PUBLIC_WS_URL ?? DEFAULT_PUBLIC_WS_URL,
    privateWebSocketUrl: env.BYDOXE_PRIVATE_WS_URL ?? DEFAULT_PRIVATE_WS_URL,
  };
}

export function requirePrivateConfig(config: BydoxeConfig): Required<BydoxeConfig> {
  const missing = [
    ['BYDOXE_ACCESS_KEY', config.accessKey],
    ['BYDOXE_SECRET_KEY', config.secretKey],
    ['BYDOXE_PASSPHRASE', config.passphrase],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return config as Required<BydoxeConfig>;
}
