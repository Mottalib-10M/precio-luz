import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';

/** Horas baratas: las N horas más baratas del día y el mejor bloque seguido. */
const V = (h: Helpers) => {
  const hoy = h.R.resumenDia(0);
  const orden = [...hoy.horas].sort((a, b) => a.ttc - b.ttc);
  const b4 = h.M.mejorBloque(hoy.horas, 4);
  const valle = hoy.horas.filter((x) => x.periodo === 'P3');
  const mediaValle = valle.reduce((s, x) => s + x.ttc, 0) / Math.max(1, valle.length);
  const tarde = hoy.horas.filter((x) => x.h >= 12 && x.h < 17);
  const mediaSol = tarde.reduce((s, x) => s + x.ttc, 0) / Math.max(1, tarde.length);
  return { hoy, orden, b4, mediaValle, mediaSol };
};

export default defineGuide({
  id: 'baratas',
  group: 'precio',
  order: 2,
  tool: 'precio',
  toolProps: { mode: 'baratas' },
  related: ['manana', 'finde', 'periodos', 'lavavajillas', 'coche'],
  sources: ['esiosPvpc', 'cnmcCircular3_2020', 'cnmcPeajes2026', 'tedCargos2026'],
  es: {
    slug: 'horas-baratas-luz',
    nav: 'Horas más baratas de la luz',
    card: 'Las horas más baratas de hoy y el mejor bloque seguido para tus aparatos.',
    title: 'Horas baratas luz hoy 2026: el mejor tramo con impuestos',
    description: 'Horas más baratas de la luz hoy, PVPC 2026 de Red Eléctrica: elige cuántas horas necesitas y te damos el mejor tramo seguido, con IVA e impuesto eléctrico.',
    h1: 'Horas más baratas de la luz hoy',
    intro: 'Dinos cuántas horas seguidas necesitas y te damos el tramo más barato del día, con impuestos.',
    resume: (h) => {
      const v = V(h);
      return `Hoy, ${h.dia(v.hoy.fecha)}, las tres horas más baratas del PVPC son las de ${v.orden.slice(0, 3).sort((a, b) => a.i - b.i).map((x) => h.tramo(x.h)).join(', ')}, con un precio con impuestos entre ${h.kwh(v.orden[0].ttc)} y ${h.kwh(v.orden[2].ttc)}. Si lo que vas a encender necesita cuatro horas seguidas, el mejor tramo empieza a las ${String(v.hoy.horas[v.b4.inicio].h).padStart(2, '0')}:00 y sale a ${h.kwh(v.b4.media)} de media. No es lo mismo la hora más barata que el mejor tramo: un lavavajillas de tres horas no se puede partir, y una hora suelta muy barata rodeada de horas caras no sirve para él. Por eso la calculadora te deja elegir de una a ocho horas y te da las dos respuestas, las horas sueltas y el bloque seguido. Los precios son los oficiales de Red Eléctrica con el impuesto eléctrico y el IVA del día; en Canarias, con el IGIC al 0 %, y en Ceuta y Melilla, con su precio propio y el IPSI al 1 %.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: '¿Las horas baratas son siempre de madrugada?', a: `Ya no. Con tanta fotovoltaica, el mediodía soleado hunde el precio del mercado y a menudo gana a la madrugada pese a pagar peajes de llano. Hoy, de 12 a 17 la media es ${h.kwh(v.mediaSol)} y las horas de valle salen a ${h.kwh(v.mediaValle)}, todo con impuestos. Mira la tabla de cada día.` },
        { q: '¿Cuántas horas baratas hay cada día?', a: `El color de la tabla divide el día en tres tercios por precio: ocho horas baratas, ocho medias y ocho caras, sean cuales sean los precios. Es una forma de ordenar, no un umbral fijo: en un día caro la hora barata puede costar más que la hora cara de un día de mucho viento.` },
        { q: '¿Sirve para la tarifa de discriminación horaria del mercado libre?', a: `Solo en parte. Las tarifas de tres periodos del mercado libre tienen un precio fijo por periodo, así que para ellas manda el horario de punta, llano y valle, no la tabla del día. Esta página sirve al PVPC y a las tarifas indexadas, que siguen el precio de cada hora.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Horas sueltas o un tramo seguido</h2>
<p>Para el termo eléctrico o un radiador con programador, que se pueden encender y apagar varias veces, cuentan las horas sueltas: la lista que aparece bajo los campos las ordena por precio. Para una lavadora, un lavavajillas o la carga de un coche cuenta el tramo seguido, porque el programa no se interrumpe. El gráfico marca ese tramo y atenúa el resto del día.</p>
<p>Con los precios de hoy, la hora más barata sola cuesta ${h.kwh(v.orden[0].ttc)}, pero el mejor tramo de cuatro horas sale a ${h.kwh(v.b4.media)}: la media sube porque arrastra horas vecinas. Esa diferencia es la que el simulador de cada aparato tiene en cuenta cuando calcula el coste de un programa largo.</p>
<h2>Qué hace barata una hora</h2>
<p>Dos cosas. La primera es el mercado: cuando sopla el viento o hay sol, las renovables desplazan al gas y el precio cae. La segunda es el periodo de la ${h.src('cnmcCircular3_2020', 'Circular 3/2020')}: en valle los peajes y cargos de la energía casi desaparecen, en punta son los más altos. La guía de ${h.a('periodos', 'periodos horarios')} lo explica con las cifras de ${h.P.year}, y la del ${h.a('finde', 'fin de semana')} calcula cuánto se gana dejando una tarea para el sábado.</p>`;
    },
  },
  en: {
    slug: 'cheapest-hours-electricity',
    nav: 'Cheapest electricity hours',
    card: 'Today’s cheapest hours and the best run of hours in a row for your appliances.',
    title: 'Cheapest Electricity Hours Spain 2026: Today’s Best Slot',
    description: 'Cheapest electricity hours in Spain today, 2026 PVPC from Red Eléctrica: choose how many hours you need and get the best slot in a row, with VAT and tax.',
    h1: 'Cheapest electricity hours in Spain today',
    intro: 'Tell us how many hours in a row you need and we give you the cheapest slot of the day, taxes included.',
    resume: (h) => {
      const v = V(h);
      return `Today, ${h.dia(v.hoy.fecha)}, the three cheapest PVPC hours are ${v.orden.slice(0, 3).sort((a, b) => a.i - b.i).map((x) => h.tramo(x.h)).join(', ')}, at between ${h.kwh(v.orden[0].ttc)} and ${h.kwh(v.orden[2].ttc)} including taxes. If what you are switching on needs four hours in a row, the best slot starts at ${String(v.hoy.horas[v.b4.inicio].h).padStart(2, '0')}:00 and averages ${h.kwh(v.b4.media)}. The cheapest hour and the best slot are not the same thing: a three-hour dishwasher cycle cannot be split, and one very cheap hour surrounded by dear ones is no use to it. That is why the calculator lets you pick anything from one to eight hours and gives both answers, the separate cheapest hours and the best unbroken run. Prices are Red Eléctrica’s official figures with that day’s electricity tax and VAT, for the mainland and the Balearic Islands; switch to the Canary Islands and the 0% IGIC is applied instead, or to Ceuta or Melilla for their own price and 1% IPSI. Nothing is sent anywhere: the ranking is done in your browser.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Are the cheap hours always in the middle of the night?', a: `Not any more. With so much solar, a sunny midday drags the market price down and often beats the small hours despite paying standard-period tolls. Today, 12:00 to 17:00 averages ${h.kwh(v.mediaSol)} and the off-peak hours ${h.kwh(v.mediaValle)}, all with taxes. Check each day’s table.` },
        { q: 'How many cheap hours are there each day?', a: `The table’s colours split the day into thirds by price: eight cheap, eight mid-priced and eight expensive hours, whatever the actual prices. It is a ranking, not a fixed threshold: on a pricey day a “cheap” hour can cost more than an “expensive” hour on a windy one.` },
        { q: 'Is this useful for a fixed three-period tariff?', a: `Only partly. Fixed three-period deals charge one price per period, so what matters for them is the peak, standard and off-peak timetable, not the day’s table. This page is for the PVPC and for indexed tariffs that follow each hour’s price, where the table changes every single day.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Separate hours or one unbroken slot</h2>
<p>For an electric water heater or a radiator on a timer, which can switch on and off several times, the separate hours are what count: the list under the fields ranks them by price. For a washing machine, a dishwasher or a car charge, the unbroken slot is what counts, because the programme does not pause. The chart highlights that slot and fades the rest of the day.</p>
<p>With today’s prices the single cheapest hour costs ${h.kwh(v.orden[0].ttc)}, but the best four-hour slot averages ${h.kwh(v.b4.media)}: the average rises because it drags in neighbouring hours. Each appliance calculator takes that into account when it prices a long programme.</p>
<h2>What makes an hour cheap</h2>
<p>Two things. The market: when it is windy or sunny, renewables push gas out and the price falls. And the period under ${h.src('cnmcCircular3_2020', 'CNMC Circular 3/2020')}: off-peak, the energy tolls and charges almost vanish; at peak they are highest. The ${h.a('periodos', 'time-of-use periods')} guide sets out the ${h.P.year} figures, and the ${h.a('finde', 'weekend')} guide works out what you gain by leaving a job for Saturday.</p>`;
    },
  },
});
