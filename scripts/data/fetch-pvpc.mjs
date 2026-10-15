#!/usr/bin/env node
/**
 * Descarga los precios oficiales y los guarda en src/data/ (RECETTE §4 : script rejouable, datos fechados).
 * Uso : node scripts/data/fetch-pvpc.mjs [--dias=400] [--sin-red]
 *
 * Fuentes, todas públicas y sin token :
 *  1. PVPC 2.0TD hora a hora : archivo público n.º 70 de e·sios (Red Eléctrica), un JSON por día
 *     https://api.esios.ree.es/archives/70/download_json?locale=es&date=AAAA-MM-DD
 *     Columnas usadas : PCB (término de energía del PVPC, €/MWh, Península, Canarias y Baleares, sin impuestos)
 *     y TEUPCB (parte de peajes y cargos de ese término), y COF2TD (perfil de consumo tipo 2.0TD). Red Eléctrica publica el día siguiente hacia las 20:15.
 *  2. Precio del mercado diario cada cuarto de hora (96 valores) : API REData de Red Eléctrica
 *     https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real (serie « Precio mercado spot »).
 *  3. IPC de la subclase Electricidad, variación anual : INE, serie IPC291482 (API Tempus 3), que activa
 *     o no las rebajas de IVA e impuesto eléctrico de noviembre y diciembre de 2026 (RDL 25/2026, arts. 18 a 21).
 *
 * Si una descarga falla, el script conserva lo que ya había y lo dice : la página muestra entonces el
 * precio medio estimado (lib/engine/pvpc.ts > perfilEstimado), nunca un precio inventado.
 * La API e·sios con token (api.esios.ree.es/indicators/1001) no se usa : si un día hiciera falta, el
 * workflow lee ESIOS_TOKEN de los secretos de GitHub y la pasa en la cabecera x-api-key (ver más abajo).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATA = join(ROOT, 'src', 'data');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=')[1] : d; };
const DIAS = Number(arg('dias', 400));
const SIN_RED = process.argv.includes('--sin-red');
const TOKEN = process.env.ESIOS_TOKEN || '';

/** Fecha de hoy en Madrid, AAAA-MM-DD. */
export function hoyMadrid(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
const addDays = (iso, n) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const num = (s) => Number(String(s).replace(/\./g, '').replace(',', '.'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, headers = {}) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'precio-luz-datos/1.0 (+https://github.com/Mottalib-10M)', ...headers }, signal: AbortSignal.timeout(30000) });
      if (r.ok) return await r.json();
      if (r.status === 404) return null;
    } catch { /* reintento */ }
    await sleep(1500 * (i + 1));
  }
  return null;
}

/** Un día del archivo 70 : { p: [€/MWh], t: [€/MWh peajes y cargos], h: [hora de inicio] } o null. */
async function diaPVPC(fecha) {
  const j = await getJSON(`https://api.esios.ree.es/archives/70/download_json?locale=es&date=${fecha}`);
  const filas = j?.PVPC;
  if (!Array.isArray(filas) || filas.length < 23) return null;
  const [d, m, y] = filas[0].Dia.split('/');
  if (`${y}-${m}-${d}` !== fecha) return null;
  const p = filas.map((f) => num(f.PCB));
  const t = filas.map((f) => num(f.TEUPCB));
  // Perfil inicial de consumo 2.0TD publicado por Red Eléctrica (fracción del consumo anual tipo en esa hora).
  const c = filas.map((f) => Number(num(f.COF2TD).toPrecision(6)));
  if (p.some((x) => !Number.isFinite(x))) return null;
  // Hora de inicio de cada fila : 24 filas normales, 25 el día del cambio a horario de invierno
  // (la hora 02 se repite), 23 el día del cambio a horario de verano (no hay hora 02).
  let h;
  if (filas.length === 24) h = undefined;
  else if (filas.length === 25) h = [0, 1, 2, 2, ...Array.from({ length: 21 }, (_, i) => i + 3)];
  else h = filas.map((f) => Number(f.Hora.slice(0, 2)));
  return h ? { p, t, c, h } : { p, t, c };
}

/** Cuartos de hora del mercado diario (Red Eléctrica, REData) para unas fechas. */
async function cuartos(desde, hasta) {
  const j = await getJSON(`https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real?start_date=${desde}T00:00&end_date=${hasta}T23:59&time_trunc=hour`);
  const serie = j?.included?.find((x) => x.type === 'Precio mercado spot');
  if (!serie) return null;
  const out = {};
  for (const v of serie.attributes.values) {
    const f = v.datetime.slice(0, 10);
    (out[f] ??= []).push(Math.round(v.value * 100) / 100);
  }
  return out;
}

/** Variación anual del IPC de la electricidad (INE, serie IPC291482), últimos 24 meses. */
async function ipcElectricidad() {
  const j = await getJSON('https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/IPC291482?nult=24');
  if (!j?.Data) return null;
  return j.Data.map((x) => ({ mes: `${x.Anyo}-${String(x.FK_Periodo).padStart(2, '0')}`, variacion: x.Valor })).sort((a, b) => a.mes.localeCompare(b.mes));
}

const leer = (f, def) => (existsSync(join(DATA, f)) ? JSON.parse(readFileSync(join(DATA, f), 'utf8')) : def);
const escribir = (f, o) => writeFileSync(join(DATA, f), JSON.stringify(o) + '\n');

async function main() {
  const hoy = hoyMadrid();
  const manana = addDays(hoy, 1);
  const hist = leer('pvpc-historico.json', { fuente: '', dias: {} });
  const avisos = [];
  if (!SIN_RED) {
    // Días que faltan en la ventana, más los tres últimos (Red Eléctrica puede corregir) y mañana.
    const desde = addDays(hoy, -DIAS);
    const objetivo = [];
    for (let f = desde; f <= manana; f = addDays(f, 1)) if (!hist.dias[f] || !hist.dias[f].c || f >= addDays(hoy, -2)) objetivo.push(f);
    let ok = 0;
    for (const f of objetivo) {
      const d = await diaPVPC(f);
      if (d) { hist.dias[f] = d; ok++; }
      else if (f === manana) avisos.push(`PVPC de mañana (${f}) aún no publicado`);
      else if (f === hoy && !hist.dias[f]) avisos.push(`PVPC de hoy (${f}) no disponible`);
      await sleep(150);
    }
    console.log(`PVPC : ${ok}/${objetivo.length} días descargados`);
  }
  // Ventana deslizante : nada anterior a DIAS días.
  const limite = addDays(hoy, -DIAS);
  hist.dias = Object.fromEntries(Object.entries(hist.dias).filter(([f]) => f >= limite).sort(([a], [b]) => a.localeCompare(b)));
  hist.fuente = 'Red Eléctrica, e·sios, archivo 70 « PVPC 2.0TD », columnas PCB y TEUPCB (€/MWh) y COF2TD (perfil de consumo)';
  escribir('pvpc-historico.json', hist);

  // Resumen ligero para los mini-simuladores (los importa el navegador): media de 30 días y perfil
  // horario medio de los 28 últimos días, laborables por un lado, fines de semana y festivos por otro.
  const params = JSON.parse(readFileSync(join(DATA, 'params-2026.json'), 'utf8'));
  const festivos = params.periodos_2_0td.festivos_nacionales_fecha_fija;
  const esValle = (f) => { const d = new Date(`${f}T12:00:00Z`).getUTCDay(); return d === 0 || d === 6 || festivos.includes(f.slice(5)); };
  const ult = (n) => Object.entries(hist.dias).filter(([f]) => f > addDays(hoy, -n) && f <= hoy);
  const v30 = ult(30).flatMap(([, d]) => d.p);
  const perfil = (valle) => { const ds = ult(28).filter(([f, d]) => esValle(f) === valle && d.p.length === 24); return { dias: ds.length, eurKwh: Array.from({ length: 24 }, (_, i) => Math.round(ds.reduce((a, [, d]) => a + d.p[i], 0) / ds.length / 1000 * 1e5) / 1e5) }; };
  escribir('resumen.json', { hoy, media30EurKwh: Math.round(v30.reduce((a, b) => a + b, 0) / v30.length / 1000 * 1e5) / 1e5, laborable: perfil(false), finde: perfil(true) });

  const cq = SIN_RED ? null : await cuartos(addDays(hoy, -6), manana);
  const merc = leer('mercado-cuartos.json', { fuente: '', dias: {} });
  if (cq) { for (const [f, v] of Object.entries(cq)) if (v.length >= 92) merc.dias[f] = v; }
  else if (!SIN_RED) avisos.push('Cuartos de hora del mercado : descarga fallida, se conservan los anteriores');
  merc.dias = Object.fromEntries(Object.entries(merc.dias).filter(([f]) => f >= addDays(hoy, -6)).sort(([a], [b]) => a.localeCompare(b)));
  merc.fuente = 'Red Eléctrica, REData, « Precios mercado peninsular en tiempo real », serie « Precio mercado spot » (€/MWh)';
  escribir('mercado-cuartos.json', merc);

  const ipc = SIN_RED ? null : await ipcElectricidad();
  const ipcPrev = leer('ipc-electricidad.json', { fuente: '', meses: [] });
  if (ipc?.length) ipcPrev.meses = ipc; else if (!SIN_RED) avisos.push('IPC de la electricidad : descarga fallida, se conserva el anterior');
  ipcPrev.fuente = 'INE, IPC base 2025, subclase 04.5.1.0 Electricidad, variación anual (serie IPC291482)';
  escribir('ipc-electricidad.json', ipcPrev);

  const estado = {
    generado: SIN_RED ? (leer('estado.json', {}).generado ?? new Date().toISOString()) : new Date().toISOString(),
    hoy, manana,
    hoyPublicado: Boolean(hist.dias[hoy]),
    mananaPublicado: Boolean(hist.dias[manana]),
    diasHistorico: Object.keys(hist.dias).length,
    avisos,
  };
  escribir('estado.json', estado);
  for (const a of avisos) console.warn(`AVISO : ${a}`);
  if (TOKEN) console.log('ESIOS_TOKEN presente (no utilizado : el archivo público basta).');
}

main().catch((e) => { console.error(e); process.exit(1); });
