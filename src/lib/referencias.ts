/**
 * Valores de referencia calculados en el build a partir de los datos oficiales (nunca escritos a mano):
 * media PVPC de 30 días (valor por defecto del « precio fijo » en los comparadores), medias mensuales,
 * resumen de hoy y de mañana para los textos.
 */
import { HISTORICO, ESTADO } from './engine/datos';
import { mediasMensuales, diaConImpuestos, resumen, diaOEstimado, mejorBloque, esDiaValle } from './engine/pvpc';

const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

/** Media simple del término de energía PVPC (€/kWh, sin impuestos) de los 30 días hasta hoy. */
export function media30(): number {
  const hasta = ESTADO.hoy, desde = addDays(hasta, -29);
  const v = Object.entries(HISTORICO).filter(([f]) => f >= desde && f <= hasta).flatMap(([, d]) => d.p);
  return Math.round((v.reduce((s, x) => s + x, 0) / v.length / 1000) * 1000) / 1000;
}
export const MESES = mediasMensuales(HISTORICO);
/** Resumen de un día (hoy = 0, mañana = 1) para los textos de la página, en la Península. */
export function resumenDia(offset = 0) {
  const fecha = addDays(ESTADO.hoy, offset);
  const r = diaOEstimado(fecha, HISTORICO);
  const horas = diaConImpuestos(fecha, r.dia);
  return { fecha, estimado: r.estimado, horas, ...resumen(horas), bloque3: mejorBloque(horas, 3) };
}
/** Media de laborables y de fines de semana en los últimos 8 semanas (para la guía del fin de semana). */
export function laborableVsFinde(semanas = 8) {
  const desde = addDays(ESTADO.hoy, -7 * semanas);
  const acc = { lab: { s: 0, n: 0 }, fin: { s: 0, n: 0 } };
  for (const [f, d] of Object.entries(HISTORICO)) {
    if (f < desde || f > ESTADO.hoy) continue;
    const k = esDiaValle(f) ? 'fin' : 'lab';
    for (const x of diaConImpuestos(f, d)) { acc[k].s += x.ttc; acc[k].n++; }
  }
  return { laborable: acc.lab.s / acc.lab.n, finde: acc.fin.s / acc.fin.n, desde, hasta: ESTADO.hoy };
}
export { ESTADO };
