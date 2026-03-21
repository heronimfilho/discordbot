import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ICommand } from '../../types/Command';

export type RPSMove = 'rock' | 'paper' | 'scissors';
export const RPS_MOVES: RPSMove[] = ['rock', 'paper', 'scissors'];

const BEATS: Record<RPSMove, RPSMove> = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper',
};

const LABELS: Record<RPSMove, string> = {
  rock: '🪨 Pedra',
  paper: '📄 Papel',
  scissors: '✂️ Tesoura',
};

export function resolveRPS(player: RPSMove, bot: RPSMove): 'win' | 'lose' | 'draw' {
  if (player === bot) return 'draw';
  return BEATS[player] === bot ? 'win' : 'lose';
}

export const rps: ICommand = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setNameLocalization('pt-BR', 'pedra-papel-tesoura')
    .setDescription('Play rock, paper, scissors against the bot')
    .setDescriptionLocalization('pt-BR', 'Jogar pedra, papel, tesoura contra o bot')
    .addStringOption((opt) =>
      opt
        .setName('choice')
        .setNameLocalization('pt-BR', 'escolha')
        .setDescription('Your move')
        .setDescriptionLocalization('pt-BR', 'Sua jogada')
        .setRequired(true)
        .addChoices(
          { name: '🪨 Rock / Pedra', value: 'rock' },
          { name: '📄 Paper / Papel', value: 'paper' },
          { name: '✂️ Scissors / Tesoura', value: 'scissors' },
        ),
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const player = interaction.options.getString('choice', true) as RPSMove;
    const bot = RPS_MOVES[Math.floor(Math.random() * RPS_MOVES.length)];
    const outcome = resolveRPS(player, bot);

    const outcomeText = {
      win: '🎉 Você ganhou!',
      lose: '😔 Você perdeu!',
      draw: '🤝 Empate!',
    }[outcome];

    await interaction.reply(`${LABELS[player]} vs ${LABELS[bot]}\n${outcomeText}`);
  },
};
