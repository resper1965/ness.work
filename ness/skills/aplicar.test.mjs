import { test } from "node:test";
import assert from "node:assert/strict";
import { lerSkill, listarSkills } from "./aplicar.mjs";

test("lerSkill extrai name e description do frontmatter e guarda o arquivo inteiro", () => {
  const t = "---\nname: x\ndescription: Faz y.\n---\n\n# X\n";
  assert.deepEqual(lerSkill(t), { name: "x", description: "Faz y.", body: t });
});

test("lerSkill recusa arquivo sem frontmatter ou sem description", () => {
  assert.throws(() => lerSkill("# só título"), /frontmatter/);
  assert.throws(() => lerSkill("---\nname: x\n---\n"), /description/);
});

test("todas as skills do repositório têm frontmatter válido e nome igual à pasta", () => {
  const skills = listarSkills();
  assert.ok(skills.length >= 8);
  for (const s of skills) assert.equal(s.name, s.pasta);
});
