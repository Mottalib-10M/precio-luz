/**
 * Bono social eléctrico (Real Decreto 897/2017, arts. 3 y 6; descuentos del RDL 7/2026 hasta el
 * 31 de diciembre de 2026). Funciones puras: orientan, no sustituyen la comprobación de la
 * comercializadora de referencia.
 */
import { P } from './params';

const B = P.bono_social;
export type Categoria = 'severo' | 'vulnerable' | 'no';
export type Via = 'renta' | 'numerosa' | 'pensionista' | 'imv';

export interface Hogar { adultos: number; menores: number; renta: number; especial: boolean; via: Via }

/** Umbral de renta anual de la unidad de convivencia (IPREM de 14 pagas × multiplicador). */
export function umbralRenta(adultos: number, menores: number, especial: boolean): number {
  const mult = B.multiplicador_base + B.por_adulto_adicional * Math.max(0, adultos - 1) + B.por_menor * Math.max(0, menores) + (especial ? B.por_circunstancia_especial : 0);
  return B.iprem_14_pagas * mult;
}

/** Categoría según la vía de acceso (art. 3.2) y la renta (art. 3.4). */
export function categoria(h: Hogar): { cat: Categoria; umbral: number; umbralSevero: number } {
  const umbral = umbralRenta(h.adultos, h.menores, h.especial);
  let umbralSevero = umbral * B.severo_fraccion;
  // Art. 3.4: además del 50 % del umbral, familia numerosa hasta 2 IPREM y pensionista hasta 1 IPREM.
  if (h.via === 'numerosa') umbralSevero = Math.max(umbralSevero, 2 * B.iprem_14_pagas);
  if (h.via === 'pensionista') umbralSevero = Math.max(umbralSevero, 1 * B.iprem_14_pagas);
  if (h.renta <= umbralSevero) return { cat: 'severo', umbral, umbralSevero };
  if (h.via !== 'renta' || h.renta <= umbral) return { cat: 'vulnerable', umbral, umbralSevero };
  return { cat: 'no', umbral, umbralSevero };
}

export const descuento = (cat: Categoria) => (cat === 'severo' ? B.descuento_severo : cat === 'vulnerable' ? B.descuento_vulnerable : 0);

/** Límite anual de kWh con descuento según el hogar (art. 6.2). */
export function limiteKwh(personas: number, menores: number, via: Via): number {
  const L = Object.fromEntries(B.limites_kwh_ano.map((x) => [x.id, x.kwh]));
  if (via === 'numerosa' || personas >= 5 || (personas === 4 && menores >= 3)) return L.cinco_numerosa;
  if (personas === 4 || (personas === 3 && menores >= 2)) return L.cuatro;
  if (personas === 3 || via === 'pensionista' || (personas === 2 && menores >= 1)) return L.tres_pensionista;
  return L.uno_dos;
}
