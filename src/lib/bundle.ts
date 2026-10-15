/**
 * Trozo de datos que recibe cada calculadora por props (build): los 35 últimos días con datos, mañana si
 * Red Eléctrica ya lo publicó, el día del build y la hora de descarga. Nada del histórico completo llega al
 * navegador. La calculadora elige el día real de Madrid después del montaje (RECETTE §17.5).
 */
import { HISTORICO, ESTADO, CUARTOS } from './engine/datos';
import type { DiaPVPC } from './engine/params';

export interface Bundle {
  /** Día de referencia del build (hoy en Madrid cuando se generaron los datos). */
  hoy: string;
  generado: string;
  /** Fecha y hora de Madrid de la descarga (« 2026-10-15 », « 20:31 »). */
  generadoFecha: string;
  generadoHora: string;
  dias: Record<string, DiaPVPC>;
  cuartos?: Record<string, number[]>;
}

const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

export function bundle(opts: { dias?: number; cuartos?: boolean } = {}): Bundle {
  const n = opts.dias ?? 35;
  const hoy = ESTADO.hoy;
  const desde = addDays(hoy, -n);
  const dias = Object.fromEntries(Object.entries(HISTORICO).filter(([f]) => f >= desde).map(([f, d]) => [f, { p: d.p, t: d.t, ...(d.c ? { c: d.c } : {}), ...(d.h ? { h: d.h } : {}) }]));
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(ESTADO.generado)).map((x) => [x.type, x.value]));
  const b: Bundle = { hoy, generado: ESTADO.generado, generadoFecha: `${p.year}-${p.month}-${p.day}`, generadoHora: `${p.hour}:${p.minute}`, dias };
  if (opts.cuartos) b.cuartos = CUARTOS;
  return b;
}
export { addDays };
