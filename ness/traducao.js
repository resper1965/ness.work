// Interface do Cloudflare OS em pt-BR sem tocar no código dele: troca o texto exato de cada nó (e de placeholder,
// title e aria-label) pela tradução abaixo, e repete quando o React redesenha. Texto fora da tabela fica em inglês.
// Conteúdo de conversa, código e campos de digitação nunca são tocados.
// ponytail: dicionário de textos exatos do upstream | limite: texto novo ou alterado no Cloudflare OS volta a aparecer em inglês; frase montada com variável só traduz a parte fixa | gatilho: atualização do Cloudflare OS (rodar de novo a extração e completar a tabela) | dono: resper@ness.com.br
(() => {
  const PT = {
    // Navegação e ações gerais
    'Home': 'Início', 'Explore': 'Explorar', 'Workspaces': 'Espaços de trabalho', 'Your workspaces': 'Seus espaços de trabalho',
    'Recent workspaces': 'Espaços recentes', 'Blueprints': 'Modelos', 'Connections': 'Conexões', 'Gatekeepers': 'Gatekeepers',
    'Outputs': 'Resultados', 'Output': 'Resultado', 'Profile': 'Perfil', 'Account': 'Conta', 'Activity': 'Atividade',
    'Admin': 'Administração', 'Chat': 'Chat', 'Code': 'Código', 'Hooks': 'Gatilhos', 'Providers': 'Provedores',
    'AI providers': 'Provedores de IA', 'Favorites': 'Favoritos', 'Messages': 'Mensagens', 'History': 'Histórico',
    'Resources': 'Recursos', 'Security': 'Segurança', 'Attachments': 'Anexos', 'Observations': 'Observações',
    'Worktrees': 'Ramificações', 'Featured': 'Destaques', 'Skill': 'Skill', 'Slash commands': 'Comandos de barra',
    'Primary navigation': 'Navegação principal', 'Command palette': 'Paleta de comandos', 'Collapse sidebar': 'Recolher barra lateral',
    'Expand sidebar': 'Expandir barra lateral', 'Open profile menu': 'Abrir menu do perfil', 'Sign in': 'Entrar', 'Sign out': 'Sair',
    'Close': 'Fechar', 'Cancel': 'Cancelar', 'Save': 'Salvar', 'Back': 'Voltar', 'Next': 'Avançar', 'Continue': 'Continuar',
    'Try again': 'Tentar de novo', 'Retry': 'Tentar de novo', 'Reload': 'Recarregar', 'Rename': 'Renomear', 'Delete': 'Excluir',
    'Remove': 'Remover', 'Dismiss': 'Dispensar', 'Discard': 'Descartar', 'Add': 'Adicionar', 'Open': 'Abrir', 'Send': 'Enviar',
    'Search': 'Buscar', 'Filter': 'Filtrar', 'Sort': 'Ordenar', 'Download': 'Baixar', 'Approve': 'Aprovar', 'Deny': 'Negar',
    'Revoke': 'Revogar', 'Disconnect': 'Desconectar', 'Set up': 'Configurar', 'Get started': 'Começar', 'Not now': 'Agora não',
    'View all': 'Ver tudo', 'Show all': 'Mostrar tudo', 'Grid view': 'Ver em grade', 'List view': 'Ver em lista',
    'Name': 'Nome', 'Status': 'Status', 'Owner': 'Dono', 'Created': 'Criado', 'Time': 'Hora', 'Actions': 'Ações',
    'All': 'Todos', 'Available': 'Disponível', 'Enabled': 'Ativado', 'Disabled': 'Desativado', 'Connected': 'Conectado',
    'Pending': 'Pendente', 'Approved': 'Aprovado', 'Denied': 'Negado', 'Deleted': 'Excluído', 'Stopped': 'Parado',
    'Working': 'Trabalhando', 'Thinking': 'Pensando', 'Live': 'Ao vivo', 'Draft': 'Rascunho', 'Unread': 'Não lido',
    'Error': 'Erro', 'Loading...': 'Carregando...', 'Searching…': 'Buscando…', 'Setting up...': 'Configurando...',
    'Authenticating...': 'Autenticando...', 'Reconnecting…': 'Reconectando…', 'Compacting…': 'Compactando…',
    'Update available': 'Atualização disponível', 'Needs review': 'Precisa de revisão', 'Nothing to review': 'Nada a revisar',
    'Yours and shared': 'Seus e compartilhados', 'Shared with you': 'Compartilhados com você', 'Created by you': 'Criados por você',
    'Last active': 'Última atividade', 'Last Active': 'Última atividade', 'Oldest first': 'Mais antigos primeiro',
    'Something went wrong. Please try again.': 'Algo deu errado. Tente de novo.', 'Reload the page to try again.': 'Recarregue a página para tentar de novo.',
    'Check your connection and try refreshing the page.': 'Confira sua conexão e recarregue a página.',

    // Início e criação
    'What are we working on?': 'No que vamos trabalhar?', 'New workspace': 'Novo espaço de trabalho', 'Create workspace': 'Criar espaço de trabalho',
    'Open workspace': 'Abrir espaço de trabalho', 'Go to workspaces': 'Ir para os espaços de trabalho', 'Example tasks': 'Exemplos de tarefas',
    'Ask a question, create an output, or create an app that works with your tools and data.': 'Faça uma pergunta, gere um resultado ou crie um app que trabalha com suas ferramentas e dados.',
    'Each workspace is an isolated environment with its own conversations, gatekeepers, and outputs.': 'Cada espaço de trabalho é isolado, com suas próprias conversas, gatekeepers e resultados.',
    'No workspaces yet. Create your first one above!': 'Nenhum espaço de trabalho ainda. Crie o primeiro acima.',
    'No workspaces found': 'Nenhum espaço de trabalho encontrado', 'Search workspaces…': 'Buscar espaços de trabalho…',
    'Search workspaces and actions…': 'Buscar espaços de trabalho e ações…', 'Favorite a workspace to keep it here.': 'Marque um espaço como favorito para mantê-lo aqui.',
    'Rename workspace': 'Renomear espaço de trabalho', 'Delete workspace': 'Excluir espaço de trabalho', 'Delete workspace?': 'Excluir o espaço de trabalho?',
    'Workspace deleted': 'Espaço de trabalho excluído', 'Workspace removed from list': 'Espaço removido da lista', 'Workspace actions': 'Ações do espaço de trabalho',
    'Save workspace title': 'Salvar título do espaço', 'Loading workspace…': 'Carregando espaço de trabalho…', 'Invite to workspace': 'Convidar para o espaço',
    'People in this workspace': 'Pessoas neste espaço', 'People with access': 'Pessoas com acesso', 'More workspace views and actions': 'Mais visões e ações do espaço',
    'Unable to load your workspaces. Check your connection and try refreshing.': 'Não foi possível carregar seus espaços. Confira a conexão e recarregue.',
    'Something went wrong loading your workspaces.': 'Algo deu errado ao carregar seus espaços.',
    'Mark workspace read': 'Marcar espaço como lido', 'Build a quick tool': 'Criar uma ferramenta rápida', 'Automate a workflow': 'Automatizar um fluxo',
    'Find insights in my data': 'Encontrar insights nos meus dados', 'Build a team meeting deck': 'Montar slides para a reunião do time',
    'A small interactive app, calculator, or dashboard': 'Um app interativo pequeno, calculadora ou painel',
    'Turn a spreadsheet or CSV into trends and recommendations': 'Transformar uma planilha ou CSV em tendências e recomendações',
    'Trigger an agent when a new email arrives': 'Acionar um agente quando chegar um e-mail novo',
    'Slides with progress, risks, and what needs a decision': 'Slides com andamento, riscos e o que precisa de decisão',
    'A doc with a snapshot, things to inspect, and one ask': 'Um documento com o retrato, os pontos a examinar e um pedido',

    // Conversa
    'Send message': 'Enviar mensagem', 'Send to the agent': 'Enviar ao agente', 'Message to send': 'Mensagem a enviar', 'Stop agent': 'Parar agente',
    'Copy message': 'Copiar mensagem', 'Copy code': 'Copiar código', 'Rename chat': 'Renomear conversa', 'Delete chat': 'Excluir conversa',
    'Delete conversation?': 'Excluir a conversa?', 'Save chat title': 'Salvar título da conversa', 'Cancel title edit': 'Cancelar edição do título',
    'More chat options': 'Mais opções da conversa', 'Chat deleted successfully': 'Conversa excluída', 'Chat title updated successfully': 'Título da conversa atualizado',
    'Back to conversations': 'Voltar às conversas', 'No conversations yet': 'Nenhuma conversa ainda', 'Filter conversations': 'Filtrar conversas',
    'Loading conversation…': 'Carregando conversa…', 'Loading earlier messages…': 'Carregando mensagens anteriores…', 'Unable to load conversations': 'Não foi possível carregar as conversas',
    'Mark thread read': 'Marcar como lida', 'Mark thread unread': 'Marcar como não lida', 'Add to conversation': 'Adicionar à conversa',
    'Context compacted': 'Contexto compactado', 'Using tool': 'Usando ferramenta', 'Total cost': 'Custo total', 'No agent': 'Sem agente',
    'Choose your model': 'Escolha o modelo', 'Select model': 'Selecionar modelo', 'Loading commands…': 'Carregando comandos…',
    'Slash commands cannot include resources or attachments': 'Comandos de barra não aceitam recursos nem anexos',
    'Upload failed': 'Falha no envio', 'This file can’t be previewed here.': 'Este arquivo não tem pré-visualização aqui.',
    'Close preview': 'Fechar pré-visualização', 'Full-screen preview': 'Pré-visualização em tela cheia', 'Enter full screen': 'Tela cheia',

    // Aprovações e acesso
    'Always approve': 'Aprovar sempre', 'Auto-approval': 'Aprovação automática', 'Loading auto-approval…': 'Carregando aprovação automática…',
    'Allow access': 'Permitir acesso', 'Grant access': 'Conceder acesso', 'Permission requested': 'Permissão solicitada', 'Legacy access': 'Acesso legado',
    'Requests that need your approval show up here and in the workspace header.': 'Pedidos que precisam da sua aprovação aparecem aqui e no topo do espaço de trabalho.',
    'Gatekeeper': 'Gatekeeper', 'Gatekeeper keeps Gadget access limited to connected resources': 'O Gatekeeper limita o Gadget aos recursos conectados',
    'Every resource an agent reads or changes is recorded here.': 'Todo recurso que um agente lê ou altera fica registrado aqui.',
    'Keeps each workspace limited to the resources you connect and ensures every user has the required permissions before accessing them.': 'Limita cada espaço aos recursos que você conecta e garante que cada pessoa tenha as permissões necessárias antes de acessá-los.',
    'Search gatekeepers…': 'Buscar gatekeepers…', 'Loading gatekeepers...': 'Carregando gatekeepers...',
    'Something went wrong loading your gatekeepers.': 'Algo deu errado ao carregar os gatekeepers.',

    // Conexões
    'Connect your services': 'Conecte seus serviços', 'Connect resource': 'Conectar recurso', 'Open resource': 'Abrir recurso',
    'Delete connection': 'Excluir conexão', 'Cancel connection': 'Cancelar conexão', 'Loading connections...': 'Carregando conexões...',
    'Loading connections…': 'Carregando conexões…', 'No connected resources': 'Nenhum recurso conectado', 'No resources added yet': 'Nenhum recurso adicionado',
    'No matching resources.': 'Nenhum recurso encontrado.', 'Select at least one resource to continue.': 'Escolha ao menos um recurso para continuar.',
    'Add the apps and accounts your workspaces can use. Connect once, then wire them into anything you build.': 'Adicione os apps e contas que seus espaços podem usar. Conecte uma vez e use em tudo o que criar.',
    'Link your accounts so your gadgets can access them. You can always add more later.': 'Vincule suas contas para os gadgets usarem. Dá para adicionar mais depois.',
    'External resources this gadget can use.': 'Recursos externos que este gadget pode usar.', 'Files, connections, and skills': 'Arquivos, conexões e skills',
    'Built-in tools': 'Ferramentas nativas', 'API scopes': 'Escopos da API', 'Binding name': 'Nome do vínculo',

    // Modelos (blueprints) e resultados
    'Explore blueprints': 'Explorar modelos', 'Browse all blueprints': 'Ver todos os modelos', 'Search blueprints…': 'Buscar modelos…',
    'No blueprints yet': 'Nenhum modelo ainda', 'No blueprints found': 'Nenhum modelo encontrado', 'Untitled blueprint': 'Modelo sem título',
    'Start from a featured blueprint.': 'Comece por um modelo em destaque.', 'Publish as blueprint…': 'Publicar como modelo…',
    'Update from blueprint…': 'Atualizar a partir do modelo…', 'Remove from library': 'Remover da biblioteca', 'Removed from library': 'Removido da biblioteca',
    'Something went wrong loading your blueprints.': 'Algo deu errado ao carregar os modelos.',
    'Everything your workspaces have produced, in one place.': 'Tudo o que seus espaços produziram, num lugar só.',
    'Search outputs…': 'Buscar resultados…', 'Rename output': 'Renomear resultado', 'Output actions': 'Ações do resultado',
    'Something went wrong loading your outputs.': 'Algo deu errado ao carregar os resultados.',
    'No gadgets yet': 'Nenhum gadget ainda', 'No gadget UI yet': 'Nenhuma interface de gadget ainda', 'Rename gadget': 'Renomear gadget',
    'Share gadget': 'Compartilhar gadget', 'Export Gadget': 'Exportar gadget', 'Save gadget name': 'Salvar nome do gadget',
    'Ask the agent in chat to build something, and it will appear here.': 'Peça ao agente no chat para criar algo e o resultado aparece aqui.',

    // Rascunhos e mudanças
    'Save draft': 'Salvar rascunho', 'Pending changes': 'Mudanças pendentes', 'Draft changes pending': 'Mudanças do rascunho pendentes',
    'Accept changes': 'Aceitar mudanças', 'Accept anyway': 'Aceitar mesmo assim', 'Changes accepted': 'Mudanças aceitas', 'Changes discarded': 'Mudanças descartadas',
    'Changes saved': 'Mudanças salvas', 'Discard all pending changes?': 'Descartar todas as mudanças pendentes?', 'Pending changes discarded': 'Mudanças pendentes descartadas',
    'This draft still has merge conflicts': 'Este rascunho ainda tem conflitos', 'Draft rewound': 'Rascunho revertido', 'Keep resolving': 'Continuar resolvendo',

    // Compartilhamento
    'Create a share link': 'Criar link de compartilhamento', 'Share links': 'Links de compartilhamento', 'Share link name': 'Nome do link',
    'Name this link…': 'Dê um nome a este link…', 'Link copied to clipboard.': 'Link copiado.', 'Share link revoked.': 'Link revogado.',
    'Share link renamed.': 'Link renomeado.', 'Can edit': 'Pode editar', 'Invalid or expired share link.': 'Link inválido ou vencido.',
    'Share a workspace with teammates and work on it together, live.': 'Compartilhe um espaço com o time e trabalhem juntos, ao vivo.',
    'Collaborate in real time': 'Colabore em tempo real', 'Matching people': 'Pessoas encontradas', 'No users found.': 'Nenhuma pessoa encontrada.',

    // Atividade
    'View activity': 'Ver atividade', 'Show all activity': 'Mostrar toda a atividade', 'No activity yet': 'Nenhuma atividade ainda',
    'No new activity': 'Nenhuma atividade nova', 'Loading activity…': 'Carregando atividade…', 'No matching events': 'Nenhum evento encontrado',
    'Not read yet': 'Ainda não lido', 'Still checking older activity…': 'Ainda conferindo atividades antigas…',

    // Perfil e conta
    'Display name': 'Nome de exibição', 'Edit display name': 'Editar nome de exibição', 'Enter display name': 'Digite o nome de exibição',
    'Save display name': 'Salvar nome de exibição', 'Display name updated': 'Nome de exibição atualizado', 'Display name cannot be empty': 'O nome de exibição não pode ficar vazio',
    'Manage your account details, avatar, and security.': 'Gerencie os dados da conta, o avatar e a segurança.', 'Loading profile…': 'Carregando perfil…',
    'Click the avatar to upload a new photo': 'Clique no avatar para enviar uma foto nova', 'Avatar updated': 'Avatar atualizado',
    'Password': 'Senha', 'Current password': 'Senha atual', 'New password': 'Nova senha', 'Confirm new password': 'Confirme a nova senha',
    'Confirm Password': 'Confirme a senha', 'Enter current password': 'Digite a senha atual', 'Enter new password': 'Digite a nova senha',
    'Password changed successfully': 'Senha alterada', 'Must be at least 8 characters': 'Mínimo de 8 caracteres', 'Username': 'Usuário',
    'User ID': 'ID do usuário', 'Copy user ID': 'Copiar ID do usuário', 'User ID copied': 'ID do usuário copiado',
    'Sign in to your account': 'Entre na sua conta', 'Create account': 'Criar conta', 'Create your account': 'Crie sua conta',
    'Create your profile': 'Crie seu perfil', 'How should we call you?': 'Como devemos chamar você?', 'Login failed': 'Falha no login',
    'Signups are closed': 'Cadastros fechados', 'Just a few things before you start building': 'Só alguns passos antes de começar',
    'Commit email': 'E-mail dos commits', 'Edit commit email': 'Editar e-mail dos commits', 'Save commit email': 'Salvar e-mail dos commits',

    // Provedores e modelos de IA
    'Search providers…': 'Buscar provedores…', 'Add provider': 'Adicionar provedor', 'Edit provider': 'Editar provedor', 'Delete provider': 'Excluir provedor',
    'No providers found': 'Nenhum provedor encontrado', 'Provider actions': 'Ações do provedor', 'Bring your own models': 'Use seus próprios modelos',
    'Configure the AI models available to your workspaces.': 'Configure os modelos de IA disponíveis nos espaços de trabalho.',
    'Something went wrong loading your providers.': 'Algo deu errado ao carregar os provedores.',

    // Gatilhos
    'Delete hook': 'Excluir gatilho', 'Hooks enabled': 'Gatilhos ativados',
    'This permanently removes the hook. Future events will stop being delivered.': 'Isto remove o gatilho de vez. Os próximos eventos deixam de ser entregues.',

    // Skills
    'Search skills': 'Buscar skills', 'Search skills…': 'Buscar skills…', 'Loading skills…': 'Carregando skills…',
  }

  const PULAR = 'pre, code, textarea, input, [contenteditable="true"], [class*="markdownContent"], [class*="group/message"] p'
  const ATRIBUTOS = ['placeholder', 'title', 'aria-label']

  /** Tradução do texto exato, mantendo os espaços das pontas; sem tradução, devolve null. */
  const traduzir = (s) => {
    const t = s.trim()
    const pt = t && Object.prototype.hasOwnProperty.call(PT, t) ? PT[t] : null
    return pt && s.replace(t, pt)
  }

  const noTexto = (n) => {
    const p = n.parentElement
    if (!p || p.closest(PULAR)) return
    const pt = traduzir(n.data)
    if (pt && pt !== n.data) n.data = pt
  }
  const noElemento = (el) => {
    for (const a of ATRIBUTOS) {
      const v = el.getAttribute(a)
      const pt = v && traduzir(v)
      if (pt && pt !== v) el.setAttribute(a, pt)
    }
  }
  const varrer = (raiz) => {
    if (raiz.nodeType === 3) return noTexto(raiz)
    if (raiz.nodeType !== 1) return
    noElemento(raiz)
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)
    for (let n = w.nextNode(); n; n = w.nextNode()) n.nodeType === 3 ? noTexto(n) : noElemento(n)
  }

  globalThis.__nessTraduzir = traduzir // para o teste
  if (typeof document === 'undefined') return
  document.documentElement.lang = 'pt-BR'
  const iniciar = () => {
    varrer(document.body)
    new MutationObserver((ms) => {
      for (const m of ms) {
        if (m.type === 'characterData') noTexto(m.target)
        else if (m.type === 'attributes') noElemento(m.target)
        else m.addedNodes.forEach(varrer)
      }
    }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATRIBUTOS })
  }
  document.body ? iniciar() : document.addEventListener('DOMContentLoaded', iniciar)
})()
