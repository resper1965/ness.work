---
name: relatorio-incidente
description: Estrutura e redige o relatório técnico de um incidente ou chamado crítico (linha do tempo, impacto, causa raiz, ações) no formato Documento ness. Use quando um técnico pedir RCA, pós-incidente, post-mortem, relatório de falha ou resumo de chamado para o cliente.
---

# Relatório de incidente

## Antes de escrever

Reúna com o técnico, uma pergunta por vez, o que não estiver nas fontes: quando começou e quando foi detectado, quem foi afetado e quanto, o que foi feito e quando, quando voltou ao normal e o que causou. Fontes possíveis: e-mails e reuniões do caso (conexão Microsoft 365), chamado, logs que o técnico colar.

Tudo que não tem fonte vira **pendência**, não afirmação. Horário sem confirmação aparece como "por volta de" com a fonte.

## Estrutura (Documento ness.)

Capa: cliente, título ("Relatório do incidente de <data>"), classificação (`confidencial` por padrão) e versão.

01 Resumo: três a cinco frases. O que aconteceu, impacto, duração, causa e situação atual.

02 Linha do tempo: tabela `Data e hora (BRT) | Evento | Fonte`, da primeira evidência ao encerramento. Separe **início**, **detecção**, **contenção** e **resolução**.

03 Impacto: serviços, usuários e dados afetados, com número e fonte. Diga se houve dado pessoal envolvido: se sim, sinalize que a avaliação de comunicação à ANPD e aos titulares (LGPD, art. 48) é do controlador e do encarregado do cliente.

04 Causa raiz: a causa técnica e o fator que permitiu que ela causasse impacto. Use os "cinco porquês" quando ajudar. Distinga **causa confirmada** de **hipótese**.

05 O que funcionou e o que não funcionou na resposta.

06 Ações: tabela `Ação | Responsável | Prazo | Situação`, separando correção imediata de prevenção.

07 Pendências: o que falta confirmar e com quem.

## Regras

Sem culpa individual: descreva falhas de processo e de controle, não de pessoas.

Tom NESS: direto e técnico, sem adjetivo e sem minimizar nem dramatizar o impacto.

O relatório é rascunho até a revisão do responsável técnico; quem envia ao cliente é uma pessoa.
