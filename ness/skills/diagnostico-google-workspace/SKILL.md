---
name: diagnostico-google-workspace
description: Roteiro para diagnosticar problemas de Google Workspace de clientes (login e verificação em duas etapas, e-mail que não chega no Gmail, Drive e compartilhamento, Meet, Calendar, sincronização). Use quando um técnico relatar falha de acesso, e-mail perdido ou na quarentena, arquivo sem acesso, ou pedir para interpretar a pesquisa de registros de e-mail ou os logs do console de administração.
---

# Diagnóstico de Google Workspace

## Comece por aqui

1. **Status do serviço:** google.com/appsstatus. Incidente aberto do Google explica a falha.
2. **Escopo:** um usuário, uma unidade organizacional (OU) ou o domínio inteiro? No Workspace, quase toda política é por OU: usuário afetado sozinho costuma estar numa OU diferente.
3. **O que mudou:** política de segurança, licença, registros DNS, regra de roteamento.

## Login e verificação em duas etapas

Console de administração → **Relatórios → Auditoria e investigação → Eventos de registro de login**. Filtre pelo usuário e leia: tipo de falha, desafio de login, IP e se houve "login suspeito".

Usuário bloqueado: Usuários → o usuário → **Segurança**: redefinir desafio de login, gerar códigos alternativos da verificação em duas etapas, conferir se a conta está suspensa (o motivo aparece no topo do usuário).

SSO de terceiros (Entra, Okta): falha no IdP aparece no IdP, não no Google; confira o perfil SSO aplicado à OU do usuário.

## E-mail não chega (Gmail)

1. **Pesquisa de registros de e-mail:** Relatórios → Pesquisa de registros de e-mail (últimos 30 dias). Busque por remetente, destinatário ou ID da mensagem e leia o status de entrega.
2. **Quarentena:** Apps → Google Workspace → Gmail → Gerenciar quarentenas.
3. **Regras:** roteamento, conformidade de conteúdo e lista de bloqueio em Gmail → Conformidade e Roteamento podem rejeitar ou desviar silenciosamente.
4. Do lado do usuário: filtros e encaminhamento nas configurações do Gmail. Encaminhamento inesperado para fora é sinal de conta comprometida: trate como incidente de segurança.
5. Para e-mail **de fora** que não chega ou cai em spam, rode a skill `entregabilidade-email`.

## Drive e compartilhamento

Acesso negado: confira o dono do arquivo e os detalhes de compartilhamento do próprio item. Em Drive compartilhado, o acesso vem de três lugares: ser membro do drive, um compartilhamento direto do arquivo ou da pasta com quem não é membro, e pastas com acesso limitado, que restringem até membros. Confira os três, além da política de compartilhamento externo da OU do usuário e da configuração do drive compartilhado. Histórico do arquivo: Relatórios → Auditoria → **Eventos de registro do Drive**.

Arquivo "sumiu": evento de exclusão no log do Drive; restauração pelo console (Usuários → o usuário → Restaurar dados, até 25 dias após esvaziar a lixeira).

## Meet e Calendar

Meet que não entra: teste outro navegador e a rede (portas UDP 19302–19309 liberadas); qualidade ruim aparece no Painel de qualidade do Meet. Calendar: compartilhamento externo é política da OU; recurso (sala) com permissão de reserva por grupo.

## O que entregar

Nota para o chamado: sintoma, escopo e OU, evidência (evento de log, status da pesquisa de e-mail), causa provável e próxima ação com responsável. Mudança em política do domínio do cliente é recomendação; quem executa é a pessoa autorizada, conforme a GMUD do cliente.
