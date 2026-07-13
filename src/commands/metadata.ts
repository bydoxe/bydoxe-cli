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
