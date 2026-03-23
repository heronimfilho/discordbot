import { PointsRepository } from '../database/repositories/PointsRepository';
import { PendingDuelRepository } from '../database/repositories/PendingDuelRepository';

export interface StartResult {
  success: boolean;
  reason?: 'already_started';
}

export interface ValidateDuelResult {
  valid: boolean;
  reason?: 'self_duel' | 'insufficient_points' | 'pending_duel_exists';
}

export interface ResolveDuelResult {
  winnerId: string;
  loserId: string;
  pot: number;
  winnerNewBalance: number;
  loserNewBalance: number;
}

export class PointsService {
  constructor(
    private readonly pointsRepo: PointsRepository,
    private readonly duelRepo: PendingDuelRepository,
  ) {}

  getBalance(guildId: string, userId: string): number {
    return this.pointsRepo.getBalance(guildId, userId);
  }

  start(guildId: string, userId: string): StartResult {
    const balance = this.pointsRepo.getBalance(guildId, userId);
    if (balance > 0) return { success: false, reason: 'already_started' };
    this.pointsRepo.setBalance(guildId, userId, 1000);
    return { success: true };
  }

  validateDuel(
    guildId: string,
    challengerId: string,
    challengedId: string,
    amount: number,
  ): ValidateDuelResult {
    if (challengerId === challengedId) return { valid: false, reason: 'self_duel' };

    const balance = this.pointsRepo.getBalance(guildId, challengerId);
    if (balance < 50 || balance < amount) return { valid: false, reason: 'insufficient_points' };

    const pendingChallenger = this.duelRepo.findByUser(guildId, challengerId);
    if (pendingChallenger) return { valid: false, reason: 'pending_duel_exists' };

    const pendingChallenged = this.duelRepo.findByUser(guildId, challengedId);
    if (pendingChallenged) return { valid: false, reason: 'pending_duel_exists' };

    return { valid: true };
  }

  resolveDuel(duelId: number, winnerId: string): ResolveDuelResult {
    const duel = this.duelRepo.findById(duelId);
    if (!duel) throw new Error(`Duel ${duelId} not found`);

    const loserId = winnerId === duel.challenger_id ? duel.challenged_id : duel.challenger_id;

    let pot: number;
    if (duel.is_all_in) {
      const winnerBal = this.pointsRepo.getBalance(duel.guild_id, winnerId);
      const loserBal = this.pointsRepo.getBalance(duel.guild_id, loserId);
      pot = winnerBal + loserBal;
      this.pointsRepo.setBalance(duel.guild_id, winnerId, pot);
      this.pointsRepo.setBalance(duel.guild_id, loserId, 0);
    } else {
      pot = duel.amount * 2;
      this.pointsRepo.transfer(duel.guild_id, loserId, winnerId, duel.amount);
    }

    this.duelRepo.delete(duelId);

    return {
      winnerId,
      loserId,
      pot,
      winnerNewBalance: this.pointsRepo.getBalance(duel.guild_id, winnerId),
      loserNewBalance: this.pointsRepo.getBalance(duel.guild_id, loserId),
    };
  }

  declineDuel(duelId: number): void {
    this.duelRepo.delete(duelId);
  }

  getRanking(guildId: string): { user_id: string; balance: number }[] {
    return this.pointsRepo.findRankingByGuild(guildId);
  }
}
