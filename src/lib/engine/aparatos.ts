/**
 * Consumo de los electrodomésticos según la metodología de la etiqueta energética de la UE
 * (funciones puras). El consumo por defecto es el máximo de la clase elegida: el aparato real
 * gasta lo que indica su etiqueta, y el visitante puede escribirlo.
 *  - Lavadora (Reglamento Delegado (UE) 2019/2014, anexo IV): SCE = −0,0025·c² + 0,0846·c + 0,3920 kWh/ciclo.
 *  - Lavavajillas (Reglamento Delegado (UE) 2019/2017, anexo IV): SPEC = 0,025·ps + 1,350 (ps ≥ 10), 0,090·ps + 0,450 (ps ≤ 9).
 *  - Horno eléctrico (Reglamento Delegado (UE) 65/2014, anexo II): SEC = 0,0042·V + 0,55 kWh por ciclo normalizado.
 *  - Coche eléctrico: energía = batería × (hasta − desde) %, duración = energía / potencia del punto de carga.
 */
import { P } from './params';

const r3 = (x: number) => Math.round(x * 1000) / 1000;
type Tabla = Record<string, number>;

export const sceLavadora = (kg: number) => r3(-0.0025 * kg * kg + 0.0846 * kg + 0.392);
export const specLavavajillas = (servicios: number) => r3(servicios >= 10 ? 0.025 * servicios + 1.35 : 0.09 * servicios + 0.45);
export const secHorno = (litros: number) => Math.round((0.0042 * litros + 0.55) * 100) / 100;

/** kWh por ciclo en el límite superior de la clase (índice / 100 × consumo normalizado). */
export const kwhClase = (normalizado: number, clase: string, tabla: Tabla) => r3((normalizado * (tabla[clase] ?? 100)) / 100);

export const kwhLavadora = (kg: number, clase: string) => kwhClase(sceLavadora(kg), clase, P.aparatos.lavadora.eei_max as Tabla);
export const kwhLavavajillas = (servicios: number, clase: string) => kwhClase(specLavavajillas(servicios), clase, P.aparatos.lavavajillas.eei_max as Tabla);
export const kwhHorno = (litros: number, clase: string) => kwhClase(secHorno(litros), clase, P.aparatos.horno.eei_max as Tabla);

/** Recarga de un coche eléctrico: kWh que entran en la batería y horas de carga. */
export function recarga(bateriaKwh: number, desdePct: number, hastaPct: number, potenciaKw: number) {
  const kwh = Math.max(0, (bateriaKwh * (hastaPct - desdePct)) / 100);
  return { kwh, horas: potenciaKw > 0 ? kwh / potenciaKw : 0 };
}

export const CLASES_LAVADORA = Object.keys(P.aparatos.lavadora.eei_max);
export const CLASES_LAVAVAJILLAS = Object.keys(P.aparatos.lavavajillas.eei_max);
export const CLASES_HORNO = Object.keys(P.aparatos.horno.eei_max);
