/** Utilidades comunes de los mini-simuladores (archivo ignorado por el registro: prefijo « _ »). */
import { formatMoney, formatPercent, formatNumber } from '../format';
import resumenRaw from '../../data/resumen.json';
export type L = 'es' | 'en';
export const T = <A>(l: L, es: A, en: A) => (l === 'en' ? en : es);
export const eur = (x: number, l: L, d?: number) => formatMoney(x, d ?? (Math.abs(x) < 100 ? 2 : 0), l);
export const pct = (x: number, l: L, d = 1) => formatPercent(x, d, l);
export const num = (x: number, l: L, d = 0) => formatNumber(x, d, l);
export const kwh = (x: number, l: L, d = 3) => `${formatNumber(x, d, l)} €/kWh`;
/** Resumen ligero de los datos de Red Eléctrica escrito por scripts/data/fetch-pvpc.mjs. */
export const RESUMEN = resumenRaw as { hoy: string; media30EurKwh: number; laborable: { dias: number; eurKwh: number[] }; finde: { dias: number; eurKwh: number[] } };
/** Día de referencia de los mini-simuladores: el de los datos del build (mismo HTML en servidor y navegador). */
export const DIA = RESUMEN.hoy;
