/** Mini: cuánto se va en peajes y cargos al mes según tu consumo y tu potencia. */
import type { MiniSpec } from '../mini-types';
import { T, eur, num, type L } from './_kit';
import { REGULADO_ENERGIA } from '../engine/factura';
import { P } from '../engine/params';

export default (l: L): MiniSpec => ({
  title: T(l, '¿Cuánto pagas al mes en peajes y cargos?', 'How much do you pay a month in tolls and charges?'),
  cta: T(l, 'Calcular la factura completa', 'Work out the full bill'),
  inputs: [
    { id: 'kwh', label: T(l, 'Consumo al mes', 'Use per month'), def: 270, unit: 'kWh', max: 5000 },
    { id: 'valle', label: T(l, 'Parte del consumo en valle', 'Share used off-peak'), def: 50, unit: '%', max: 100 },
    { id: 'kw', label: T(l, 'Potencia contratada', 'Contracted power'), def: 4.6, unit: 'kW', max: 15, decimals: 2 },
  ],
  run: ({ kwh, valle, kw }) => {
    const v = Math.min(100, valle) / 100, resto = 1 - v;
    // El resto se reparte a partes iguales entre punta y llano (dos franjas de 8 horas laborables).
    const energia = kwh * (v * REGULADO_ENERGIA.P3 + (resto / 2) * (REGULADO_ENERGIA.P1 + REGULADO_ENERGIA.P2));
    const peajesPot = kw * (P.peajes.potencia_eur_kw_ano.P1 + P.peajes.potencia_eur_kw_ano.P2) / 12;
    const cargosPot = kw * (P.cargos.potencia_eur_kw_ano.P1 + P.cargos.potencia_eur_kw_ano.P2) / 12;
    return {
      head: [T(l, 'Peajes y cargos al mes, sin impuestos', 'Tolls and charges per month, before taxes'), eur(energia + peajesPot + cargosPot, l)],
      rows: [
        [T(l, 'En la energía', 'On energy'), eur(energia, l)],
        [T(l, 'Peajes de la potencia (CNMC)', 'Power tolls (CNMC)'), eur(peajesPot, l)],
        [T(l, 'Cargos de la potencia (Ministerio)', 'Power charges (Ministry)'), eur(cargosPot, l)],
        [T(l, 'Por kWh consumido', 'Per kWh used'), `${num((energia + peajesPot + cargosPot) / Math.max(kwh, 1e-9), l, 4)} €`],
      ],
    };
  },
});
