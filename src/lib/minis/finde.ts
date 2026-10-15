/** Mini: cuánto ahorras pasando consumo de un día laborable al fin de semana, con los perfiles reales de 28 días. */
import type { MiniSpec } from '../mini-types';
import { T, eur, kwh, num, DIA, RESUMEN, type L } from './_kit';
import { impuestosDelDia, conImpuestos } from '../engine/pvpc';

export default (l: L): MiniSpec => ({
  title: T(l, '¿Merece la pena dejar la colada para el fin de semana?', 'Is it worth leaving the laundry for the weekend?'),
  cta: T(l, 'Ver las horas baratas de hoy', 'See today’s cheapest hours'),
  inputs: [
    { id: 'h', label: T(l, 'Hora a la que lo harías', 'Hour you would do it'), def: 20, options: Array.from({ length: 24 }, (_, i) => ({ value: String(i), label: `${String(i).padStart(2, '0')}:00` })) },
    { id: 'kwh', label: T(l, 'Energía a la semana', 'Energy per week'), def: 5, unit: 'kWh', max: 500, decimals: 1 },
  ],
  run: ({ h, kwh: k }) => {
    const imp = impuestosDelDia(DIA);
    const lab = conImpuestos(RESUMEN.laborable.eurKwh[h] * 1000, imp);
    const fin = conImpuestos(RESUMEN.finde.eurKwh[h] * 1000, imp);
    const ah = (lab - fin) * k * 52;
    return {
      head: [ah >= 0 ? T(l, 'Ahorro al año en fin de semana', 'Yearly saving at the weekend') : T(l, 'Coste extra al año en fin de semana', 'Extra yearly cost at the weekend'), eur(Math.abs(ah), l)],
      rows: [
        [T(l, `Laborable a las ${String(h).padStart(2, '0')}:00 (media de ${RESUMEN.laborable.dias} días)`, `Weekday at ${String(h).padStart(2, '0')}:00 (average of ${RESUMEN.laborable.dias} days)`), kwh(lab, l)],
        [T(l, `Fin de semana a las ${String(h).padStart(2, '0')}:00 (${RESUMEN.finde.dias} días)`, `Weekend at ${String(h).padStart(2, '0')}:00 (${RESUMEN.finde.dias} days)`), kwh(fin, l)],
        [T(l, 'Diferencia por kWh', 'Difference per kWh'), kwh(lab - fin, l)],
        [T(l, 'Energía al año', 'Energy per year'), `${num(k * 52, l)} kWh`],
      ],
      note: T(l, 'Medias PVPC con impuestos de los 28 últimos días, hora a hora.', 'Hour-by-hour PVPC averages with taxes over the last 28 days.'),
    };
  },
});
