declare namespace Cloudflare {
  interface GlobalProps {
    mainModule: typeof import("./index.js");
    durableNamespaces: "CustomGatekeeper";
  }
  interface Env {
    /** Chave de serviço do ness.know (Bearer), emitida no admin do know. Segredo do Wrangler. */
    NESS_KNOW_TOKEN?: string;
  }
}
