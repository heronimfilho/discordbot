import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';

export const EIGHT_BALL_RESPONSES = [
  '✅ Com certeza.',
  '✅ Definitivamente sim.',
  '✅ Sem dúvida.',
  '✅ Pode contar com isso.',
  '✅ As perspectivas são boas.',
  '🔮 Pergunte novamente mais tarde.',
  '🔮 Não é possível prever agora.',
  '🔮 Concentre-se e pergunte novamente.',
  '❌ Não conte com isso.',
  '❌ Minha resposta é não.',
  '❌ As perspectivas não são boas.',
  '❌ Muito duvidoso.',
];

export const eightball: ICommand = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8-ball a question')
    .setDescriptionLocalization('pt-BR', 'Pergunte algo à bola mágica')
    .addStringOption((opt) =>
      opt
        .setName('question')
        .setNameLocalization('pt-BR', 'pergunta')
        .setDescription('Your question')
        .setDescriptionLocalization('pt-BR', 'Sua pergunta')
        .setRequired(true),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question', true);
    const response =
      EIGHT_BALL_RESPONSES[Math.floor(Math.random() * EIGHT_BALL_RESPONSES.length)];

    const embed = new EmbedBuilder()
      .setTitle('🎱 Bola Mágica')
      .addFields(
        { name: 'Pergunta', value: question },
        { name: 'Resposta', value: response },
      )
      .setColor(0x2b2d31);

    await interaction.reply({ embeds: [embed] });
  },
};
