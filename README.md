# herodll-bot-discord

A personal Discord bot built with **discord.js v14** and **TypeScript**, featuring custom slash commands, SQLite persistence, and bilingual support (English / Portuguese).

---

## Tech Stack

- **discord.js v14** — Discord API client
- **TypeScript** — type safety throughout
- **better-sqlite3** — synchronous SQLite (no ORM)
- **zod** — environment variable validation
- **tsx** — fast TypeScript execution in dev
- **Vitest** — unit testing
- **Render** — deployment

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in env vars
cp .env.example .env

# 3. Run in development mode
npm run dev
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DISCORD_TOKEN` | Yes | Bot token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | Yes | Application (client) ID |
| `GUILD_ID` | No | Dev server ID — enables instant command registration |
| `NODE_ENV` | No | `development` or `production` (default: `development`) |

---

## Available Commands

| Command | Alias | Description |
|---|---|---|
| `/ping` | — | Bot and API latency |
| `/help` | `/ajuda` | Lists all commands |
| `/poke @user` | `/cutucar @user` | Pokes a user |
| `/command add <name>` | `/comando adicionar` | Creates a custom command |
| `/command edit <name>` | `/comando editar` | Edits a custom command |
| `/command delete <name>` | `/comando deletar` | Deletes a custom command |
| `/command list` | `/comando listar` | Lists all custom commands |

### Custom Command Types

| Type | Behavior |
|---|---|
| `response` | Replies with fixed text |
| `warning` | Replies with a yellow embed |
| `counter` | Text with `{count}` placeholder — increments on each call |

---

## Project Structure

```
src/
├── commands/        # Slash command definitions (one file per command)
│   ├── utility/     # ping, help, poke
│   └── custom/      # /command manager
├── handlers/        # CommandHandler (loads/registers) + InteractionHandler (dispatches)
├── services/        # Business logic — no Discord.js dependencies
├── database/        # SQLite connection + repositories
├── types/           # Shared interfaces and types
├── locales/         # All user-facing strings (en + pt-BR)
└── config/          # Environment variable validation
```

---

## Coding Guidelines

### Principles

- **SOLID** — each class has one responsibility; depend on abstractions (`ICommand`), not concretions
- **DRY** — no repeated strings (use `locales/`), no manual command registration (auto-discovered)
- **KISS** — simplest solution that works; no premature abstractions
- **YAGNI** — do not add features until they are needed

### Adding a New Command

1. Create a new file in `src/commands/<category>/yourcommand.ts`
2. Export an object implementing `ICommand`
3. `CommandHandler` will auto-discover and register it — no other changes needed

### Adding a New Locale String

1. Add the key to `src/locales/en.ts`
2. Add the translation to `src/locales/pt-BR.ts`
3. Use Discord's `setNameLocalization` / `setDescriptionLocalization` for command names

### Testing

- Test all services and repositories
- Do not test Discord.js interaction objects directly — mock them
- Run: `npm test`

### Commit Convention

```
feat: add X
fix: correct Y
chore: update deps
refactor: simplify Z
```

---

## Deployment (Render)

1. Push to GitHub
2. Connect repo to Render (new **Background Worker** service)
3. Set env vars in Render dashboard
4. Add a **Disk** (1GB) mounted at `/app/data` for SQLite persistence
5. Render auto-builds and deploys on push
