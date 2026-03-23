import { ChatInputCommandInteraction, Collection, EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';
import { CustomCommandService } from '../../services/CustomCommandService';
import { CustomCommandType } from '../../types/CustomCommand';

const TYPE_LABELS: Record<CustomCommandType, string> = {
  response: 'Resposta',
  warning: 'Aviso',
  counter: 'Contador',
};

const CATEGORY_ORDER: Array<{ key: string; label: string }> = [
  { key: 'utilidade', label: 'Utilidade' },
  { key: 'diversão', label: 'Diversão' },
  { key: 'servidor', label: 'Servidor' },
  { key: 'pontos', label: 'Pontos' },
  { key: 'música', label: 'Música' },
];

const FIELD_LIMIT = 1024;

function addFieldsWithSplit(
  embed: EmbedBuilder,
  label: string,
  lines: string[],
): void {
  const chunks: string[][] = [[]];
  let currentLen = 0;

  for (const line of lines) {
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

  chunks.forEach((chunk, i) => {
    embed.addFields({
      name: i === 0 ? label : '\u200b',
      value: chunk.join('\n'),
    });
  });
}

export function createHelpCommand(
  builtInCommands: Collection<string, ICommand>,
  customCommandService: CustomCommandService,
): ICommand {
  return {
    category: 'utilidade',
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

      // Group built-in commands by category (exclude help itself)
      const byCategory = new Map<string, ICommand[]>();
      for (const cmd of builtInCommands.values()) {
        if (cmd.data.name === 'help') continue;
        const cat = cmd.category as string;
        if (!byCategory.has(cat)) byCategory.set(cat, []);
        byCategory.get(cat)!.push(cmd);
      }

      for (const { key, label } of CATEGORY_ORDER) {
        const cmds = byCategory.get(key);
        if (!cmds || cmds.length === 0) continue;
        const lines = cmds.map((cmd) => `\`/${cmd.data.name}\` — ${cmd.data.description}`);
        addFieldsWithSplit(embed, label, lines);
      }

      // Custom commands grouped by type
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
