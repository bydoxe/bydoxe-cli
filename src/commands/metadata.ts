import { CliError } from '../errors/cli-error.js';

export type CommandAuth = 'public' | 'private';
export type CommandRiskLevel = 'low' | 'medium' | 'high';
export type CommandParameterMode = 'none' | 'query' | 'body' | 'message';

export interface CommandMetadata {
  auth: CommandAuth;
  riskLevel: CommandRiskLevel;
  requiredParams: string[];
  optionalParams: string[];
  parameterMode: CommandParameterMode;
}

export interface CommandPreviewMetadata extends CommandMetadata {}

export function withCommandMetadata<TCommand>(
  commands: TCommand[],
  metadata:
    | CommandMetadata
    | ((command: TCommand) => CommandMetadata),
): Array<TCommand & CommandMetadata> {
  return commands.map((command) => ({
    ...command,
    ...(typeof metadata === 'function' ? metadata(command) : metadata),
  }));
}

export function toPreviewMetadata(
  metadata: CommandMetadata,
): CommandPreviewMetadata {
  return {
    auth: metadata.auth,
    riskLevel: metadata.riskLevel,
    requiredParams: [...metadata.requiredParams],
    optionalParams: [...metadata.optionalParams],
    parameterMode: metadata.parameterMode,
  };
}

export function assertRequiredParamsPresent(
  metadata: CommandMetadata,
  values: Record<string, unknown> | undefined,
  commandName: string,
): void {
  const missing = metadata.requiredParams.filter(
    (name) => !hasUsableValue(values?.[name]),
  );

  if (missing.length > 0) {
    throw new CliError(
      `Missing required parameter${missing.length === 1 ? '' : 's'} for ${commandName}: ${missing.join(', ')}.`,
    );
  }
}

function hasUsableValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}
