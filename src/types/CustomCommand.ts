export type CustomCommandType = 'response' | 'warning' | 'counter';

export interface CustomCommand {
  id: number;
  guild_id: string;
  name: string;
  type: CustomCommandType;
  text: string;
  counter: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomCommandDTO {
  guild_id: string;
  name: string;
  type: CustomCommandType;
  text: string;
}

export interface UpdateCustomCommandDTO {
  type?: CustomCommandType;
  text?: string;
}
