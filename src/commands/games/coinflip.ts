import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';

export const coinflip: ICommand = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setNameLocalization('pt-BR', 'cara-ou-coroa')
    .setDescription('Flip a coin')
    .setDescriptionLocalization('pt-BR', 'Jogar uma moeda'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const result = Math.random() < 0.5 ? '🪙 **Cara!**' : '🪙 **Coroa!**';
    await interaction.reply(result);
  },
};
