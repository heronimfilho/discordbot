import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { ICommand } from '../../types/Command';

const EMOJI_OPTIONS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

export const poll: ICommand = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setNameLocalization('pt-BR', 'enquete')
    .setDescription('Create a poll with up to 5 options')
    .setDescriptionLocalization('pt-BR', 'Cria uma enquete com até 5 opções')
    .addStringOption((opt) =>
      opt
        .setName('question')
        .setNameLocalization('pt-BR', 'pergunta')
        .setDescription('The poll question')
        .setDescriptionLocalization('pt-BR', 'A pergunta da enquete')
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName('option1')
        .setNameLocalization('pt-BR', 'opcao1')
        .setDescription('Option 1')
        .setDescriptionLocalization('pt-BR', 'Opção 1')
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName('option2')
        .setNameLocalization('pt-BR', 'opcao2')
        .setDescription('Option 2')
        .setDescriptionLocalization('pt-BR', 'Opção 2')
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName('option3')
        .setNameLocalization('pt-BR', 'opcao3')
        .setDescription('Option 3 (optional)')
        .setDescriptionLocalization('pt-BR', 'Opção 3 (opcional)')
        .setRequired(false),
    )
    .addStringOption((opt) =>
      opt
        .setName('option4')
        .setNameLocalization('pt-BR', 'opcao4')
        .setDescription('Option 4 (optional)')
        .setDescriptionLocalization('pt-BR', 'Opção 4 (opcional)')
        .setRequired(false),
    )
    .addStringOption((opt) =>
      opt
        .setName('option5')
        .setNameLocalization('pt-BR', 'opcao5')
        .setDescription('Option 5 (optional)')
        .setDescriptionLocalization('pt-BR', 'Opção 5 (opcional)')
        .setRequired(false),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question', true);
    const options = [
      interaction.options.getString('option1', true),
      interaction.options.getString('option2', true),
      interaction.options.getString('option3'),
      interaction.options.getString('option4'),
      interaction.options.getString('option5'),
    ].filter((o): o is string => o !== null);

    const description = options
      .map((opt, i) => `${EMOJI_OPTIONS[i]} ${opt}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`📊 ${question}`)
      .setDescription(description)
      .setColor(0x5865f2)
      .setFooter({
        text: `Enquete criada por ${interaction.user.globalName ?? interaction.user.username}`,
      });

    const message = await interaction.reply({ embeds: [embed], fetchReply: true });

    try {
      for (let i = 0; i < options.length; i++) {
        await message.react(EMOJI_OPTIONS[i]);
      }
    } catch {
      console.warn('[poll] Failed to add reactions — missing permissions?');
    }
  },
};
