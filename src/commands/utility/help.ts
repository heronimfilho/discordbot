import { ChatInputCommandInteraction, Collection, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';
import { CustomCommandService } from '../../services/CustomCommandService';
import { CustomCommandType } from '../../types/CustomCommand';

const TYPE_LABELS: Record<CustomCommandType, string> = {
  response: '💬 Resposta',
  warning: '⚠️ Aviso',
  counter: '🔢 Contador',
};

export function createHelpCommand(
  builtInCommands: Collection<string, ICommand>,
  customCommandService: CustomCommandService,
): ICommand {
  return {
    data: new SlashCommandBuilder()
      .setName('help')
      .setNameLocalization('pt-BR', 'ajuda')
      .setDescription('List all available commands')
      .setDescriptionLocalization('pt-BR', 'Listar todos os comandos disponíveis'),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      const embed = new EmbedBuilder()
        .setTitle('Comandos Disponíveis')
        .setColor(0x5865f2)
        .setFooter({ text: 'Use / para acionar qualquer comando' });

      const builtInLines = [...builtInCommands.values()]
        .filter((cmd) => cmd.data.name !== 'help')
        .map((cmd) => `\`/${cmd.data.name}\` — ${cmd.data.description}`);

      const customLines: string[] = [];
      if (interaction.guildId) {
        const customCmds = customCommandService.findAllByGuild(interaction.guildId);
        for (const cmd of customCmds) {
          customLines.push(`\`/${cmd.name}\` — ${TYPE_LABELS[cmd.type]}`);
        }
      }

      const allLines = [...builtInLines, ...customLines];
      embed.setDescription(allLines.length > 0 ? allLines.join('\n') : 'Nenhum comando encontrado.');

      await interaction.reply({ embeds: [embed], ephemeral: true });
    },
  };
}
