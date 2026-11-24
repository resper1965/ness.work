# Gera ativos/ttf/*.ttf a partir dos woff2 do NESS Design System, para embutir no Word e no PowerPoint
# (que só aceitam TrueType). Cada arquivo vira um estilo da família como o Office a nomeia: Regular ou
# Bold. O peso 600 faz o papel de Bold, como no design system. Licença: SIL OFL 1.1, que permite embutir.
#
#   pip install fonttools brotli && python3 ness/formatos/ativos/ttf.py
from pathlib import Path

from fontTools.ttLib import TTFont

AQUI = Path(__file__).parent
SAIDA = AQUI / "ttf"
ESTILOS = [
    ("inter-latin-400-normal", "Inter", "Regular"),
    ("inter-latin-600-normal", "Inter", "Bold"),
    ("montserrat-latin-500-normal", "Montserrat", "Regular"),
    ("montserrat-latin-600-normal", "Montserrat", "Bold"),
    ("jetbrains-mono-latin-400-normal", "JetBrains Mono", "Regular"),
]

SAIDA.mkdir(exist_ok=True)
for origem, familia, estilo in ESTILOS:
    fonte = TTFont(AQUI / f"{origem}.woff2")
    fonte.flavor = None
    nomes = fonte["name"]
    postscript = f"{familia.replace(' ', '')}-{estilo}"
    for registro in list(nomes.names):
        if registro.nameID in (16, 17, 21, 22):
            nomes.removeNames(nameID=registro.nameID)
    for nid, valor in ((1, familia), (2, estilo), (3, f"ness.;{postscript}"), (4, f"{familia} {estilo}"), (6, postscript)):
        nomes.setName(valor, nid, 3, 1, 0x409)
        nomes.setName(valor, nid, 1, 0, 0)
    negrito = estilo == "Bold"
    os2 = fonte["OS/2"]
    os2.fsSelection = (os2.fsSelection & ~0b1100001) | (0b100000 if negrito else 0b1000000)
    fonte["head"].macStyle = 1 if negrito else 0
    fonte.save(SAIDA / f"{postscript.lower()}.ttf")
    print(SAIDA / f"{postscript.lower()}.ttf")
