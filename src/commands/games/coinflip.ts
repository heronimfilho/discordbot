import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';

export const coinflip: ICommand = {
  category: 'diversão',
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setNameLocalization('pt-BR', 'cara-ou-coroa')
    .setDescription('Jogar uma moeda')
    .setDescriptionLocalization('en-US', 'Flip a coin'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const result = Math.random() < 0.5 ? '🪙 **Cara!**' : '🪙 **Coroa!**';
    await interaction.reply(result);
  },
};
