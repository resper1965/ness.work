// Chama a CLI oficial do Cloudflare OS (`cf-os api`, pacote @gadgets/api-cli do submódulo) direto pelo
// Node, sem shell: cada argumento chega intacto (aspas, acentos) também no Windows, onde o
// `pnpm exec` exigiria `shell: true` e concatenaria os argumentos sem escapar.
import { fileURLToPath } from "node:url";

export const CLI = fileURLToPath(new URL("../cloudflare-os/packages/api-cli/src/bin.ts", import.meta.url));

export function comandoCfOs(args) {
  return { cmd: process.execPath, args: [CLI, "api", ...args] };
}
