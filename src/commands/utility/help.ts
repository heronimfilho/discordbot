import { ChatInputCommandInteraction, Collection, EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';
import { CustomCommandService } from '../../services/CustomCommandService';
import { CustomCommandType } from '../../types/CustomCommand';

const TYPE_LABELS: Record<CustomCommandType, string> = {
  response: 'Resposta',
  warning: 'Aviso',
  counter: 'Contador',
};

export function createHelpCommand(
  builtInCommands: Collection<string, ICommand>,
  customCommandService: CustomCommandService,
): ICommand {
  return {
    data: new SlashCommandBuilder()
      .setName('help')
      .setNameLocalization('pt-BR', 'ajuda')
      .setDescription('Listar todos os comandos disponíveis')
      .setDescriptionLocalization('en-US', 'List all available commands'),

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      const embed = new EmbedBuilder()
        .setTitle('Comandos Disponíveis')
        .setColor(0x5865f2)
        .setFooter({ text: 'Use / para acionar qualquer comando' });

      const builtInLines = [...builtInCommands.values()]
        .filter((cmd) => cmd.data.name !== 'help')
        .map((cmd) => `\`/${cmd.data.name}\` — ${cmd.data.description}`);

      // Discord embed field value limit is 1024 chars — split into chunks
      const FIELD_LIMIT = 1024;
      const chunks: string[][] = [[]];
      let currentLen = 0;
      for (const line of builtInLines) {
        const lineLen = line.length + 1; // +1 for \n
        const lastChunk = chunks[chunks.length - 1];
        if (currentLen + lineLen > FIELD_LIMIT && lastChunk && lastChunk.length > 0) {
          chunks.push([]);
          currentLen = 0;
        }
        const target = chunks[chunks.length - 1];
        if (target) target.push(line);
        currentLen += lineLen;
      }

      if (builtInLines.length === 0) {
        embed.addFields({ name: 'Comandos Padrão', value: '_Nenhum_' });
      } else {
        chunks.forEach((chunk, i) => {
          embed.addFields({
            name: i === 0 ? 'Comandos Padrão' : '\u200b',
            value: chunk.join('\n'),
          });
        });
      }

      if (interaction.guildId) {
        const customCmds = customCommandService.findAllByGuild(interaction.guildId);
        const byType: Record<CustomCommandType, string[]> = {
          response: [],
          warning: [],
          counter: [],
        };
        for (const cmd of customCmds) {
          byType[cmd.type].push(`\`/${cmd.name}\``);
        }

        const typeOrder: CustomCommandType[] = ['response', 'warning', 'counter'];
        for (const type of typeOrder) {
          if (byType[type].length > 0) {
            embed.addFields({
              name: TYPE_LABELS[type],
              value: byType[type].join(', '),
            });
          }
        }
      }

      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    },
  };
}
