export const en = {
  ping: {
    description: 'Check bot and API latency',
    response: (botLatency: number, apiLatency: number) =>
      `Pong! Bot: **${botLatency}ms** | API: **${apiLatency}ms**`,
  },
  help: {
    description: 'List all available commands',
    title: 'Available Commands',
    footer: 'Use / to trigger any command',
  },
  poke: {
    description: 'Poke another user',
    userOption: 'The user to poke',
    response: (poker: string, pokee: string) => `👉 ${poker} poked ${pokee}!`,
  },
  command: {
    description: 'Manage custom commands',
    add: {
      description: 'Add a new custom command',
      nameOption: 'Command name',
      modalTitle: 'Create Custom Command',
      typeLabel: 'Type (response / warning / counter)',
      typePlaceholder: 'response',
      textLabel: 'Response text',
      textPlaceholder: 'Enter the text for this command...',
      success: (name: string) => `Command \`/${name}\` created successfully!`,
      alreadyExists: (name: string) => `A command named \`/${name}\` already exists.`,
      invalidType: 'Invalid type. Use: response, warning, or counter.',
    },
    edit: {
      description: 'Edit an existing custom command',
      nameOption: 'Command name to edit',
      modalTitle: 'Edit Custom Command',
      typeLabel: 'Type (response / warning / counter)',
      textLabel: 'Response text',
      success: (name: string) => `Command \`/${name}\` updated successfully!`,
      notFound: (name: string) => `No command named \`/${name}\` found.`,
      invalidType: 'Invalid type. Use: response, warning, or counter.',
    },
    delete: {
      description: 'Delete a custom command',
      nameOption: 'Command name to delete',
      success: (name: string) => `Command \`/${name}\` deleted successfully!`,
      notFound: (name: string) => `No command named \`/${name}\` found.`,
    },
    list: {
      description: 'List all custom commands',
      title: 'Custom Commands',
      empty: 'No custom commands yet. Use `/command add` to create one.',
      entry: (name: string, type: string) => `\`/${name}\` — ${type}`,
    },
  },
  errors: {
    guildOnly: 'This command can only be used in a server.',
    generic: 'An error occurred while executing this command.',
  },
};
