---
name: entregabilidade-email
description: Roteiro para diagnosticar e-mail que não chega, cai em spam ou é recusado (SPF, DKIM, DMARC, MX, reputação, cabeçalhos). Use quando um técnico colar um cabeçalho de e-mail ou NDR, ou pedir para verificar a configuração de e-mail de um domínio de cliente.
---

# Entregabilidade de e-mail

## Registros do domínio

| Verificar | Comando | Esperado |
|---|---|---|
| MX | `nslookup -type=mx dominio.com` / `dig mx dominio.com +short` | Aponta para o provedor certo (M365: `*.mail.protection.outlook.com`; Google: `smtp.google.com`) |
| SPF | `dig txt dominio.com +short` | **Um** registro `v=spf1` com todos os remetentes legítimos e no máximo 10 consultas DNS; termina em `-all` ou `~all` |
| DKIM | M365: `dig txt selector1._domainkey.dominio.com`; Google: `dig txt google._domainkey.dominio.com` | Chave publicada e assinatura ativa no provedor |
| DMARC | `dig txt _dmarc.dominio.com +short` | `v=DMARC1; p=quarantine` ou `p=reject`, com `rua=` para relatórios; `p=none` só monitora |

Erros comuns: dois registros SPF (invalida os dois); SPF com mais de 10 `include` (permerror); sistema que envia em nome do domínio (CRM, ERP, ferramenta de marketing) fora do SPF e sem DKIM próprio; DMARC `p=reject` antes de alinhar todos os remetentes.

## Ler um cabeçalho

Peça o cabeçalho completo (Outlook: Arquivo → Propriedades → Cabeçalhos da Internet; Gmail: ⋮ → Mostrar original). Leia nesta ordem:

1. `Authentication-Results` do servidor que recebeu (o de cima, do seu provedor): comece pelo `dmarc=`. O DMARC passa quando **pelo menos um** entre SPF e DKIM passa **e** está alinhado; um `spf=fail` ou um `dkim=fail` isolado não explica nada se o `dmarc=pass` (é comum em mensagem encaminhada ou com mais de uma assinatura).
2. **Alinhamento:** o domínio do `From:` precisa casar com o domínio do SPF (`smtp.mailfrom`) ou da assinatura DKIM (`header.d`). `dmarc=fail` com SPF e DKIM `pass` indica desalinhamento: o remetente assina ou envia com outro domínio.
3. Os `Received:` de baixo para cima mostram o caminho e onde houve atraso.
4. Pontuação de spam: `X-MS-Exchange-Organization-SCL` (M365; 5 ou mais = lixo) ou `X-Forefront-Antispam-Report`.

O analisador do Microsoft Remote Connectivity Analyzer (Message Header Analyzer) ajuda a ler.

## Reputação

IP ou domínio em lista de bloqueio derruba a entrega mesmo com SPF, DKIM e DMARC certos: consulte MXToolbox (Blacklist Check) e o Google Postmaster Tools do domínio remetente. Envio em massa sem cadência, lista comprada e alta taxa de reclamação derrubam a reputação.

## NDR (devolução)

Leia o código: `5.7.1` / `5.7.26` = recusado por política ou autenticação (geralmente DMARC); `5.1.1` = destinatário não existe; `5.4.1` = destino recusa o domínio (relay ou conector); `4.x.x` = temporário, o servidor vai tentar de novo.

## O que entregar

Diagnóstico com cada registro (atual × esperado), o resultado da autenticação no cabeçalho, a causa e a correção proposta em texto de registro DNS pronto para o responsável pelo DNS aplicar. Nunca altere DNS de cliente pela análise; a correção passa por quem administra a zona.
