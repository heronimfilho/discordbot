import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';

export const help: ICommand = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setNameLocalization('pt-BR', 'ajuda')
    .setDescription('List all available commands')
    .setDescriptionLocalization('pt-BR', 'Listar todos os comandos disponíveis'),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const commands = interaction.client.application?.commands.cache;

    const embed = new EmbedBuilder()
      .setTitle('Available Commands')
      .setColor(0x5865f2)
      .setFooter({ text: 'Use / to trigger any command' });

    if (commands && commands.size > 0) {
      const list = [...commands.values()]
        .map((cmd) => `\`/${cmd.name}\` — ${cmd.description}`)
        .join('\n');
      embed.setDescription(list);
    } else {
      embed.setDescription('No commands found.');
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
