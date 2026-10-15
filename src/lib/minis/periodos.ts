/** Mini: en qué periodo 2.0TD cae una hora y cuánto pagas de peajes y cargos por kWh en ella. */
import type { MiniSpec } from '../mini-types';
import { T, kwh, type L } from './_kit';
import { REGULADO_ENERGIA } from '../engine/factura';
import { P } from '../engine/params';

const per = (dia: number, h: number): 'P1' | 'P2' | 'P3' => {
  if (dia === 1) return 'P3';
  const en = (t: number[][]) => t.some(([a, b]) => h >= a && h < b);
  return en(P.periodos_2_0td.punta) ? 'P1' : en(P.periodos_2_0td.llano) ? 'P2' : 'P3';
};
export default (l: L): MiniSpec => ({
  title: T(l, '¿Punta, llano o valle? Elige una hora', 'Peak, standard or off-peak? Pick an hour'),
  cta: T(l, 'Ver el precio de hoy hora a hora', 'See today’s hourly price'),
  inputs: [
    { id: 'h', label: T(l, 'Hora', 'Hour'), def: 19, options: Array.from({ length: 24 }, (_, i) => ({ value: String(i), label: `${String(i).padStart(2, '0')}:00` })) },
    { id: 'dia', label: T(l, 'Día', 'Day'), def: 0, options: [{ value: '0', label: T(l, 'Lunes a viernes', 'Monday to Friday') }, { value: '1', label: T(l, 'Sábado, domingo o festivo nacional', 'Saturday, Sunday or national holiday') }] },
  ],
  run: ({ h, dia }) => {
    const p = per(dia, h);
    const nombre = { P1: T(l, 'Punta (P1)', 'Peak (P1)'), P2: T(l, 'Llano (P2)', 'Standard (P2)'), P3: T(l, 'Valle (P3)', 'Off-peak (P3)') }[p];
    return {
      head: [T(l, 'Periodo de esa hora', 'Period for that hour'), nombre],
      rows: [
        [T(l, 'Peajes y cargos de la energía', 'Energy tolls and charges'), kwh(REGULADO_ENERGIA[p], l, 6)],
        [T(l, 'Diferencia con el valle', 'Difference from off-peak'), kwh(REGULADO_ENERGIA[p] - REGULADO_ENERGIA.P3, l, 6)],
        [T(l, 'Potencia que se paga en esa hora', 'Power period billed at that hour'), p === 'P3' ? T(l, 'P2 (valle)', 'P2 (off-peak)') : T(l, 'P1 (punta-llano)', 'P1 (peak-standard)')],
      ],
      note: T(l, 'Sin impuestos. El precio de la energía (mercado) se suma aparte y cambia cada hora.', 'Before taxes. The energy (market) price comes on top and changes every hour.'),
    };
  },
});
