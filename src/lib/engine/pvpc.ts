/**
 * Precio PVPC hora a hora con impuestos (funciones puras, probadas en engine.test.ts).
 *
 * Dato de partida: el término de energía del PVPC 2.0TD que publica Red Eléctrica (columna PCB del
 * archivo 70 de e·sios, €/MWh, sin impuestos). Ya incluye el coste de la energía y los peajes y cargos
 * del término de energía. Se le añaden el impuesto especial sobre la electricidad y el IVA (o el IGIC)
 * en vigor el día de consumo, leídos de params-2026.json, nunca escritos en el código.
 */
import { P, IPC, type DiaPVPC } from './params';

export type Region = 'peninsula' | 'canarias' | 'ceuta' | 'melilla';
/** Ceuta y Melilla: otro calendario de periodos (Circular 3/2020) y otra columna de precio en e·sios. */
export const esCeutaMelilla = (r: Region) => r === 'ceuta' || r === 'melilla';
/** Región a partir del selector de las calculadoras (0 Península y Baleares, 1 Canarias, 2 Ceuta, 3 Melilla). */
export const REGIONES: Region[] = ['peninsula', 'canarias', 'ceuta', 'melilla'];
export const regionDe = (n: number): Region => REGIONES[Math.round(n)] ?? 'peninsula';
export type Periodo = 'P1' | 'P2' | 'P3';

export interface Impuestos {
  /** Tipo del impuesto especial sobre la electricidad (fracción). */
  iee: number;
  /** Mínimo del impuesto eléctrico, € por kWh. */
  ieeMinKwh: number;
  /** IVA, IGIC o IPSI aplicado (fracción). */
  iva: number;
  /** Nombre del impuesto indirecto: IVA en la Península y Baleares, IGIC en Canarias, IPSI en Ceuta y Melilla. */
  indirecto: 'IVA' | 'IGIC' | 'IPSI';
  /** Rebaja temporal aplicada ese día (RDL 7/2026 o RDL 25/2026). */
  rebaja: boolean;
  /** Mes cuya rebaja depende de un IPC aún no publicado por el INE: se aplican los tipos generales. */
  pendiente?: string;
  /** Clave de la fuente del periodo fiscal. */
  fuente: string;
}

type PeriodoFiscal = (typeof P.impuestos.periodos)[number] & Partial<{ condicional: { mes_ipc: string; umbral_variacion: number }; iva_rebajado: number; iee_rebajado: number; iva_umbral_kw: number; iva_umbral_incluido: boolean }>;

/** Tipos del día de consumo `fecha` (AAAA-MM-DD) para una potencia contratada `kw`. `severo`: perceptor del
 *  bono social vulnerable severo, que tiene el IVA rebajado sea cual sea su potencia (RDL 7/2026 art. 42,
 *  RDL 18/2026 y RDL 25/2026 art. 18.1.b y 19.1.b). */
export function impuestosDelDia(fecha: string, kw = 4.6, region: Region = 'peninsula', ipc = IPC, severo = false): Impuestos {
  const I = P.impuestos;
  const per = (I.periodos as PeriodoFiscal[]).find((p) => fecha >= p.desde && fecha <= p.hasta);
  let iee = I.iee_general, iva = I.iva_general, rebaja = false, pendiente: string | undefined;
  const fuente = per?.fuente ?? 'ley38Iee';
  if (per) {
    const umbral = per.iva_umbral_kw;
    const cumplePotencia = umbral === undefined || severo ? true : per.iva_umbral_incluido ? kw <= umbral : kw < umbral;
    if (per.condicional) {
      const dato = ipc.find((m) => m.mes === per.condicional!.mes_ipc);
      if (!dato) pendiente = per.condicional.mes_ipc;
      else if (dato.variacion > per.condicional.umbral_variacion) {
        rebaja = true;
        iee = per.iee_rebajado ?? iee;
        if (cumplePotencia) iva = per.iva_rebajado ?? iva;
      }
    } else {
      iee = per.iee;
      iva = umbral !== undefined && !cumplePotencia ? I.iva_general : per.iva;
      rebaja = per.iee < I.iee_general;
    }
  }
  // Ceuta y Melilla: sin IVA (Ley 37/1992, art. 3); IPSI del 1 % sobre el total facturado (ordenanzas de
  // cada ciudad). El impuesto eléctrico y sus rebajas se aplican igual (Ley 38/1992, art. 91).
  if (region === 'ceuta') return { iee, ieeMinKwh: I.iee_minimo_eur_mwh / 1000, iva: I.ipsi_ceuta, indirecto: 'IPSI', rebaja, pendiente, fuente };
  if (region === 'melilla') return { iee, ieeMinKwh: I.iee_minimo_eur_mwh / 1000, iva: I.ipsi_melilla, indirecto: 'IPSI', rebaja, pendiente, fuente };
  if (region === 'canarias') return { iee, ieeMinKwh: I.iee_minimo_eur_mwh / 1000, iva: I.igic_canarias_vivienda, indirecto: 'IGIC', rebaja, pendiente, fuente };
  return { iee, ieeMinKwh: I.iee_minimo_eur_mwh / 1000, iva, indirecto: 'IVA', rebaja, pendiente, fuente };
}

/** €/kWh con impuestos a partir del término de energía en €/MWh. El mínimo del impuesto eléctrico
 *  (1 €/MWh) se aplica por kWh: solo actúa con el tipo rebajado del 0,5 %. */
export function conImpuestos(eurMWh: number, imp: Impuestos): number {
  const base = eurMWh / 1000;
  const iee = Math.max(base * imp.iee, imp.ieeMinKwh);
  return (base + iee) * (1 + imp.iva);
}

const esFinde = (fecha: string) => { const d = new Date(`${fecha}T12:00:00Z`).getUTCDay(); return d === 0 || d === 6; };
/** Sábado, domingo o festivo nacional de fecha fija (Circular 3/2020): todo el día en valle. */
export function esDiaValle(fecha: string): boolean {
  return esFinde(fecha) || (P.periodos_2_0td.festivos_nacionales_fecha_fija as string[]).includes(fecha.slice(5));
}
/** Periodo 2.0TD de la hora que empieza a las `hora` del día `fecha` (Circular 3/2020, art. 7.3:
 *  en Ceuta y Melilla la punta y el llano empiezan una hora más tarde). */
export function periodo(fecha: string, hora: number, region: Region = 'peninsula'): Periodo {
  if (esDiaValle(fecha)) return 'P3';
  const cal = esCeutaMelilla(region) ? P.periodos_2_0td.ceuta_melilla : P.periodos_2_0td;
  const en = (tramos: number[][]) => tramos.some(([a, b]) => hora >= a && hora < b);
  if (en(cal.punta)) return 'P1';
  if (en(cal.llano)) return 'P2';
  return 'P3';
}

/** Serie de precios (€/MWh) y de peajes y cargos de la región: columnas CYM/TEUCYM en Ceuta y Melilla. */
export function serieRegion(d: DiaPVPC, region: Region): { p: number[]; t: number[] } {
  if (esCeutaMelilla(region)) {
    if (!d.pcm || !d.tcm) throw new Error('Día sin precios de Ceuta y Melilla (columna CYM)');
    return { p: d.pcm, t: d.tcm };
  }
  return { p: d.p, t: d.t };
}

export interface Hora {
  /** Hora de inicio (0-23). En el día de 25 horas, la hora 2 aparece dos veces. */
  h: number;
  /** Índice de la fila en el día. */
  i: number;
  /** €/kWh sin impuestos (término de energía PVPC). */
  sin: number;
  /** €/kWh con impuestos. */
  ttc: number;
  /** Peajes y cargos del término de energía, €/kWh, sin impuestos. */
  regulado: number;
  periodo: Periodo;
}

export const horasDe = (d: DiaPVPC) => d.h ?? d.p.map((_, i) => i);

/** Las horas de un día con su precio con impuestos. */
export function diaConImpuestos(fecha: string, d: DiaPVPC, kw = 4.6, region: Region = 'peninsula'): Hora[] {
  const imp = impuestosDelDia(fecha, kw, region);
  const hs = horasDe(d);
  const s = serieRegion(d, region);
  return s.p.map((p, i) => ({ h: hs[i], i, sin: p / 1000, ttc: conImpuestos(p, imp), regulado: (s.t[i] ?? 0) / 1000, periodo: periodo(fecha, hs[i], region) }));
}

export interface Resumen { media: number; min: Hora; max: Hora; mediaSin: number }
export function resumen(horas: Hora[]): Resumen {
  const media = horas.reduce((s, x) => s + x.ttc, 0) / horas.length;
  const mediaSin = horas.reduce((s, x) => s + x.sin, 0) / horas.length;
  const min = horas.reduce((a, b) => (b.ttc < a.ttc ? b : a));
  const max = horas.reduce((a, b) => (b.ttc > a.ttc ? b : a));
  return { media, mediaSin, min, max };
}

/** Las `n` horas más baratas (orden de precio). */
export const masBaratas = (horas: Hora[], n: number) => [...horas].sort((a, b) => a.ttc - b.ttc || a.i - b.i).slice(0, n);

/** Mejor bloque de `n` horas seguidas: índice de la primera y precio medio. */
export function mejorBloque(horas: Hora[], n: number): { inicio: number; media: number } {
  let best = { inicio: 0, media: Infinity };
  for (let i = 0; i + n <= horas.length; i++) {
    const m = horas.slice(i, i + n).reduce((s, x) => s + x.ttc, 0) / n;
    if (m < best.media - 1e-12) best = { inicio: i, media: m };
  }
  return best;
}

/**
 * Precio medio estimado de un día sin datos (consigna del editor): media, hora a hora, de los
 * `ventana` días anteriores con datos del mismo tipo (laborable, o fin de semana y festivo).
 * Si no hay al menos 4 días de ese tipo, se usan los de los doce meses anteriores del mismo mes.
 */
export function perfilEstimado(fecha: string, hist: Record<string, DiaPVPC>, ventana = 28): DiaPVPC & { dias: string[] } {
  const valle = esDiaValle(fecha);
  const prev = Object.keys(hist).filter((f) => f < fecha && esDiaValle(f) === valle && (hist[f].p.length === 24)).sort().reverse();
  const cerca = prev.filter((f) => (Date.parse(fecha) - Date.parse(f)) / 864e5 <= ventana);
  const usados = cerca.length >= 4 ? cerca : prev.filter((f) => f.slice(5, 7) === fecha.slice(5, 7));
  if (!usados.length) throw new Error(`Sin historial para estimar ${fecha}`);
  const avg = (k: 'p' | 't' | 'pcm' | 'tcm') => Array.from({ length: 24 }, (_, i) => usados.reduce((s, f) => s + (hist[f][k] ?? hist[f].p)[i], 0) / usados.length);
  const cym = usados.every((f) => hist[f].pcm && hist[f].tcm) ? { pcm: avg('pcm'), tcm: avg('tcm') } : {};
  return { p: avg('p'), t: avg('t'), ...cym, dias: usados };
}

export interface DiaResuelto { fecha: string; dia: DiaPVPC; estimado: boolean; dias?: string[] }
/** El día publicado si existe; si no, el precio medio estimado, marcado como tal. */
export function diaOEstimado(fecha: string, hist: Record<string, DiaPVPC>): DiaResuelto {
  if (hist[fecha]) return { fecha, dia: hist[fecha], estimado: false };
  const e = perfilEstimado(fecha, hist);
  return { fecha, dia: { p: e.p, t: e.t, ...(e.pcm ? { pcm: e.pcm, tcm: e.tcm } : {}) }, estimado: true, dias: e.dias };
}

/** Coste de la energía de un aparato que consume `kwh` repartidos por igual en `duracionH` horas,
 *  empezando a la hora decimal `inicio` (8,25 = 8:15), sobre una serie de precios horarios €/kWh. */
export function costeTramo(precios: number[], inicio: number, duracionH: number, kwh: number): number {
  if (duracionH <= 0) return 0;
  const porHora = kwh / duracionH;
  let t = inicio, fin = inicio + duracionH, total = 0;
  while (t < fin - 1e-9) {
    const i = Math.floor(t + 1e-9);
    const hasta = Math.min(i + 1, fin);
    const precio = precios[Math.min(i, precios.length - 1)];
    total += (hasta - t) * porHora * precio;
    t = hasta;
  }
  return total;
}

/** Mejor hora de inicio (paso de 15 minutos) entre `desde` y la última que permite terminar dentro de la serie. */
export function mejorInicio(precios: number[], duracionH: number, kwh: number, desde = 0): { inicio: number; coste: number; peorInicio: number; peor: number } {
  let best = { inicio: desde, coste: Infinity, peorInicio: desde, peor: -Infinity };
  for (let s = Math.ceil(desde * 4) / 4; s + duracionH <= precios.length + 1e-9; s += 0.25) {
    const c = costeTramo(precios, s, duracionH, kwh);
    if (c < best.coste - 1e-12) { best.coste = c; best.inicio = s; }
    if (c > best.peor + 1e-12) { best.peor = c; best.peorInicio = s; }
  }
  return best;
}

/** Media mensual del término de energía (€/kWh sin impuestos y con impuestos) de los días con datos. */
export function mediasMensuales(hist: Record<string, DiaPVPC>, kw = 4.6) {
  const meses: Record<string, { sin: number; ttc: number; n: number; min: number; max: number; dias: number }> = {};
  for (const [f, d] of Object.entries(hist)) {
    const m = f.slice(0, 7);
    const horas = diaConImpuestos(f, d, kw);
    const o = (meses[m] ??= { sin: 0, ttc: 0, n: 0, min: Infinity, max: -Infinity, dias: 0 });
    o.dias++;
    for (const x of horas) { o.sin += x.sin; o.ttc += x.ttc; o.n++; o.min = Math.min(o.min, x.ttc); o.max = Math.max(o.max, x.ttc); }
  }
  return Object.entries(meses).sort(([a], [b]) => a.localeCompare(b)).map(([mes, o]) => ({ mes, sin: o.sin / o.n, ttc: o.ttc / o.n, min: o.min, max: o.max, dias: o.dias }));
}

/** Etiqueta horaria « 08:00–09:00 ». */
export const tramo = (h: number) => `${String(h).padStart(2, '0')}:00–${String((h + 1) % 24 === 0 ? 24 : h + 1).padStart(2, '0')}:00`;
/** Hora decimal → « 8:15 ». */
export const reloj = (x: number) => { const t = ((x % 24) + 24) % 24; const h = Math.floor(t + 1e-9); const m = Math.round((t - h) * 60); return `${h}:${String(m === 60 ? 0 : m).padStart(2, '0')}`; };
