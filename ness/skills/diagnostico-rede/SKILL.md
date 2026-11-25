---
name: diagnostico-rede
description: Roteiro para diagnosticar problemas de rede de cliente ou interno (sem acesso, lentidão, queda intermitente, DNS, DHCP, VPN, Wi-Fi, firewall, MTU). Use quando um técnico relatar "a internet caiu", "está lento", "não resolve nome", "VPN não conecta", "perde pacote" ou pedir análise de saída de ping, traceroute, ipconfig ou logs de firewall.
---

# Diagnóstico de rede

## Como conduzir

Trabalhe de baixo para cima (camada física → enlace → IP → DNS → transporte → aplicação) e pare na primeira camada que falhar. Cada passo tem um teste, o resultado esperado e o que o resultado diferente significa.

Antes de testar, fixe o escopo com o técnico, uma pergunta por vez: quem é afetado (uma máquina, um segmento, todos), desde quando, o que mudou (mudança, atualização, contrato, firmware) e se é contínuo ou intermitente. Um usuário só aponta para a máquina; todos de um andar, para switch ou AP; todos, para link, firewall ou DNS.

## Testes por camada

| Camada | Windows | Linux / macOS | Esperado | Se falhar |
|---|---|---|---|---|
| Interface e endereço | `ipconfig /all` | `ip a` / `ifconfig` | IP da faixa certa, máscara, gateway, DNS | 169.254.x.x = sem DHCP; IP de outra faixa = VLAN errada ou DHCP intruso |
| Gateway | `ping <gateway>` | `ping -c 20 <gateway>` | 0% de perda, < 5 ms em LAN | Perda aqui = cabo, porta, Wi-Fi ou switch |
| Saída IP | `ping 1.1.1.1` | `ping -c 20 1.1.1.1` | Responde | Gateway ok e isto falha = firewall, NAT ou link |
| DNS | `nslookup exemplo.com` e `nslookup exemplo.com 1.1.1.1` | `dig exemplo.com` e `dig @1.1.1.1 exemplo.com` | Mesmo resultado nos dois | Só o público resolve = DNS interno; nenhum = porta 53 bloqueada |
| Caminho | `tracert -d <destino>` | `traceroute -n <destino>` / `mtr -rwc 100 <destino>` | Saltos sem perda crescente | Perda que começa num salto e segue até o fim = problema naquele salto |
| Porta | `Test-NetConnection <host> -Port 443` | `nc -vz <host> 443` | TcpTestSucceeded / succeeded | Recusado = serviço parado; tempo esgotado = firewall |
| MTU | `ping -f -l 1472 <destino>` | `ping -M do -s 1472 <destino>` | Responde | Falha só com pacote grande = MTU/MSS (comum em VPN e PPPoE) |

Perda só em um salto intermediário que **não** continua nos seguintes é limitação de ICMP do roteador, não problema.

## Sintomas comuns

**Lento só em alguns sites:** DNS lento (compare tempo de `nslookup` interno e público), MTU em VPN, inspeção TLS do firewall ou proxy.

**Cai de tempos em tempos:** colha um `mtr` ou `ping -t` longo durante a falha. Perda no gateway = rede local ou Wi-Fi (canal, interferência, roaming); perda só depois do gateway = link da operadora.

**VPN conecta e não acessa nada:** rotas (`route print` / `ip route`), split tunnel, DNS da VPN, sobreposição de faixa IP entre a casa do usuário e a rede interna.

**Wi-Fi:** sinal (`netsh wlan show interfaces`: sinal abaixo de 60% pede ajuste), canal congestionado em 2,4 GHz, roaming entre APs.

**DHCP:** escopo esgotado (veja no servidor), servidor intruso (`ipconfig /all` mostra o servidor DHCP), lease curto demais.

## O que entregar

Uma nota curta para o chamado: sintoma, escopo, testes feitos com o resultado de cada um, causa provável com a evidência e a próxima ação com o responsável (cliente, operadora, ness.). Se a causa não está confirmada, diga o que falta testar.

Nunca execute mudança em equipamento de cliente a partir desta análise: recomende, e a pessoa executa conforme a GMUD do cliente.
