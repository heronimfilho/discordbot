import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';

export const ping: ICommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot and API latency')
    .setDescriptionLocalization('pt-BR', 'Verificar latência do bot e da API'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);
    await interaction.editReply(`Pong! Bot: **${botLatency}ms** | API: **${apiLatency}ms**`);
  },
};
