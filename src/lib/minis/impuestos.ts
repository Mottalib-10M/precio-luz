/** Mini: lo que suman el impuesto eléctrico y el IVA (o el IGIC) a una factura antes de impuestos. */
import type { MiniSpec } from '../mini-types';
import { T, eur, num, DIA, type L } from './_kit';
import { impuestosDelDia } from '../engine/pvpc';

export default (l: L): MiniSpec => ({
  title: T(l, '¿Cuánto suman los impuestos a tu factura?', 'How much do taxes add to your bill?'),
  cta: T(l, 'Calcular la factura completa', 'Work out the full bill'),
  inputs: [
    { id: 'base', label: T(l, 'Potencia + energía, sin impuestos', 'Power + energy, before taxes'), def: 60, unit: '€', max: 5000 },
    { id: 'reg', label: T(l, 'Dónde vives', 'Where you live'), def: 0, options: [{ value: '0', label: T(l, 'Península y Baleares', 'Mainland and Balearics') }, { value: '1', label: T(l, 'Canarias', 'Canary Islands') }] },
  ],
  run: ({ base, reg }) => {
    const imp = impuestosDelDia(DIA, 4.6, reg === 1 ? 'canarias' : 'peninsula');
    const iee = base * imp.iee;
    const ind = (base + iee) * imp.iva;
    return {
      head: [T(l, 'Impuestos de esa factura', 'Taxes on that bill'), eur(iee + ind, l)],
      rows: [
        [T(l, `Impuesto eléctrico (${num(imp.iee * 100, l, 2)} %)`, `Electricity tax (${num(imp.iee * 100, l, 2)}%)`), eur(iee, l)],
        [`${imp.indirecto} (${num(imp.iva * 100, l, 0)} %)`, eur(ind, l)],
        [T(l, 'Total con impuestos', 'Total with taxes'), eur(base + iee + ind, l)],
        [T(l, 'Los impuestos suben la factura un', 'Taxes raise the bill by'), `${num(((iee + ind) / Math.max(base, 1e-9)) * 100, l, 1)} %`],
      ],
      note: T(l, 'Sin el alquiler del contador, que no paga impuesto eléctrico pero sí IVA.', 'Excluding meter rental, which pays VAT but no electricity tax.'),
    };
  },
});
