import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';
import { MusicService } from '../../services/MusicService';

export function createRepetirCommand(musicService: MusicService): ICommand {
  return {
    category: 'música',
    data: new SlashCommandBuilder()
      .setName('repetir')
      .setNameLocalization('en-US', 'loop')
      .setDescription('Alternar modo de repetição: desligado → música → fila')
      .setDescriptionLocalization('en-US', 'Cycle loop mode: off → track → queue'),
    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
      if (!interaction.guildId) {
        await interaction.reply({
          content: '❌ Este comando só pode ser usado em um servidor.',
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      const mode = musicService.cycleLoopMode(interaction.guildId);
      if (!mode) {
        await interaction.reply({ content: '❌ Não há nada tocando no momento.', flags: MessageFlags.Ephemeral });
        return;
      }
      const labels = { off: '🔁 Repetição desligada.', track: '🔂 Repetindo a música atual.', queue: '🔁 Repetindo a fila inteira.' };
      await interaction.reply(labels[mode]);
    },
  };
}
