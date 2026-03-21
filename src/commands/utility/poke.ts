import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from 'discord.js';
import { ICommand } from '../../types/Command';

export const poke: ICommand = {
  data: new SlashCommandBuilder()
    .setName('poke')
    .setNameLocalization('pt-BR', 'cutucar')
    .setDescription('Poke another user')
    .setDescriptionLocalization('pt-BR', 'Cutucar outro usuário')
    .addUserOption((option) =>
      option
        .setName('user')
        .setNameLocalization('pt-BR', 'usuario')
        .setDescription('The user to poke')
        .setDescriptionLocalization('pt-BR', 'O usuário a cutucar')
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user', true);
    const poker = interaction.member as GuildMember;
    const pokerName = poker?.displayName ?? interaction.user.username;
    const targetName = target.displayName ?? target.username;
    await interaction.reply(`👉 **${pokerName}** poked **${targetName}**!`);
  },
};
