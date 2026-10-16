/**
 * Casos de referencia del motor, recalculados a mano (calculadora, fuera del código) a partir de los
 * textos oficiales citados en params-2026.json. Tolerancia: céntimo de euro o 1e-6 €/kWh.
 */
import { describe, it, expect } from 'vitest';
import {
  impuestosDelDia, conImpuestos, periodo, esDiaValle, diaConImpuestos, resumen, mejorBloque, costeTramo, mejorInicio,
  perfilEstimado, diaOEstimado, factura, financiacionBonoAnual, REGULADO_ENERGIA, POT_P1_PVPC, POT_P2_PVPC,
  sceLavadora, kwhLavadora, specLavavajillas, kwhLavavajillas, secHorno, kwhHorno, recarga,
  umbralRenta, categoria, limiteKwh, HISTORICO, P,
} from './index';

describe('impuestos del día', () => {
  it('octubre de 2026: tipos generales (IVA 21 %, impuesto eléctrico 5,11269632 %)', () => {
    const i = impuestosDelDia('2026-10-15', 4.6);
    expect(i.iva).toBe(0.21);
    expect(i.iee).toBeCloseTo(0.0511269632, 10);
    expect(i.rebaja).toBe(false);
  });
  it('RDL 7/2026: del 22 de marzo al 31 de mayo, IVA 10 % por debajo de 10 kW e impuesto eléctrico 0,5 %', () => {
    expect(impuestosDelDia('2026-03-21', 4.6).iva).toBe(0.21);
    const a = impuestosDelDia('2026-04-10', 4.6);
    expect([a.iva, a.iee, a.rebaja]).toEqual([0.1, 0.005, true]);
    // « inferior a 10 kW »: exactamente 10 kW queda al 21 %
    expect(impuestosDelDia('2026-04-10', 10).iva).toBe(0.21);
    // salvo para el vulnerable severo con bono social, sea cual sea la potencia (art. 42)
    expect(impuestosDelDia('2026-04-10', 10, 'peninsula', undefined, true).iva).toBe(0.1);
    expect(impuestosDelDia('2026-06-01', 4.6).iva).toBe(0.21);
  });
  it('RDL 25/2026: noviembre depende del IPC de septiembre (+11,4 %, sin rebaja); diciembre pendiente del IPC de octubre', () => {
    const ipc = [{ mes: '2026-09', variacion: 11.4 }];
    expect(impuestosDelDia('2026-11-10', 4.6, 'peninsula', ipc).iva).toBe(0.21);
    const alta = impuestosDelDia('2026-11-10', 10, 'peninsula', [{ mes: '2026-09', variacion: 16 }]);
    expect([alta.iva, alta.iee, alta.rebaja]).toEqual([0.1, 0.005, true]); // « inferior o igual a 10 kW »
    expect(impuestosDelDia('2026-12-05', 4.6, 'peninsula', ipc).pendiente).toBe('2026-10');
  });
  it('RDL 25/2026, arts. 19 y 21: diciembre depende del IPC de octubre (INE, publicado en noviembre)', () => {
    // « supera en más de un 15 por ciento »: 15,0 no basta, 15,1 sí.
    const sin = impuestosDelDia('2026-12-05', 4.6, 'peninsula', [{ mes: '2026-10', variacion: 15 }]);
    expect([sin.iva, sin.iee, sin.rebaja, sin.pendiente]).toEqual([0.21, 0.0511269632, false, undefined]);
    const con = impuestosDelDia('2026-12-05', 4.6, 'peninsula', [{ mes: '2026-10', variacion: 15.1 }]);
    expect([con.iva, con.iee, con.rebaja]).toEqual([0.1, 0.005, true]);
    // IVA rebajado « inferior o igual a 10 kW »; por encima, IVA general pero impuesto eléctrico rebajado.
    expect(impuestosDelDia('2026-12-31', 10, 'peninsula', [{ mes: '2026-10', variacion: 20 }]).iva).toBe(0.1);
    const alto = impuestosDelDia('2026-12-31', 10.1, 'peninsula', [{ mes: '2026-10', variacion: 20 }]);
    expect([alto.iva, alto.iee]).toEqual([0.21, 0.005]);
    // El IPC de septiembre no decide diciembre (ni el de octubre noviembre).
    expect(impuestosDelDia('2026-12-05', 4.6, 'peninsula', [{ mes: '2026-09', variacion: 30 }]).pendiente).toBe('2026-10');
    expect(impuestosDelDia('2026-11-30', 4.6, 'peninsula', [{ mes: '2026-09', variacion: 11.4 }, { mes: '2026-10', variacion: 30 }]).rebaja).toBe(false);
    // Mientras el INE no publique octubre: tipos generales, marcados como pendientes.
    const pend = impuestosDelDia('2026-12-05', 4.6, 'peninsula', []);
    expect([pend.iva, pend.iee, pend.pendiente]).toEqual([0.21, 0.0511269632, '2026-10']);
    // Precio con la rebaja: 203,15 €/MWh × 1,005 × 1,10 = 0,224582 €/kWh.
    expect(conImpuestos(203.15, con)).toBeCloseTo(0.224582, 6);
    // El 1 de enero de 2027 ya no hay periodo fiscal 2026: tipos generales.
    expect(impuestosDelDia('2027-01-01', 4.6, 'peninsula', [{ mes: '2026-10', variacion: 30 }]).rebaja).toBe(false);
  });
  it('IPC real del INE en el archivo: noviembre sin rebaja (septiembre +11,4 %)', () => {
    const i = impuestosDelDia('2026-11-10', 4.6);
    expect([i.iva, i.rebaja, i.pendiente]).toEqual([0.21, false, undefined]);
  });
  it('Ceuta y Melilla: IPSI del 1 % en lugar del IVA, impuesto eléctrico y sus rebajas igual', () => {
    for (const r of ['ceuta', 'melilla'] as const) {
      const c = impuestosDelDia('2026-10-15', 4.6, r);
      expect([c.indirecto, c.iva, c.iee]).toEqual(['IPSI', 0.01, 0.0511269632]);
      const a = impuestosDelDia('2026-04-10', 4.6, r); // RDL 7/2026: el IVA rebajado no existe allí, el impuesto eléctrico sí baja
      expect([a.iva, a.iee]).toEqual([0.01, 0.005]);
      const d = impuestosDelDia('2026-12-05', 4.6, r, [{ mes: '2026-10', variacion: 16 }]);
      expect([d.iva, d.iee]).toEqual([0.01, 0.005]);
    }
    // 182,57 €/MWh (columna CYM, 15/10/2026 10-11 h) × 1,0511269632 × 1,01 = 0,193823 €/kWh
    expect(conImpuestos(182.57, impuestosDelDia('2026-10-15', 4.6, 'ceuta'))).toBeCloseTo(0.193823, 6);
  });
  it('Canarias: IGIC al 0 % en la vivienda hasta 10 kW', () => {
    const c = impuestosDelDia('2026-10-15', 4.6, 'canarias');
    expect([c.indirecto, c.iva]).toEqual(['IGIC', 0]);
  });
  it('precio con impuestos: 203,15 €/MWh → 0,258379 €/kWh (× 1,0511269632 × 1,21)', () => {
    expect(conImpuestos(203.15, impuestosDelDia('2026-10-15'))).toBeCloseTo(0.258379, 6);
  });
  it('mínimo del impuesto eléctrico (1 €/MWh) con el tipo rebajado: 150 €/MWh en abril → 0,1661 €/kWh', () => {
    expect(conImpuestos(150, impuestosDelDia('2026-04-10', 4.6))).toBeCloseTo(0.1661, 6);
  });
});

describe('periodos 2.0TD (Circular 3/2020)', () => {
  it('laborable: punta 10-14 y 18-22, llano 8-10, 14-18 y 22-24, valle 0-8', () => {
    expect(['2026-10-15'].flatMap((f) => [7, 8, 10, 14, 18, 22].map((h) => periodo(f, h)))).toEqual(['P3', 'P2', 'P1', 'P2', 'P1', 'P2']);
  });
  it('fin de semana y festivo nacional de fecha fija (12 de octubre): todo el día en valle', () => {
    expect(esDiaValle('2026-10-17')).toBe(true);
    expect(esDiaValle('2026-10-12')).toBe(true);
    expect(periodo('2026-10-12', 11)).toBe('P3');
  });
  it('los peajes y cargos que publica Red Eléctrica (TEUPCB) cuadran con el periodo y los valores BOE de 2026 en cada hora', () => {
    const dias = Object.entries(HISTORICO).filter(([f]) => f >= '2026-01-01');
    expect(dias.length).toBeGreaterThan(200);
    let n = 0;
    for (const [f, d] of dias) for (const x of diaConImpuestos(f, d)) { expect(Math.abs(x.regulado - REGULADO_ENERGIA[x.periodo])).toBeLessThan(0.00002); n++; }
    expect(n).toBeGreaterThan(4000);
  });
  it('Ceuta y Melilla: punta 11-15 y 19-23, llano 8-11, 15-19 y 23-24 (Circular 3/2020, art. 7.3)', () => {
    expect([7, 8, 10, 11, 14, 15, 19, 22, 23].map((h) => periodo('2026-10-15', h, 'ceuta'))).toEqual(['P3', 'P2', 'P2', 'P1', 'P1', 'P2', 'P1', 'P1', 'P2']);
    expect(periodo('2026-10-17', 12, 'melilla')).toBe('P3');
  });
  it('la columna TEUCYM de Red Eléctrica cuadra en cada hora con el calendario de Ceuta y Melilla y los valores BOE', () => {
    const dias = Object.entries(HISTORICO).filter(([f, d]) => f >= '2026-01-01' && d.pcm);
    expect(dias.length).toBeGreaterThan(200);
    let n = 0;
    for (const [f, d] of dias) for (const x of diaConImpuestos(f, d, 4.6, 'melilla')) { expect(Math.abs(x.regulado - REGULADO_ENERGIA[x.periodo])).toBeLessThan(0.00002); n++; }
    expect(n).toBeGreaterThan(4000);
  });
  it('15/10/2026, 10-11 h: punta en la Península (252,03 €/MWh), llano en Ceuta y Melilla (182,57 €/MWh)', () => {
    const d = HISTORICO['2026-10-15'];
    expect(d.p[10]).toBeCloseTo(252.03, 2);
    expect(d.pcm?.[10]).toBeCloseTo(182.57, 2);
    expect(diaConImpuestos('2026-10-15', d, 4.6, 'ceuta')[10].periodo).toBe('P2');
  });
});

describe('series del día', () => {
  const d = { p: [100, 50, 200, 80], t: [0, 0, 0, 0] };
  it('resumen y mejor bloque', () => {
    const horas = diaConImpuestos('2026-10-15', d);
    const r = resumen(horas);
    expect(r.min.h).toBe(1);
    expect(r.max.h).toBe(2);
    expect(mejorBloque(horas, 2).inicio).toBe(0); // (100+50)/2 < (50+200)/2 < (200+80)/2
  });
  it('coste de un tramo: 2 kWh en 2 h desde las 0:30 sobre 0,1 / 0,2 / 0,3 €/kWh → 0,40 €', () => {
    expect(costeTramo([0.1, 0.2, 0.3], 0.5, 2, 2)).toBeCloseTo(0.4, 10);
  });
  it('mejor hora de inicio con paso de 15 minutos', () => {
    const m = mejorInicio([0.3, 0.1, 0.1, 0.3], 2, 2);
    expect(m.inicio).toBe(1);
    expect(m.coste).toBeCloseTo(0.2, 10);
    expect(m.peor).toBeCloseTo(0.4, 10); // 0:00 o 2:00 → 0,3 + 0,1
  });
  it('precio medio estimado: media hora a hora de los días del mismo tipo', () => {
    const h = { '2026-10-13': { p: Array(24).fill(100), t: Array(24).fill(1) }, '2026-10-14': { p: Array(24).fill(200), t: Array(24).fill(1) },
      '2026-10-08': { p: Array(24).fill(300), t: Array(24).fill(1) }, '2026-10-09': { p: Array(24).fill(400), t: Array(24).fill(1) },
      '2026-10-11': { p: Array(24).fill(999), t: Array(24).fill(1) } };
    const e = perfilEstimado('2026-10-15', h);
    expect(e.p[5]).toBeCloseTo(250, 10); // el domingo 11 no cuenta para un jueves
    expect(diaOEstimado('2026-10-15', h).estimado).toBe(true);
    expect(diaOEstimado('2026-10-14', h).estimado).toBe(false);
  });
});

describe('factura PVPC 2.0TD', () => {
  it('financiación del bono social: 6,979247 €/año hasta el 25/06/2026, 9,011295 € desde el 26/06/2026', () => {
    expect(financiacionBonoAnual('2026-06-25')).toBe(6.979247);
    expect(financiacionBonoAnual('2026-06-26')).toBe(9.011295);
    const junio = factura({ dias: 30, kwP1: 4.6, kwP2: 4.6, kwh: 270, energia: 30, fecha: '2026-06-20' });
    expect(junio.financiacionBono).toBeCloseTo(0.5736, 4); // 6,979247 × 30 / 365
  });
  it('potencia regulada 2026: P1 = 23,324952 + 4,379461 + 3,113 €/kW·año; P2 = 0,443770 + 0,281653', () => {
    expect(POT_P1_PVPC).toBeCloseTo(30.817413, 6);
    expect(POT_P2_PVPC).toBeCloseTo(0.725423, 6);
  });
  it('30 días, 4,6 kW, 270 kWh y 30 € de energía en octubre de 2026 → 55,23 € (financiación del bono 9,011295 €/año, Orden TED/634/2026)', () => {
    const f = factura({ dias: 30, kwP1: 4.6, kwP2: 4.6, kwh: 270, energia: 30, fecha: '2026-10-15' });
    expect(f.potencia).toBeCloseTo(11.9258, 4);
    expect(f.financiacionBono).toBeCloseTo(0.7407, 4);
    expect(f.iee).toBeCloseTo(2.1814, 4);
    expect(f.contador).toBeCloseTo(0.7989, 4);
    expect(f.total).toBeCloseTo(55.23, 2);
  });
  it('mismo caso en Ceuta: IPSI del 1 % sobre el importe total facturado → 46,10 €', () => {
    const f = factura({ dias: 30, kwP1: 4.6, kwP2: 4.6, kwh: 270, energia: 30, fecha: '2026-10-15', region: 'ceuta' });
    expect(f.imp.indirecto).toBe('IPSI');
    expect(f.baseIndirecto).toBeCloseTo(45.6467, 4);
    expect(f.indirecto).toBeCloseTo(0.4565, 4);
    expect(f.total).toBeCloseTo(46.1, 2);
  });
  it('mismo caso con bono social vulnerable (42,5 %) y límite de 2222 kWh/año → 37,82 €', () => {
    const f = factura({ dias: 30, kwP1: 4.6, kwP2: 4.6, kwh: 270, energia: 30, fecha: '2026-10-15', bono: 0.425, limiteAnualKwh: 2222 });
    expect(f.kwhConDescuento).toBeCloseTo(182.63, 2);
    expect(f.descuentoBono).toBeCloseTo(13.6927, 4);
    expect(f.total).toBeCloseTo(37.82, 2);
  });
});

describe('etiqueta energética de la UE', () => {
  it('lavadora 8 kg: SCE 0,909 kWh; clase C (índice ≤ 69) → 0,627 kWh por ciclo', () => {
    expect(sceLavadora(8)).toBeCloseTo(0.909, 3);
    expect(kwhLavadora(8, 'C')).toBeCloseTo(0.627, 3);
  });
  it('lavavajillas 13 servicios: SPEC 1,675 kWh; clase D (índice < 50) → 0,838 kWh', () => {
    expect(specLavavajillas(13)).toBeCloseTo(1.675, 3);
    expect(kwhLavavajillas(13, 'D')).toBeCloseTo(0.838, 3);
  });
  it('horno 65 litros: SEC 0,82 kWh; clase A (índice < 107) → 0,877 kWh', () => {
    expect(secHorno(65)).toBeCloseTo(0.82, 2);
    expect(kwhHorno(65, 'A')).toBeCloseTo(0.877, 3);
  });
  it('coche: 60 kWh del 20 al 80 % a 2,3 kW → 36 kWh en 15,65 h', () => {
    const r = recarga(60, 20, 80, 2.3);
    expect(r.kwh).toBeCloseTo(36, 10);
    expect(r.horas).toBeCloseTo(15.652, 3);
  });
});

describe('bono social (RD 897/2017)', () => {
  it('umbral: 2 adultos y 1 menor → 8400 × (1,5 + 0,3 + 0,5) = 19 320 €', () => {
    expect(umbralRenta(2, 1, false)).toBeCloseTo(19320, 6);
  });
  it('categoría por renta: 9000 € → severo (≤ 9660 €); 15 000 € → vulnerable; 20 000 € → no', () => {
    const base = { adultos: 2, menores: 1, especial: false, via: 'renta' as const };
    expect(categoria({ ...base, renta: 9000 }).cat).toBe('severo');
    expect(categoria({ ...base, renta: 15000 }).cat).toBe('vulnerable');
    expect(categoria({ ...base, renta: 20000 }).cat).toBe('no');
  });
  it('familia numerosa: vulnerable sea cual sea la renta, severa hasta 2 IPREM (16 800 €)', () => {
    const fam = { adultos: 2, menores: 3, especial: false, via: 'numerosa' as const };
    expect(categoria({ ...fam, renta: 40000 }).cat).toBe('vulnerable');
    expect(categoria({ ...fam, renta: 16000 }).cat).toBe('severo');
  });
  it('límites de consumo con descuento (art. 6.2)', () => {
    expect(limiteKwh(1, 0, 'renta')).toBe(1587);
    expect(limiteKwh(3, 1, 'renta')).toBe(2222);
    expect(limiteKwh(4, 0, 'renta')).toBe(2698);
    expect(limiteKwh(4, 2, 'numerosa')).toBe(4761);
  });
  it('descuentos vigentes 2026 del RDL 7/2026', () => {
    expect([P.bono_social.descuento_vulnerable, P.bono_social.descuento_severo]).toEqual([0.425, 0.575]);
  });
});
