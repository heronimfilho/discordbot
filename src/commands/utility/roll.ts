import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';

export interface DiceConfig {
  count: number;
  sides: number;
  modifier: number;
}

export interface RollResult {
  rolls: number[];
  total: number;
}

export function parseDiceNotation(input: string): DiceConfig | null {
  const match = input.toLowerCase().trim().match(/^(\d*)d(\d+)([+-]\d+)?$/);
  if (!match) return null;

  const count = match[1] ? parseInt(match[1], 10) : 1;
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;

  if (count < 1 || sides < 1) return null;

  return { count, sides, modifier };
}

export function rollDice(config: DiceConfig): RollResult {
  const rolls = Array.from({ length: config.count }, () =>
    Math.floor(Math.random() * config.sides) + 1,
  );
  const total = rolls.reduce((sum, r) => sum + r, 0) + config.modifier;
  return { rolls, total };
}

export const roll: ICommand = {
  category: 'utilidade',
  data: new SlashCommandBuilder()
    .setName('roll')
    .setNameLocalization('pt-BR', 'rolar')
    .setDescription('Rola dados com notação padrão (ex: 2d6, 1d20+5)')
    .setDescriptionLocalization('en-US', 'Roll dice using standard notation (e.g. 2d6, 1d20+5)')
    .addStringOption((opt) =>
      opt
        .setName('dice')
        .setNameLocalization('pt-BR', 'dados')
        .setDescription('Notação: NdS+M (ex: 2d6, 1d20+5, d8-1)')
        .setDescriptionLocalization('en-US', 'Dice notation: NdS+M (e.g. 2d6, 1d20+5, d8-1)')
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const input = interaction.options.getString('dice', true).trim();
    const config = parseDiceNotation(input);

    if (!config) {
      await interaction.reply({
        content: '❌ Notação inválida. Use o formato `NdS+M` — ex: `2d6`, `1d20+5`, `d8-1`.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (config.count > 100) {
      await interaction.reply({
        content: '❌ Máximo de 100 dados por vez.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (config.sides > 1000) {
      await interaction.reply({
        content: '❌ Máximo de 1000 lados por dado.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (Math.abs(config.modifier) > 10000) {
      await interaction.reply({
        content: '❌ Modificador máximo é ±10000.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const result = rollDice(config);
    const rollsStr = result.rolls.join(', ');
    const modStr =
      config.modifier > 0
        ? ` + ${config.modifier}`
        : config.modifier < 0
          ? ` - ${Math.abs(config.modifier)}`
          : '';

    const lines = [
      `🎲 **${interaction.user.globalName ?? interaction.user.username}** rolou \`${input}\``,
      `Resultados: [${rollsStr}]${modStr}`,
    ];

    if (config.count > 1 || config.modifier !== 0) {
      lines.push(`**Total: ${result.total}**`);
    }

    await interaction.reply(lines.join('\n'));
  },
};
