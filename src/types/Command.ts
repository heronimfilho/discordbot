import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export type CommandCategory = 'utilidade' | 'diversão' | 'servidor' | 'pontos' | 'música';

export interface ICommand {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
  category: CommandCategory;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
