import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { costePotenciaAnual, ESCALONES } from '../../components/calc/PotenciaCalc';

/** Potencia contratada: coste anual de cada kW en el PVPC y ahorro al bajar de escalón. */
const V = (h: Helpers) => {
  const hoy = h.R.ESTADO.hoy;
  const a = costePotenciaAnual(4.6, 4.6, hoy), b = costePotenciaAnual(3.45, 3.45, hoy), c = costePotenciaAnual(5.75, 5.75, hoy);
  const kwP1 = h.M.POT_P1_PVPC * (1 + a.imp.iee) * (1 + a.imp.iva);
  return { a, b, c, kwP1, hoy };
};

export default defineGuide({
  id: 'potencia',
  group: 'factura',
  order: 3,
  tool: 'potencia',
  related: ['factura', 'peajes', 'libre', 'coche'],
  sources: ['cnmcPeajes2026', 'tedCargos2026', 'etuComercializacion', 'cnmcCircular3_2020', 'rd1164', 'rd1048'],
  es: {
    slug: 'potencia-contratada',
    nav: 'Potencia contratada',
    card: 'Lo que cuesta cada kW al año en el PVPC y lo que ahorras bajando de potencia.',
    title: 'Potencia contratada 2026: cuánto cuesta cada kW en el PVPC',
    description: 'Potencia contratada: el término de potencia del PVPC en 2026 con peajes, cargos, margen, impuesto eléctrico e IVA, y el ahorro al año si bajas a otro escalón.',
    h1: 'Potencia contratada: lo que pagas por cada kW',
    intro: 'La potencia se paga todos los días, consumas o no. Calcula cuánto te cuesta la tuya y cuánto ahorrarías bajándola.',
    resume: (h) => {
      const v = V(h);
      return `En ${h.P.year}, cada kW contratado en punta-llano cuesta en el PVPC ${h.eur(v.kwP1, 2)} al año con impuestos, y el de valle apenas unos céntimos. Con 4,6 kW en los dos periodos, el término de potencia suma ${h.eur(v.a.total, 2)} al año; con 3,45 kW serían ${h.eur(v.b.total, 2)}, ${h.eur(v.a.total - v.b.total, 2)} menos, y con 5,75 kW ${h.eur(v.c.total, 2)}. El precio del kW lo forman tres piezas del BOE: el peaje de la CNMC, el cargo del Ministerio y el margen de comercialización del PVPC, más el impuesto eléctrico y el IVA. La calculadora compara tu potencia actual con la que valoras, con los escalones que corresponden a los interruptores de 10 a 50 amperios. La decisión de fondo no es de precio, sino de uso: con poca potencia salta el interruptor si coinciden horno, vitrocerámica y lavadora.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: '¿Qué potencia necesito en casa?', a: `Suma la potencia de lo que usas a la vez en el peor momento del día: horno, placa de inducción, lavadora calentando agua, termo, aire acondicionado. Cada aparato la indica en vatios en su placa de características. Elige el primer escalón por encima de esa suma, con algo de margen para la nevera y la iluminación, que siempre están encendidas.` },
        { q: '¿Puedo tener distinta potencia en punta y en valle?', a: `Sí, la tarifa 2.0TD permite contratar dos potencias, una para punta-llano (P1) y otra para valle (P2). La de valle es mucho más barata, ${h.eur(h.M.POT_P2_PVPC * (1 + v.a.imp.iee) * (1 + v.a.imp.iva), 2)} por kW al año con impuestos, y conviene subirla si cargas el coche de noche.` },
        { q: '¿Cuesta algo cambiar de potencia?', a: `Bajarla no cuesta nada por ley, salvo si hay que cambiar el equipo de medida. Subirla cuenta como un alta adicional y paga derechos de acceso y, si hay que reforzar la red, de extensión. La distribuidora puede negarse a otro cambio si ya lo hiciste en los últimos doce meses. Pide el importe a tu comercializadora antes de decidir y compáralo con el ahorro anual de la calculadora.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>El precio de un kW en ${h.P.year}</h2>
${h.table(['Pieza', 'Punta-llano (P1)', 'Valle (P2)', 'Norma'], [
  ['Peaje de transporte y distribución', h.num(h.P.peajes.potencia_eur_kw_ano.P1, 6), h.num(h.P.peajes.potencia_eur_kw_ano.P2, 6), 'Resolución CNMC 18/12/2025'],
  ['Cargo del sistema', h.num(h.P.cargos.potencia_eur_kw_ano.P1, 6), h.num(h.P.cargos.potencia_eur_kw_ano.P2, 6), 'Orden TED/1524/2025'],
  ['Margen de comercialización', h.num(h.P.comercializacion.margen_fijo_eur_kw_ano, 3), '0', 'Orden ETU/1948/2016'],
  ['Total sin impuestos', h.num(h.M.POT_P1_PVPC, 6), h.num(h.M.POT_P2_PVPC, 6), ''],
], '€ por kW y año. Con impuesto eléctrico e IVA, multiplica por (1 + impuesto) × (1 + IVA).', ['l', 'r', 'r', 'l'])}
<p>Los escalones de la lista no son arbitrarios: corresponden a la intensidad del interruptor de control de potencia multiplicada por 230 voltios, aunque con contador inteligente también se puede contratar cualquier múltiplo de 0,1 kW hasta 15 kW (Real Decreto 1164/2001, artículo 9.4). ${ESCALONES.slice(1, 5).map((e) => `${e.a} amperios dan ${h.num(e.kw, 2)} kW`).join(', ')}. Con un contador inteligente la distribuidora puede cambiar la potencia a distancia, sin visita.</p>
<p>La potencia es la parte de la factura que no depende de la hora, y la ${h.a('factura', 'factura completa')} la muestra junto a la energía. Si cargas el coche en casa, la guía de ${h.a('coche', 'carga del coche eléctrico')} explica por qué subir solo la potencia de valle suele bastar.</p>`;
    },
  },
  en: {
    slug: 'contracted-power',
    nav: 'Contracted power',
    card: 'What each kW costs a year on the PVPC and what you save by lowering your power.',
    title: 'Contracted Power Spain 2026: What Each kW Costs on the PVPC',
    description: 'Contracted power in Spain: the 2026 PVPC power term with tolls, charges, margin, electricity tax and VAT, and the yearly saving from moving to a lower step.',
    h1: 'Contracted power: what you pay for each kW',
    intro: 'Power is paid every day, whether you use electricity or not. Work out what yours costs and what a lower setting would save.',
    resume: (h) => {
      const v = V(h);
      return `In ${h.P.year}, each kW contracted for the peak-standard period costs ${h.eur(v.kwP1, 2)} a year on the PVPC including taxes, and the off-peak kW only a few cents. With 4.6 kW in both periods, the power term comes to ${h.eur(v.a.total, 2)} a year; with 3.45 kW it would be ${h.eur(v.b.total, 2)}, ${h.eur(v.a.total - v.b.total, 2)} less, and with 5.75 kW ${h.eur(v.c.total, 2)}. The price per kW has three parts, all in the BOE: the CNMC network toll, the government system charge and the PVPC retail margin, plus electricity tax and VAT. The calculator compares your current power with the one you are considering, using the steps that match 10 to 50 amp switches. The real decision is about use rather than price: with too little power the switch trips when the oven, hob and washing machine coincide.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'How much power does my home need?', a: `Add up what runs at the same time at the busiest moment of the day: oven, induction hob, washing machine heating water, water heater, air conditioning. Each appliance shows its power in watts on its rating plate. Pick the first step above that total, with a little headroom for the fridge and lighting, which are always on.` },
        { q: 'Can I have different power at peak and off-peak?', a: `Yes. The 2.0TD tariff lets you contract two powers, one for peak-standard (P1) and one for off-peak (P2). Off-peak power is far cheaper, ${h.eur(h.M.POT_P2_PVPC * (1 + v.a.imp.iee) * (1 + v.a.imp.iva), 2)} per kW a year with tax, and worth raising if you charge a car overnight. The calculator’s third field lets you set it separately.` },
        { q: 'Does changing power cost anything?', a: `Lowering it is free by law unless the meter has to be replaced. Raising it counts as an additional connection and pays access fees, plus extension fees if the grid needs reinforcing. The distributor can refuse another change if you made one in the last twelve months. Ask your retailer for the fee before deciding and set it against the yearly saving shown here.` },
      ];
    },
    body: (h) => {
      return `<h2>The price of one kW in ${h.P.year}</h2>
${h.table(['Component', 'Peak-standard (P1)', 'Off-peak (P2)', 'Source'], [
  ['Transmission and distribution toll', h.num(h.P.peajes.potencia_eur_kw_ano.P1, 6), h.num(h.P.peajes.potencia_eur_kw_ano.P2, 6), 'CNMC Resolution 18/12/2025'],
  ['System charge', h.num(h.P.cargos.potencia_eur_kw_ano.P1, 6), h.num(h.P.cargos.potencia_eur_kw_ano.P2, 6), 'Order TED/1524/2025'],
  ['Retail margin', h.num(h.P.comercializacion.margen_fijo_eur_kw_ano, 3), '0', 'Order ETU/1948/2016'],
  ['Total before tax', h.num(h.M.POT_P1_PVPC, 6), h.num(h.M.POT_P2_PVPC, 6), ''],
], '€ per kW per year. With electricity tax and VAT, multiply by (1 + tax) × (1 + VAT).', ['l', 'r', 'r', 'l'])}
<p>The steps in the list are not arbitrary: they are the rating of the power control switch multiplied by 230 volts, although with a smart meter any multiple of 0.1 kW up to 15 kW can also be contracted (Royal Decree 1164/2001, article 9.4). ${ESCALONES.slice(1, 5).map((e) => `${e.a} amps gives ${h.num(e.kw, 2)} kW`).join(', ')}. With a smart meter the distributor can change your power remotely, without a visit.</p>
<p>Power is the part of the bill that does not depend on the hour, and the ${h.a('factura', 'full bill calculator')} shows it next to energy. If you charge a car at home, the ${h.a('coche', 'electric car charging')} page explains why raising only the off-peak power is often enough.</p>`;
    },
  },
});
