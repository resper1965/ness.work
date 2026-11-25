/**
 * Login da pessoa no Entra ID (código + PKCE, cliente confidencial) e renovação do token do Graph.
 * Este Worker é o servidor OAuth do gatekeeper MCP do ness.work e cliente OAuth do Entra: o token do
 * Graph fica cifrado na concessão (props) e nunca chega ao agente.
 */
import { AuthorizationError, authorizationErrorRedirect, OAuthError, type OAuthHelpers, type TokenExchangeCallbackOptions } from "@cloudflare/workers-oauth-provider";
import { graph } from "./graph.js";
import { redirectPermitido } from "./regras.js";

export interface Env {
  OAUTH_KV: KVNamespace;
  OAUTH_PROVIDER: OAuthHelpers;
  AUDITORIA: D1Database;
  ENTRA_TENANT_ID: string;
  ENTRA_CLIENT_ID: string;
  ENTRA_CLIENT_SECRET: string;
  /** Prefixo dos redirects de cliente aceitos: o callback do gatekeeper MCP do ness.work. */
  REDIRECT_PERMITIDO: string;
  /** Grupo do Entra cujos membros podem criar e atribuir tarefas no Planner. Vazio: ninguém. */
  PMO_GROUP_ID?: string;
}

export interface Props {
  oid: string;
  upn: string;
  nome: string;
  access: string;
  refresh: string;
  /** Expiração do token do Graph, em segundos desde a época. */
  expira: number;
}

const ESCOPOS = "openid profile offline_access User.Read User.ReadBasic.All Tasks.ReadWrite Contacts.ReadWrite Group.Read.All";
const b64url = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const entra = (env: Env, p: string) => `https://login.microsoftonline.com/${encodeURIComponent(env.ENTRA_TENANT_ID)}/oauth2/v2.0/${p}`;
const agora = () => Math.floor(Date.now() / 1000);

interface TokenEntra { access_token: string; refresh_token: string; expires_in: number }

async function tokenEntra(env: Env, campos: Record<string, string>): Promise<{ ok: true; t: TokenEntra } | { ok: false; erro: string; status: number }> {
  const corpo = new URLSearchParams({ client_id: env.ENTRA_CLIENT_ID, client_secret: env.ENTRA_CLIENT_SECRET, scope: ESCOPOS, ...campos });
  const r = await fetch(entra(env, "token"), { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: corpo });
  const j: any = await r.json().catch(() => ({}));
  return r.ok ? { ok: true, t: j } : { ok: false, erro: String(j.error ?? "erro"), status: r.status };
}

const texto = (msg: string, status = 400) => new Response(msg, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });

export const entraHandler = {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const oauth = env.OAUTH_PROVIDER;
    try {
      if (url.pathname === "/authorize" && req.method === "GET") {
        const pedido = await oauth.parseAuthRequest(req);
        // Sem tela de consentimento: só o gatekeeper do ness.work recebe o código, então um cliente
        // registrado por terceiros não tem para onde levá-lo (o "confused deputy" do MCP).
        if (!redirectPermitido(pedido.redirectUri, env.REDIRECT_PERMITIDO)) return texto("Cliente não autorizado: este servidor só atende o ness.work.", 403);
        const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)));
        const { state, headers } = await oauth.beginUpstream(pedido, { data: { verifier } });
        const desafio = b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
        const destino = new URL(entra(env, "authorize"));
        for (const [k, v] of Object.entries({
          client_id: env.ENTRA_CLIENT_ID, response_type: "code", response_mode: "query", redirect_uri: `${url.origin}/callback`,
          scope: ESCOPOS, state, code_challenge: desafio, code_challenge_method: "S256",
        })) destino.searchParams.set(k, v);
        headers.set("Location", destino.href);
        return new Response(null, { status: 302, headers });
      }

      if (url.pathname === "/callback" && req.method === "GET") {
        const { request: original, data, headers } = await oauth.finishUpstream<{ verifier: string }>(req);
        const code = url.searchParams.get("code");
        if (url.searchParams.get("error") || !code) {
          headers.set("Location", authorizationErrorRedirect(original, "access_denied"));
          return new Response(null, { status: 302, headers });
        }
        const r = await tokenEntra(env, { grant_type: "authorization_code", code, redirect_uri: `${url.origin}/callback`, code_verifier: data.verifier });
        if (!r.ok) return texto(`O Entra ID recusou o login (${r.erro}).`, 502);
        const eu = await graph<{ id: string; userPrincipalName: string; displayName: string }>(r.t.access_token, "GET", "/me?$select=id,userPrincipalName,displayName");
        const props: Props = { oid: eu.id, upn: eu.userPrincipalName, nome: eu.displayName, access: r.t.access_token, refresh: r.t.refresh_token, expira: agora() + r.t.expires_in };
        const { redirectTo } = await oauth.completeAuthorization({ request: original, userId: eu.id, metadata: { upn: eu.userPrincipalName }, scope: original.scope, props });
        headers.set("Location", redirectTo);
        return new Response(null, { status: 302, headers });
      }
    } catch (e) {
      if (e instanceof AuthorizationError) return texto(`Pedido de autorização inválido: ${e.description}`);
      throw e;
    }
    return texto("Não encontrado.", 404);
  },
};

/** Alinha a validade do token do ness.work à do token do Graph e renova o do Graph junto com o nosso. */
export async function trocaDeToken(o: TokenExchangeCallbackOptions<Env>) {
  const props = o.props as Props;
  if (o.grantType === "authorization_code") return { accessTokenTTL: Math.max(60, props.expira - agora() - 60) };
  if (o.grantType !== "refresh_token") return;
  const r = await tokenEntra(o.env, { grant_type: "refresh_token", refresh_token: props.refresh });
  if (!r.ok) {
    // invalid_grant: a pessoa revogou o acesso ou saiu da empresa. Revoga a concessão para forçar novo login.
    if (r.erro === "invalid_grant" || r.erro === "interaction_required") throw new OAuthError("invalid_grant", { description: "Acesso ao Microsoft 365 revogado ou expirado" });
    throw new OAuthError("temporarily_unavailable", { description: "Entra ID indisponível", statusCode: 503 });
  }
  const novas: Props = { ...props, access: r.t.access_token, refresh: r.t.refresh_token ?? props.refresh, expira: agora() + r.t.expires_in };
  return { newProps: novas, accessTokenProps: novas, accessTokenTTL: Math.max(60, r.t.expires_in - 60) };
}
