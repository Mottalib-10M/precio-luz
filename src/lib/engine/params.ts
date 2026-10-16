/**
 * Parámetros 2026 del sitio, leídos una sola vez de `data/params-2026.json` (RECETTE §4), e IPC de la
 * electricidad (INE), que decide las rebajas fiscales de noviembre y diciembre. Archivo ligero: lo
 * importan también las calculadoras del navegador. Los precios diarios están en `datos.ts`.
 */
import raw from '../../data/params-2026.json';
import ipcRaw from '../../data/ipc-electricidad.json';

export interface Source { url: string; label: { es: string; en: string } }
export const P = raw;
export type Params = typeof P;
export type SourceKey = keyof typeof raw.sources;
export const YEAR_PARAMS = raw.year;
export const IPC: Array<{ mes: string; variacion: number }> = (ipcRaw as { meses: Array<{ mes: string; variacion: number }> }).meses;

/** Un día de PVPC: término de energía (€/MWh, sin impuestos), su parte de peajes y cargos,
 *  las mismas dos series para Ceuta y Melilla (columnas CYM y TEUCYM), perfil de consumo 2.0TD (COF2TD)
 *  y, solo en los días de cambio de hora, horas de inicio. */
export interface DiaPVPC { p: number[]; t: number[]; pcm?: number[]; tcm?: number[]; c?: number[]; h?: number[] }
