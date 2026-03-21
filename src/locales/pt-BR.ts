export const ptBR = {
  ping: {
    description: 'Verificar latência do bot e da API',
    response: (botLatency: number, apiLatency: number) =>
      `Pong! Bot: **${botLatency}ms** | API: **${apiLatency}ms**`,
  },
  help: {
    description: 'Listar todos os comandos disponíveis',
    title: 'Comandos Disponíveis',
    footer: 'Use / para acionar qualquer comando',
  },
  poke: {
    description: 'Cutucar outro usuário',
    userOption: 'O usuário a cutucar',
    response: (poker: string, pokee: string) => `👉 ${poker} cutucou ${pokee}!`,
  },
  command: {
    description: 'Gerenciar comandos personalizados',
    add: {
      description: 'Adicionar um novo comando personalizado',
      nameOption: 'Nome do comando',
      modalTitle: 'Criar Comando Personalizado',
      typeLabel: 'Tipo (response / warning / counter)',
      typePlaceholder: 'response',
      textLabel: 'Texto de resposta',
      textPlaceholder: 'Digite o texto para este comando...',
      success: (name: string) => `Comando \`/${name}\` criado com sucesso!`,
      alreadyExists: (name: string) => `Já existe um comando chamado \`/${name}\`.`,
      invalidType: 'Tipo inválido. Use: response, warning ou counter.',
    },
    edit: {
      description: 'Editar um comando personalizado existente',
      nameOption: 'Nome do comando a editar',
      modalTitle: 'Editar Comando Personalizado',
      typeLabel: 'Tipo (response / warning / counter)',
      textLabel: 'Texto de resposta',
      success: (name: string) => `Comando \`/${name}\` atualizado com sucesso!`,
      notFound: (name: string) => `Nenhum comando chamado \`/${name}\` encontrado.`,
      invalidType: 'Tipo inválido. Use: response, warning ou counter.',
    },
    delete: {
      description: 'Deletar um comando personalizado',
      nameOption: 'Nome do comando a deletar',
      success: (name: string) => `Comando \`/${name}\` deletado com sucesso!`,
      notFound: (name: string) => `Nenhum comando chamado \`/${name}\` encontrado.`,
    },
    list: {
      description: 'Listar todos os comandos personalizados',
      title: 'Comandos Personalizados',
      empty: 'Nenhum comando personalizado ainda. Use `/comando adicionar` para criar um.',
      entry: (name: string, type: string) => `\`/${name}\` — ${type}`,
    },
  },
  errors: {
    guildOnly: 'Este comando só pode ser usado em um servidor.',
    generic: 'Ocorreu um erro ao executar este comando.',
  },
};
