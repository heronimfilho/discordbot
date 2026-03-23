import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from 'discord.js';
import { ICommand } from '../../types/Command';

export const poke: ICommand = {
  category: 'utilidade',
  data: new SlashCommandBuilder()
    .setName('poke')
    .setNameLocalization('pt-BR', 'cutucar')
    .setDescription('Cutucar outro usuário')
    .setDescriptionLocalization('en-US', 'Poke another user')
    .addUserOption((option) =>
      option
        .setName('user')
        .setNameLocalization('pt-BR', 'usuario')
        .setDescription('O usuário a cutucar')
        .setDescriptionLocalization('en-US', 'The user to poke')
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user', true);
    const poker = interaction.member as GuildMember;
    const pokerName = poker?.displayName ?? interaction.user.username;
    const targetName = target.globalName ?? target.username;
    await interaction.reply(`👉 **${pokerName}** cutucou **${targetName}**!`);
  },
};
