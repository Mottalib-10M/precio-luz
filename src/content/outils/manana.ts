import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';

/** Precio de la luz mañana: el PVPC del día siguiente en cuanto Red Eléctrica lo publica. */
const V = (h: Helpers) => {
  const hoy = h.R.resumenDia(0), man = h.R.resumenDia(1);
  const dif = man.media - hoy.media;
  return { hoy, man, dif, publicado: !man.estimado };
};

export default defineGuide({
  id: 'manana',
  group: 'precio',
  order: 1,
  tool: 'precio',
  toolProps: { mode: 'manana' },
  related: ['baratas', 'cuartos', 'lavadora', 'coche', 'historial'],
  sources: ['esiosPvpc', 'rd216', 'reeMercado', 'cnmcCircular3_2020', 'ley38Iee'],
  es: {
    slug: 'precio-luz-manana',
    nav: 'Precio de la luz mañana',
    card: 'Las 24 horas del PVPC de mañana con impuestos, en cuanto Red Eléctrica las publica.',
    title: 'Precio luz mañana 2026: PVPC con impuestos hora a hora',
    description: 'Precio de la luz mañana con IVA e impuesto eléctrico: las 24 horas del PVPC 2026 en cuanto Red Eléctrica las publica, hacia las 20:15, y la más barata.',
    h1: 'Precio de la luz mañana: el PVPC del día siguiente',
    intro: 'Red Eléctrica publica cada tarde los precios de mañana. Aquí los tienes con impuestos y con la hora que más conviene.',
    resume: (h) => {
      const v = V(h);
      return v.publicado
        ? `Mañana, ${h.dia(v.man.fecha)}, el PVPC costará de media ${h.kwh(v.man.media)} por kWh con impuestos, ${v.dif >= 0 ? `${h.kwh(v.dif)} más` : `${h.kwh(-v.dif)} menos`} que hoy. La hora más barata será la de ${h.tramo(v.man.min.h)}, a ${h.kwh(v.man.min.ttc)}, y la más cara la de ${h.tramo(v.man.max.h)}, a ${h.kwh(v.man.max.ttc)}. Red Eléctrica publica estos 24 precios la tarde anterior, antes de las 20:15 como fija el Real Decreto 216/2014, a partir del resultado del mercado diario y de los productos a plazo, y ya no cambian: puedes programar hoy la lavadora, el lavavajillas o la carga del coche para mañana sabiendo exactamente lo que pagarás. Si mañana es sábado, domingo o festivo nacional, todas las horas van con los peajes y cargos del valle, y la diferencia entre la mañana y la tarde suele venir solo del mercado.`
        : `El precio PVPC de mañana, ${h.dia(v.man.fecha)}, todavía no está publicado: Red Eléctrica lo da cada tarde hacia las 20:15 y esta página se actualiza sola poco después. Mientras tanto la calculadora muestra un precio medio estimado, hora a hora, con los días anteriores del mismo tipo (laborables o fines de semana), y lo indica en un recuadro: sirve para hacerse una idea de las horas buenas, no para dar una cifra exacta. Hoy, como referencia, la media es de ${h.kwh(v.hoy.media)} con impuestos y la hora más barata es la de ${h.tramo(v.hoy.min.h)}. En cuanto llega el archivo oficial, los 24 precios de mañana sustituyen a la estimación y ya no cambian hasta el día siguiente, de modo que se puede programar con tranquilidad la lavadora o el coche.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: '¿Puede cambiar el precio de mañana después de publicarse?', a: `No. Los 24 precios del PVPC que Red Eléctrica publica por la tarde son los que se facturan al día siguiente. Lo que puede variar es el mercado intradiario, pero eso no se traslada a la tarifa regulada de los hogares. Esta página vuelve a descargar el archivo dos veces por la noche por si hubiera una corrección.` },
        { q: '¿Por qué antes de las 20:15 la página da otro precio para mañana?', a: `Porque el dato oficial aún no existe. Hasta que Red Eléctrica lo publica, la tabla de mañana es una media hora a hora de los últimos días del mismo tipo, marcada como estimación. Es útil para saber si el mediodía o la noche saldrán mejor, nunca como precio exacto.` },
        { q: '¿Se sabe algo del precio de mañana antes de la tarde?', a: `Sí, el mercado diario se casa a mediodía y su resultado se publica a primera hora de la tarde. Es el precio mayorista, sin peajes, cargos ni impuestos, y solo pesa una parte del PVPC, pero anticipa qué horas serán baratas. Lo verás en la página de cuartos de hora.` },
        { q: `¿Mañana conviene más que hoy?`, a: v.publicado ? `Mañana la media con impuestos es de ${h.kwh(v.man.media)}, frente a ${h.kwh(v.hoy.media)} hoy. Si lo que vas a hacer puede esperar y la mejor hora de mañana (${h.tramo(v.man.min.h)}, ${h.kwh(v.man.min.ttc)}) está por debajo de la mejor de hoy (${h.kwh(v.hoy.min.ttc)}), merece la pena aplazarlo.` : `Todavía no se puede decir con datos oficiales: el precio de mañana aún no está publicado. Hoy la mejor hora es la de ${h.tramo(v.hoy.min.h)}, a ${h.kwh(v.hoy.min.ttc)} con impuestos. Vuelve después de las 20:15 y compara la mejor hora de los dos días.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Cómo se fija el precio de mañana</h2>
<p>El PVPC de un día se construye la víspera. A mediodía se casa el mercado diario europeo, que da un precio para cada cuarto de hora; a eso se suma el coste de los productos a plazo que compran las comercializadoras de referencia, los servicios de ajuste del sistema y, por último, los peajes y cargos regulados del periodo de cada hora. Red Eléctrica junta todas las piezas y publica por la tarde los 24 precios horarios en ${h.src('esiosPvpc', 'e·sios')}. Es el único dato que vale para la factura.</p>
<p>Por eso no tiene sentido buscar el precio de pasado mañana: no existe hasta la tarde de mañana. Lo que sí se puede saber es si mañana será laborable o festivo, y eso ya dice mucho. En un laborable, de 10 a 14 y de 18 a 22 se paga el peaje y el cargo de punta, que en ${h.P.year} suman ${h.kwh(h.M.REGULADO_ENERGIA.P1, 4)} por kWh antes de impuestos; de 0 a 8, solo ${h.kwh(h.M.REGULADO_ENERGIA.P3, 4)}.</p>
<h2>Qué hacer con el precio de mañana</h2>
<p>La utilidad práctica es programar. La mayoría de lavadoras y lavavajillas tienen inicio diferido, y muchos coches eléctricos dejan elegir la hora de carga desde la aplicación. Con la tabla de mañana delante, elige el bloque de horas verdes que cubra todo el programa: el simulador de ${h.a('lavadora', 'la lavadora')} y el de ${h.a('coche', 'la carga del coche')} lo calculan con la duración real, porque un programa de tres horas que empieza en la hora más barata puede acabar en una cara.</p>
<p>Si buscas sobre todo las horas, sin aparatos, la página de ${h.a('baratas', 'horas baratas')} ordena el día y te da el mejor bloque seguido del número de horas que necesites.</p>`;
    },
  },
  en: {
    slug: 'electricity-price-tomorrow',
    nav: 'Electricity price tomorrow',
    card: 'All 24 PVPC hours for tomorrow with taxes, as soon as Red Eléctrica publishes them.',
    title: 'Electricity Price Tomorrow Spain 2026: PVPC by Hour, Taxed',
    description: 'Spain’s electricity price tomorrow with VAT and tax: all 24 PVPC 2026 hours once Red Eléctrica publishes them, around 8:15 pm, plus the cheapest hour.',
    h1: 'Electricity price tomorrow in Spain: next day’s PVPC',
    intro: 'Red Eléctrica publishes tomorrow’s prices every evening. Here they are with taxes and with the hour that suits you best.',
    resume: (h) => {
      const v = V(h);
      return v.publicado
        ? `Tomorrow, ${h.dia(v.man.fecha)}, the PVPC will average ${h.kwh(v.man.media)} per kWh including taxes, ${v.dif >= 0 ? `${h.kwh(v.dif)} more` : `${h.kwh(-v.dif)} less`} than today. The cheapest hour will be ${h.tramo(v.man.min.h)}, at ${h.kwh(v.man.min.ttc)}, and the most expensive ${h.tramo(v.man.max.h)}, at ${h.kwh(v.man.max.ttc)}. Red Eléctrica publishes these 24 prices the evening before, by 8:15 pm Madrid time as Royal Decree 216/2014 requires, from the day-ahead market result and the forward products, and they do not change afterwards. So you can set the washing machine, the dishwasher or the car charge for tomorrow tonight, knowing exactly what you will pay. If tomorrow is a Saturday, a Sunday or a national holiday, every hour carries off-peak tolls and charges, and the gap between morning and evening comes from the market alone. Every figure on this page is recalculated by the site’s engine from the official file, never typed in by hand.`
        : `Tomorrow’s PVPC price, for ${h.dia(v.man.fecha)}, is not out yet: Red Eléctrica publishes it every evening around 8:15 pm Madrid time and this page updates itself shortly afterwards. Until then the calculator shows an estimated average, hour by hour, built from previous days of the same type (weekdays or weekends), and says so in a box. It is good for spotting the cheap part of the day, not for an exact figure. For reference, today averages ${h.kwh(v.hoy.media)} with taxes and the cheapest hour is ${h.tramo(v.hoy.min.h)}. Once the official file arrives, tomorrow’s 24 prices replace the estimate and stay fixed until the next day, so you can safely programme the washing machine or the car. Every figure on this page is recalculated from the official file, never typed in by hand.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Can tomorrow’s price change after it is published?', a: `No. The 24 PVPC prices Red Eléctrica publishes in the evening are the ones billed the next day. Intraday market trading can move wholesale prices, but that does not feed into the regulated household tariff. This site downloads the file twice in the evening in case of a correction.` },
        { q: 'Why does the page show a different price for tomorrow before 8:15 pm?', a: `Because the official figure does not exist yet. Until Red Eléctrica publishes it, tomorrow’s table is an hour-by-hour average of recent days of the same type, clearly labelled as an estimate. Use it to see whether midday or night will be cheaper, never as the exact price.` },
        { q: 'Is anything known about tomorrow before the evening?', a: `Yes: the day-ahead market clears at midday and the result is out in the early afternoon. It is the wholesale price, without tolls, charges or tax, and only part of the PVPC, but it hints at which hours will be cheap. You can see it on the quarter-hour price page.` },
        { q: 'Is tomorrow cheaper than today?', a: v.publicado ? `Tomorrow averages ${h.kwh(v.man.media)} with taxes, against ${h.kwh(v.hoy.media)} today. If the job can wait and tomorrow’s best hour (${h.tramo(v.man.min.h)}, ${h.kwh(v.man.min.ttc)}) is below today’s best (${h.kwh(v.hoy.min.ttc)}), putting it off is worth it, especially for long programmes.` : `There is no official answer yet: tomorrow’s price has not been published. Today the best hour is ${h.tramo(v.hoy.min.h)}, at ${h.kwh(v.hoy.min.ttc)} with taxes. Come back after 8:15 pm and compare the best hour of each day; the page updates itself.` },
      ];
    },
    body: (h) => {
      return `<h2>How tomorrow’s price is set</h2>
<p>A day’s PVPC is built the day before. At midday the European day-ahead market clears, giving a price for each quarter hour; on top come the cost of the forward products bought by the reference retailers, the grid balancing services and, finally, the regulated tolls and charges for each hour’s period. Red Eléctrica puts the pieces together and publishes the 24 hourly prices on ${h.src('esiosPvpc', 'e·sios')} in the evening. That is the only figure that counts for your bill.</p>
<p>So there is no point looking for the day after tomorrow: it does not exist until tomorrow evening. What you can know in advance is whether tomorrow is a working day or a holiday, and that already tells you a lot. On a weekday, from 10 to 14 and from 18 to 22 you pay the peak toll and charge, ${h.kwh(h.M.REGULADO_ENERGIA.P1, 4)} per kWh before tax in ${h.P.year}; from midnight to 8 am, just ${h.kwh(h.M.REGULADO_ENERGIA.P3, 4)}.</p>
<h2>What to do with tomorrow’s price</h2>
<p>The practical use is scheduling. Most washing machines and dishwashers have a delay timer, and many electric cars let you set the charging time in the app. With tomorrow’s table in front of you, pick the run of green hours that covers the whole programme: the ${h.a('lavadora', 'washing machine')} and ${h.a('coche', 'car charging')} calculators work with the real duration, because a three-hour programme that starts in the cheapest hour can end in an expensive one.</p>
<p>If you only want the hours, without appliances, the ${h.a('baratas', 'cheapest hours')} page ranks the day and gives you the best run for the number of hours you need.</p>`;
    },
  },
});
