// Imprime a instrução da instância (soul.md + agent.md). Uso: node ness/contexto/montar.mjs
import { montarInstrucao, LIMITE } from "./instrucao.mjs";
const texto = montarInstrucao();
console.error(`${texto.length} de ${LIMITE} caracteres`);
console.log(texto);
