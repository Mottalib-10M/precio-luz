/** Mini: del precio de la tabla de Red Eléctrica (€/kWh) a lo que pagas con impuestos, y qué parte es regulada. */
import type { MiniSpec } from '../mini-types';
import { T, kwh, eur, num, DIA, RESUMEN, type L } from './_kit';
import { impuestosDelDia, conImpuestos } from '../engine/pvpc';
import { REGULADO_ENERGIA } from '../engine/factura';

export default (l: L): MiniSpec => ({
  title: T(l, 'Del precio PVPC de la tabla a lo que pagas', 'From the PVPC table price to what you pay'),
  cta: T(l, 'Ver el PVPC de hoy hora a hora', 'See today’s hourly PVPC'),
  inputs: [
    { id: 'p', label: T(l, 'Precio de la tabla', 'Table price'), def: Math.round(RESUMEN.media30EurKwh * 10000) / 100, unit: 'c€/kWh', max: 200, decimals: 2 },
    { id: 'per', label: T(l, 'Periodo de esa hora', 'Period of that hour'), def: 2, options: [{ value: '0', label: T(l, 'Punta', 'Peak') }, { value: '1', label: T(l, 'Llano', 'Standard') }, { value: '2', label: T(l, 'Valle', 'Off-peak') }] },
    { id: 'kwh', label: T(l, 'Energía que consumes', 'Energy you use'), def: 1, unit: 'kWh', max: 1000, decimals: 2 },
  ],
  run: ({ p: cent, per, kwh: k }) => {
    const p = cent / 100;
    const imp = impuestosDelDia(DIA);
    const reg = [REGULADO_ENERGIA.P1, REGULADO_ENERGIA.P2, REGULADO_ENERGIA.P3][per] ?? REGULADO_ENERGIA.P3;
    const ttc = conImpuestos(p * 1000, imp);
    return {
      head: [T(l, 'Con impuestos', 'With taxes'), kwh(ttc, l)],
      rows: [
        [T(l, 'Peajes y cargos dentro del precio', 'Tolls and charges inside the price'), kwh(reg, l, 4)],
        [T(l, 'Energía, ajustes y demás', 'Energy, adjustments and the rest'), kwh(p - reg, l, 4)],
        [T(l, `Coste de ${num(k, l, 2)} kWh`, `Cost of ${num(k, l, 2)} kWh`), eur(k * ttc, l)],
      ],
      note: T(l, 'En céntimos por kWh. Por defecto: media del PVPC de los últimos 30 días, sin impuestos.', 'In cents per kWh. Default: the PVPC average over the last 30 days, before taxes.'),
    };
  },
});
