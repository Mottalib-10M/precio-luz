/**
 * Factura de la luz 2.0TD: PVPC o precio fijo del mercado libre (funciones puras).
 *
 * Estructura (Real Decreto 216/2014, art. 7; Orden TED/1524/2025; Ley 38/1992; Ley 37/1992):
 *  potencia  = kW P1 × (peaje + cargo + margen de comercialización) + kW P2 × (peaje + cargo), €/kW·año × días / 365
 *  energía   = Σ kWh de cada hora × término de energía PVPC de esa hora (o kWh × precio fijo en el mercado libre)
 *  + financiación del bono social (€/punto de suministro·año × días / 365)
 *  − descuento del bono social (sobre potencia y energía hasta el límite de kWh)
 *  + impuesto eléctrico sobre lo anterior (mínimo 1 €/MWh)
 *  + alquiler del contador
 *  + IVA (o IGIC) sobre el total.
 */
import { P } from './params';
import { conImpuestos, impuestosDelDia, type Impuestos, type Region } from './pvpc';

export const POT_P1_PVPC = P.peajes.potencia_eur_kw_ano.P1 + P.cargos.potencia_eur_kw_ano.P1 + P.comercializacion.margen_fijo_eur_kw_ano;
export const POT_P2_PVPC = P.peajes.potencia_eur_kw_ano.P2 + P.cargos.potencia_eur_kw_ano.P2;
/** Peajes y cargos del término de energía por periodo, €/kWh. */
export const REGULADO_ENERGIA = {
  P1: P.peajes.energia_eur_kwh.P1 + P.cargos.energia_eur_kwh.P1,
  P2: P.peajes.energia_eur_kwh.P2 + P.cargos.energia_eur_kwh.P2,
  P3: P.peajes.energia_eur_kwh.P3 + P.cargos.energia_eur_kwh.P3,
};

export interface EntradaFactura {
  dias: number;
  kwP1: number;
  kwP2: number;
  /** Consumo del periodo, kWh. */
  kwh: number;
  /** Coste de la energía antes de impuestos, € (PVPC: Σ kWh × precio horario; libre: kWh × precio fijo). */
  energia: number;
  /** Mercado libre: precio de la potencia €/kW·día (P1 y P2 juntos). Si se omite, potencia regulada del PVPC. */
  potenciaLibreKwDia?: number;
  /** Fecha de consumo que fija los impuestos. */
  fecha: string;
  region?: Region;
  /** Descuento del bono social (0, 0,425, 0,575…); solo PVPC. */
  bono?: number;
  /** Límite anual de kWh con descuento del bono social. */
  limiteAnualKwh?: number;
  /** Alquiler del contador, €/mes. */
  contadorMes?: number;
}

export interface Factura {
  potencia: number; energia: number; financiacionBono: number; descuentoBono: number;
  iee: number; contador: number; baseIndirecto: number; indirecto: number; total: number;
  imp: Impuestos; kwhConDescuento: number;
}

const r2 = (x: number) => Math.round(x * 100) / 100;

/** Financiación del bono social vigente el día `fecha`, €/punto de suministro·año (Orden TED/1524/2025,
 *  luego Orden TED/634/2026 desde el 26/06/2026; RD 216/2014, art. 8.4). */
export function financiacionBonoAnual(fecha: string): number {
  const per = P.bono_social_financiacion.periodos.find((p) => fecha >= p.desde && fecha <= p.hasta);
  return per?.eur_cups_ano ?? P.bono_social_financiacion.eur_cups_ano;
}

export function factura(e: EntradaFactura): Factura {
  const region = e.region ?? 'peninsula';
  const imp = impuestosDelDia(e.fecha, Math.max(e.kwP1, e.kwP2), region, undefined, e.bono !== undefined && e.bono >= P.bono_social.descuento_severo);
  const potencia = e.potenciaLibreKwDia !== undefined
    ? e.potenciaLibreKwDia * Math.max(e.kwP1, e.kwP2) * e.dias
    : (e.kwP1 * POT_P1_PVPC + e.kwP2 * POT_P2_PVPC) * e.dias / 365;
  const energia = e.energia;
  const financiacionBono = financiacionBonoAnual(e.fecha) * e.dias / 365;
  let descuentoBono = 0, kwhConDescuento = 0;
  if (e.bono && e.bono > 0) {
    const limite = (e.limiteAnualKwh ?? 0) * e.dias / 365;
    kwhConDescuento = Math.min(e.kwh, limite);
    const fraccion = e.kwh > 0 ? kwhConDescuento / e.kwh : 1;
    descuentoBono = e.bono * (potencia + energia * fraccion);
  }
  const baseIee = potencia + energia + financiacionBono - descuentoBono;
  const iee = Math.max(baseIee * imp.iee, e.kwh * imp.ieeMinKwh);
  const contador = (e.contadorMes ?? P.contador.alquiler_eur_mes) * 12 * e.dias / 365;
  const baseIndirecto = baseIee + iee + contador;
  const indirecto = baseIndirecto * imp.iva;
  const total = baseIndirecto + indirecto;
  return { potencia, energia, financiacionBono, descuentoBono, iee, contador, baseIndirecto, indirecto, total, imp, kwhConDescuento };
}

/** Reparto de `kwh` entre las horas de una serie según el perfil oficial COF2TD de Red Eléctrica. */
export function repartoPerfil(kwh: number, perfil: number[]): number[] {
  const s = perfil.reduce((a, b) => a + b, 0);
  return perfil.map((c) => (s > 0 ? (kwh * c) / s : kwh / perfil.length));
}

/** Precio equivalente con impuestos de un precio fijo del mercado libre (€/kWh sin impuestos). */
export const libreConImpuestos = (eurKwh: number, imp: Impuestos) => conImpuestos(eurKwh * 1000, imp);

/** Coste anual del término de potencia del PVPC, sin impuestos, para una misma potencia en P1 y P2. */
export const potenciaAnual = (kw: number) => kw * (POT_P1_PVPC + POT_P2_PVPC);

export { r2 };
