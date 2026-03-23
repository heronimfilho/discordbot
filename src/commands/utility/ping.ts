import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';

export const ping: ICommand = {
  category: 'utilidade',
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Verificar latência do bot e da API')
    .setDescriptionLocalization('en-US', 'Check bot and API latency'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const sent = await interaction.reply({ content: 'Verificando...', fetchReply: true });
    const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);
    await interaction.editReply(`Pong! Bot: **${botLatency}ms** | API: **${apiLatency}ms**`);
  },
};
