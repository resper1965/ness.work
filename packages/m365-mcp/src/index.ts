/**
 * MCP Microsoft 365 da ness. (Planner, To Do, contatos) em m365.ness.com.br. Servidor OAuth para o
 * gatekeeper MCP do ness.work e cliente OAuth do Entra ID, com o token do Graph de cada pessoa.
 * Decisão: docs/adr/0001-microsoft-365-via-gatekeeper-upstream.md.
 */
import { OAuthProvider } from "@cloudflare/workers-oauth-provider";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { entraHandler, trocaDeToken, type Env, type Props } from "./entra.js";
import { criarServidor } from "./ferramentas.js";

const ORIGEM = "https://m365.ness.com.br";

/** Sem sessão: cada requisição monta o servidor com as credenciais da pessoa e responde em JSON. */
const mcp = {
  async fetch(req: Request, env: Env, ctx: ExecutionContext & { props: Props }): Promise<Response> {
    const transporte = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    await criarServidor(env, ctx.props).connect(transporte);
    return transporte.handleRequest(req);
  },
};

export default new OAuthProvider<Env>({
  apiRoute: "/mcp",
  apiHandler: mcp as any,
  defaultHandler: entraHandler as any,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
  scopesSupported: ["m365"],
  resourceMetadata: { resource: `${ORIGEM}/mcp`, authorization_servers: [ORIGEM] },
  // A concessão vive 90 dias sem uso; o token do Graph é renovado a cada refresh (trocaDeToken).
  refreshTokenTTL: 90 * 24 * 3600,
  tokenExchangeCallback: trocaDeToken,
});
