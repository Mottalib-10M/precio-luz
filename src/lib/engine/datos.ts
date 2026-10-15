/**
 * Datos diarios descargados por `scripts/data/fetch-pvpc.mjs` (Red Eléctrica). Solo para el build
 * (páginas Astro): las calculadoras reciben por props el trozo que necesitan, nunca el histórico entero.
 */
import hist from '../../data/pvpc-historico.json';
import cuartosRaw from '../../data/mercado-cuartos.json';
import estadoRaw from '../../data/estado.json';
import type { DiaPVPC } from './params';

export const HISTORICO: Record<string, DiaPVPC> = (hist as { dias: Record<string, DiaPVPC> }).dias;
export const CUARTOS: Record<string, number[]> = (cuartosRaw as { dias: Record<string, number[]> }).dias;
export const ESTADO = estadoRaw as { generado: string; hoy: string; manana: string; hoyPublicado: boolean; mananaPublicado: boolean; diasHistorico: number; avisos: string[] };
export const FECHAS = Object.keys(HISTORICO).sort();
