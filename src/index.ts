import { Events } from 'discord.js';
import { createClient } from './bot';
import { db } from './database/db';
import { CustomCommandRepository } from './database/repositories/CustomCommandRepository';
import { CustomCommandService } from './services/CustomCommandService';
import { NoteRepository } from './database/repositories/NoteRepository';
import { CommandHandler } from './handlers/CommandHandler';
import { InteractionHandler } from './handlers/InteractionHandler';

async function main() {
  const { env } = await import('./config/env') as { env: { DISCORD_TOKEN: string } };

  const client = createClient();
  const repo = new CustomCommandRepository(db);
  const customCommandService = new CustomCommandService(repo);
  const noteRepo = new NoteRepository(db);
  const commandHandler = new CommandHandler(client, customCommandService, noteRepo);
  const interactionHandler = new InteractionHandler(client, commandHandler, customCommandService);

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
