import { Events } from 'discord.js';
import play from 'play-dl';
import { createClient } from './bot';
import { db } from './database/db';
import { CustomCommandRepository } from './database/repositories/CustomCommandRepository';
import { CustomCommandService } from './services/CustomCommandService';
import { NoteRepository } from './database/repositories/NoteRepository';
import { CommandHandler } from './handlers/CommandHandler';
import { InteractionHandler } from './handlers/InteractionHandler';
import { PointsRepository } from './database/repositories/PointsRepository';
import { PendingDuelRepository } from './database/repositories/PendingDuelRepository';
import { PointsService } from './services/PointsService';
import { MusicService } from './services/MusicService';

async function main() {
  const { env } = await import('./config/env') as { env: { DISCORD_TOKEN: string } };

  if (process.env.YOUTUBE_COOKIE) {
    await play.setToken({ youtube: { cookie: process.env.YOUTUBE_COOKIE } });
    console.log('YouTube cookies configured.');
  }

  const client = createClient();
  const repo = new CustomCommandRepository(db);
  const customCommandService = new CustomCommandService(repo);
  const noteRepo = new NoteRepository(db);
  const pointsRepo = new PointsRepository(db);
  const duelRepo = new PendingDuelRepository(db);
  const pointsService = new PointsService(pointsRepo, duelRepo);
  const musicService = new MusicService();
  const commandHandler = new CommandHandler(client, customCommandService, noteRepo, pointsService, duelRepo, musicService);
  const interactionHandler = new InteractionHandler(client, commandHandler, customCommandService, pointsService, duelRepo);

  client.once(Events.ClientReady, (readyClient) => {
    void (async () => {
      console.log(`Logged in as ${readyClient.user.tag}`);
      await commandHandler.load();
      await commandHandler.register();
      interactionHandler.register();
      console.log('Bot is ready.');
    })();
  });

  await client.login(env.DISCORD_TOKEN);
}

main().catch(console.error);
