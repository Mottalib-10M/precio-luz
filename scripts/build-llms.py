#!/usr/bin/env python3
"""Genera public/llms.txt a partir del build (RECETTE §21). Aufruf: npm run build && python3 scripts/build-llms.py && npm run build"""
import glob, html, os, re
SITE = re.search(r'SITE_URL = "([^"]+)"', open('src/data/site-config.ts').read()).group(1)
rows = {'es': [], 'en': []}
for f in sorted(glob.glob('dist/*/**/index.html', recursive=True)):
    d = open(f, encoding='utf-8').read()
    if 'noindex' in d[:3000] or '/embed/' in f: continue
    path = '/' + os.path.relpath(os.path.dirname(f), 'dist').replace(os.sep, '/') + '/'
    lang = path.split('/')[1]
    if lang not in rows: continue
    t = html.unescape(re.search(r'<title>(.*?)</title>', d, re.S).group(1))
    m = re.search(r'name="description" content="(.*?)"', d, re.S)
    rows[lang].append((path, t, html.unescape(m.group(1)) if m else ''))
out = ['# Precio Luz Real', '',
       '> Sitio independiente de Radif Partners, en español e inglés, sobre el precio de la electricidad PVPC en España en 2026: los 24 precios horarios de hoy y de mañana publicados por Red Eléctrica, con impuesto eléctrico e IVA (o IGIC en Canarias), el mercado al cuarto de hora, la factura completa, la potencia contratada, el bono social y el coste de cada electrodoméstico según la hora.', '',
       'Datos: archivo público PVPC de e·sios (Red Eléctrica), actualizado cada tarde; peajes, cargos e impuestos del BOE. Los cálculos se hacen en el navegador, sin recoger datos ni pedir teléfonos. Los resultados son estimaciones.', '']
for lang, titel in (('es', '## Páginas en español'), ('en', '## Pages in English')):
    out.append(titel); out.append('')
    for p, t, d in rows[lang]: out.append(f'- [{t}]({SITE}{p}): {d}')
    out.append('')
open('public/llms.txt', 'w', encoding='utf-8').write('\n'.join(out))
print('llms.txt:', sum(len(v) for v in rows.values()), 'páginas')
