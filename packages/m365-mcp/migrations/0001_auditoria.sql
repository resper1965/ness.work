-- Toda escrita feita pelo MCP Microsoft 365: quem, o quê, quando e como terminou.
CREATE TABLE IF NOT EXISTS escritas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quando TEXT NOT NULL,
  oid TEXT NOT NULL,
  upn TEXT NOT NULL,
  ferramenta TEXT NOT NULL,
  alvo TEXT NOT NULL,
  situacao TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS escritas_upn_quando ON escritas (upn, quando);
