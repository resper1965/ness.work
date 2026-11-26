---
name: diagnostico-microsoft-365
description: Roteiro para diagnosticar problemas de Microsoft 365 de clientes (login e MFA no Entra ID, acesso condicional, e-mail que não chega no Exchange Online, Teams, OneDrive e SharePoint, Intune). Use quando um técnico relatar falha de login, e-mail perdido, sincronização parada, licença, permissão ou pedir para interpretar um erro AADSTS, rastreamento de mensagem ou log de entrada.
---

# Diagnóstico de Microsoft 365

## Comece por aqui

1. **Saúde do serviço:** centro de administração → Integridade do serviço. Incidente aberto da Microsoft explica a falha e encerra a investigação local.
2. **Escopo:** um usuário, um grupo ou o tenant inteiro? Um usuário aponta para licença, conta, dispositivo ou política; o tenant inteiro aponta para serviço, DNS ou mudança de configuração.
3. **O que mudou:** política de acesso condicional, licença, domínio, conector de e-mail, atualização do cliente.

## Login, MFA e acesso condicional (Entra ID)

Fonte principal: **Entra → Usuários → o usuário → Logs de entrada**. Abra a entrada com falha e leia: código de erro, aplicativo, política de acesso condicional aplicada (aba Acesso condicional) e o dispositivo.

| Erro | Significa | Ação |
|---|---|---|
| AADSTS50126 | Senha ou usuário inválido | Confirmar UPN; redefinir senha |
| AADSTS50053 | Conta bloqueada por tentativas | Aguardar ou desbloquear; verificar ataque de senha |
| AADSTS50076 / 50079 | Exige MFA ou cadastro de MFA | Cadastrar método em aka.ms/mysecurityinfo |
| AADSTS53003 | Bloqueado por acesso condicional | Ver qual política bloqueou e por qual condição |
| AADSTS50105 | Usuário não atribuído ao aplicativo | Atribuir em Aplicativos empresariais → Usuários e grupos |
| AADSTS700016 | Aplicativo não encontrado no tenant | Consentimento ou ID de aplicativo errado |

Use **"E se"** (What If) no acesso condicional para simular usuário, aplicativo e local antes de mudar política.

## E-mail não chega (Exchange Online)

1. **Rastreamento de mensagem:** Exchange admin center → Fluxo de e-mail → Rastreamento de mensagem (até 10 dias; mais que isso, relatório estendido). Ou PowerShell: `Get-MessageTraceV2 -RecipientAddress <email> -StartDate <data> -EndDate <data>`.
2. Leia o status: **Entregue** (procure em Lixo, regras de caixa, encaminhamento), **Falhou** (leia o NDR), **Em quarentena** (Defender → Quarentena), **Pendente** (destino recusando ou lento).
3. Para e-mail **de fora** que não chega, rode a skill `entregabilidade-email` no domínio do remetente.
4. Regras de caixa e encaminhamento: `Get-InboxRule -Mailbox <email>`. Regra inesperada que apaga ou encaminha é sinal de conta comprometida: trate como incidente de segurança.

## Teams, OneDrive e SharePoint

**Teams:** teste no navegador (teams.microsoft.com). Funciona no navegador e não no aplicativo = cache do cliente (limpar ou reinstalar). Falha nos dois = conta, licença ou política.

**OneDrive:** ícone de status do cliente de sincronização; caminho longo, caractere inválido ou arquivo bloqueado são as causas mais comuns. **SharePoint:** permissão é por site; confira em Configurações do site → Permissões e se o compartilhamento externo está liberado no tenant e no site.

**Licença:** `Get-MgUserLicenseDetail -UserId <email>` mostra os planos de serviço ativos; um serviço desligado dentro da licença explica "o recurso sumiu".

## Ferramentas

PowerShell: módulos `ExchangeOnlineManagement` (`Connect-ExchangeOnline`) e `Microsoft.Graph` (`Connect-MgGraph`). Diagnóstico guiado: Microsoft Remote Connectivity Analyzer (testconnectivity.microsoft.com) e o Support and Recovery Assistant.

## O que entregar

Nota para o chamado: sintoma, escopo, evidência (código de erro, ID de correlação, rastreamento), causa provável e próxima ação com responsável. Mudança em política ou configuração do tenant do cliente é recomendação; quem executa é a pessoa autorizada, conforme a GMUD do cliente.
