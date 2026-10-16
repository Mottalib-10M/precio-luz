import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';

/** Guía: el precio de la luz en fin de semana y festivos, con las medias reales de las últimas semanas. */
const V = (h: Helpers) => {
  const lf = h.R.laborableVsFinde(8);
  const dif = lf.laborable - lf.finde;
  const lav = h.M.kwhLavadora(h.P.aparatos.lavadora.capacidad_kg, h.P.aparatos.lavadora.clase);
  const reg = h.M.REGULADO_ENERGIA;
  return { lf, dif, lav, reg };
};

export default defineGuide({
  id: 'finde',
  group: 'precio',
  order: 5,
  mini: 'finde',
  miniHref: 'baratas',
  related: ['periodos', 'baratas', 'lavadora', 'historial'],
  sources: ['cnmcCircular3_2020', 'festivos2026', 'esiosPvpc', 'cnmcPeajes2026'],
  es: {
    slug: 'precio-luz-fin-de-semana',
    nav: 'Precio de la luz el fin de semana',
    card: 'Por qué sábado y domingo la luz suele costar menos, y cuánto se ahorra de verdad.',
    title: 'Precio luz fin de semana 2026: lo que ahorras el sábado',
    description: 'Precio de la luz el fin de semana en 2026: por qué sábados, domingos y festivos van en valle todo el día, la media de las últimas semanas y lo que ahorras.',
    h1: 'Precio de la luz el fin de semana',
    intro: 'Los sábados, domingos y festivos nacionales todas las horas van en valle. Te contamos cuánto se nota y en qué horas.',
    resume: (h) => {
      const v = V(h);
      return `En las últimas ocho semanas, del ${h.dia(v.lf.desde)} al ${h.dia(v.lf.hasta)}, el kWh del PVPC ha costado de media ${h.kwh(v.lf.finde)} con impuestos los sábados, domingos y festivos nacionales, frente a ${h.kwh(v.lf.laborable)} los laborables: ${v.dif >= 0 ? `${h.kwh(v.dif)} menos` : `${h.kwh(-v.dif)} más`} por kWh. La razón principal es regulada: la Circular 3/2020 de la CNMC pone en valle las 24 horas de esos días, de modo que la energía no paga los peajes y cargos de punta (${h.kwh(v.reg.P1, 4)} por kWh) ni de llano (${h.kwh(v.reg.P2, 4)}), sino los de valle (${h.kwh(v.reg.P3, 4)}). A eso se suma que la demanda baja y el mercado suele estar más barato. La ventaja no es igual a todas horas: es grande por la tarde y por la noche, cuando un laborable estaría en punta, y pequeña de madrugada, que ya era valle. El mini-simulador compara una hora concreta en laborable y en fin de semana con los perfiles reales de los últimos 28 días.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: '¿Es más barata la luz el sábado que el domingo?', a: `En peajes y cargos son iguales: los dos días son valle completo. La diferencia viene del mercado, que depende sobre todo del viento, el sol y la demanda de ese día concreto. Mira la tabla del día en la página principal: un sábado nublado y sin viento puede salir más caro que un martes ventoso.` },
        { q: '¿Los festivos de mi comunidad cuentan como fin de semana?', a: `No. Solo los festivos nacionales de fecha fija van en valle todo el día: 1 y 6 de enero, 1 de mayo, 15 de agosto, 12 de octubre, 1 de noviembre y 6, 8 y 25 de diciembre. Los festivos autonómicos, los locales y los de fecha variable, como Viernes Santo, se facturan como un laborable, aunque en tu ciudad no se trabaje.` },
        { q: '¿Cuánto ahorro haciendo las coladas el fin de semana?', a: `Depende de la hora a la que las harías entre semana. Con la diferencia media de las últimas ocho semanas, ${h.kwh(v.dif)} por kWh, cuatro lavados de ${h.num(v.lav, 2)} kWh a la semana durante un año suponen unos ${h.eur(Math.abs(v.dif) * v.lav * 4 * 52, 2)}. Por la tarde la ventaja es mayor; de madrugada, casi nula.` },
        { q: '¿Y si tengo una tarifa fija del mercado libre?', a: `Si es de precio único, el fin de semana cuesta lo mismo que el resto de la semana. Si es de discriminación horaria con tres precios, sábados y domingos se facturan enteros a precio de valle, igual que en el PVPC, y la ventaja es todavía más clara porque no depende del mercado.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      const P = h.P;
      const lab = h.M.esDiaValle;
      void lab;
      return `<h2>Por qué el fin de semana es valle</h2>
<p>La ${h.src('cnmcCircular3_2020', 'Circular 3/2020 de la CNMC')}, que fijó en 2021 los periodos de la tarifa 2.0TD, considera valle todas las horas de los sábados, los domingos y los festivos nacionales de fecha fija. El motivo es técnico: esos días la demanda eléctrica baja y las redes van holgadas, así que no tiene sentido cobrarles el peaje de las horas de más carga. Los cargos del Ministerio siguen la misma estructura.</p>
<p>En el PVPC eso se ve directamente en el precio de cada hora. Un martes a las 20:00, la energía lleva ${h.kwh(v.reg.P1, 4)} de peajes y cargos por kWh; un sábado a la misma hora, ${h.kwh(v.reg.P3, 4)}. Antes de impuestos, la diferencia es de ${h.kwh(v.reg.P1 - v.reg.P3, 4)}, y con el impuesto eléctrico y el IVA se acerca a ${h.kwh((v.reg.P1 - v.reg.P3) * (1 + P.impuestos.iee_general) * (1 + P.impuestos.iva_general), 4)}, aunque el mercado costara exactamente lo mismo los dos días.</p>
<h2>Lo que dicen los datos de las últimas semanas</h2>
${h.table(['Tipo de día', 'Precio medio con impuestos', 'Periodo de la energía'], [
  ['Laborables', h.kwh(v.lf.laborable), 'punta, llano y valle'],
  ['Sábados, domingos y festivos nacionales', h.kwh(v.lf.finde), 'valle las 24 horas'],
  ['Diferencia', h.kwh(v.dif), ''],
], `PVPC 2.0TD de Red Eléctrica del ${h.dia(v.lf.desde)} al ${h.dia(v.lf.hasta)}, media simple de todas las horas.`, ['l', 'r', 'l'])}
<p>Es una media de todas las horas. Hora a hora, la diferencia cambia mucho, y el mini-simulador de arriba la calcula para la hora que elijas con las medias de los últimos 28 días: el perfil de los laborables muestra los picos de la mañana y de la tarde, el del fin de semana es mucho más plano.</p>
<h2>Qué tareas compensa dejar para el sábado</h2>
<p>Las que gastan mucho y no tienen prisa: la colada, la secadora, el lavavajillas grande, el horno para cocinar para toda la semana, la plancha. También la carga del coche si no te hace falta antes. Lo que no compensa es cambiar costumbres de madrugada: esas horas ya son valle entre semana y la diferencia se reduce a lo que haga el mercado.</p>
<p>Si quieres afinar más, la página de ${h.a('baratas', 'horas baratas')} da el mejor tramo de cada día, también de los sábados y domingos, y la de la ${h.a('lavadora', 'lavadora')} calcula el coste de un lavado a cada hora. Las diferencias por meses están en el ${h.a('historial', 'historial')}.</p>
<h2>Los puentes y el 12 de octubre</h2>
<p>Un festivo nacional de fecha fija que cae entre semana se factura como un domingo: todo el día en valle. Es lo que pasó el lunes 12 de octubre de 2026. Los puentes que añaden las comunidades o los ayuntamientos, en cambio, no cambian nada en la factura: para la tarifa eléctrica son días laborables. La Circular 3/2020 solo cuenta el 6 de enero y los festivos nacionales de fecha fija no sustituibles del ${h.src('festivos2026', 'calendario laboral oficial')}: en 2026, el 1 de noviembre y el 6 de diciembre caen en domingo, y los lunes 2 de noviembre y 7 de diciembre que declaran algunas comunidades se facturan como laborables. La guía de ${h.a('periodos', 'periodos horarios')} tiene la lista completa de festivos que cuentan.</p>`;
    },
  },
  en: {
    slug: 'weekend-electricity-price',
    nav: 'Weekend electricity price',
    card: 'Why electricity usually costs less on Saturdays and Sundays, and how much you really save.',
    title: 'Weekend Electricity Price Spain 2026: What Saturday Saves',
    description: 'Spain’s weekend electricity price in 2026: why Saturdays, Sundays and holidays are off-peak all day, the average of recent weeks and what moving jobs saves.',
    h1: 'Electricity prices at the weekend in Spain',
    intro: 'On Saturdays, Sundays and national holidays every hour is off-peak. Here is how much difference that makes, and at what times.',
    resume: (h) => {
      const v = V(h);
      return `Over the last eight weeks, from ${h.dia(v.lf.desde)} to ${h.dia(v.lf.hasta)}, a PVPC kWh has cost on average ${h.kwh(v.lf.finde)} including taxes on Saturdays, Sundays and national holidays, against ${h.kwh(v.lf.laborable)} on weekdays: ${v.dif >= 0 ? `${h.kwh(v.dif)} less` : `${h.kwh(-v.dif)} more`} per kWh. The main reason is regulatory. CNMC Circular 3/2020 puts all 24 hours of those days in the off-peak band, so energy pays neither peak tolls and charges (${h.kwh(v.reg.P1, 4)} per kWh) nor standard ones (${h.kwh(v.reg.P2, 4)}), only off-peak ones (${h.kwh(v.reg.P3, 4)}). On top of that, demand drops and the market is often cheaper. The advantage is not the same at every hour: it is large in the evening and at night, when a weekday would be at peak, and small in the early morning, which is off-peak anyway. The mini calculator compares a given hour on weekdays and weekends using the real profiles of the last 28 days.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Is electricity cheaper on Saturday than on Sunday?', a: `In tolls and charges they are identical: both are full off-peak days. Any difference comes from the market, which mostly depends on that day’s wind, sun and demand. Check the day’s table on the home page: a cloudy, still Saturday can cost more than a windy Tuesday.` },
        { q: 'Do my region’s holidays count as weekends?', a: `No. Only fixed-date national holidays are off-peak all day: 1 and 6 January, 1 May, 15 August, 12 October, 1 November and 6, 8 and 25 December. Regional, local and movable holidays such as Good Friday are billed as weekdays, even if your town takes the day off.` },
        { q: 'How much do I save by doing laundry at the weekend?', a: `It depends on when you would wash during the week. At the average gap of the last eight weeks, ${h.kwh(v.dif)} per kWh, four ${h.num(v.lav, 2)} kWh washes a week for a year come to about ${h.eur(Math.abs(v.dif) * v.lav * 4 * 52, 2)}. In the evening the gain is larger; in the early morning, close to nothing.` },
        { q: 'What if I am on a fixed-price market tariff?', a: `On a single price, weekends cost the same as the rest of the week. On a three-period time-of-use deal, Saturdays and Sundays are billed entirely at the off-peak price, just as on the PVPC, and the advantage is even clearer because it does not depend on the market.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      const P = h.P;
      return `<h2>Why the weekend is off-peak</h2>
<p>${h.src('cnmcCircular3_2020', 'CNMC Circular 3/2020')}, which set the 2.0TD tariff periods in 2021, treats every hour of Saturdays, Sundays and fixed-date national holidays as off-peak. The reason is technical: demand falls on those days and the networks have spare capacity, so there is no case for charging them the toll of the busiest hours. The Ministry’s charges follow the same structure.</p>
<p>On the PVPC this shows up directly in each hour’s price. On a Tuesday at 8 pm, energy carries ${h.kwh(v.reg.P1, 4)} of tolls and charges per kWh; on a Saturday at the same time, ${h.kwh(v.reg.P3, 4)}. Before tax the gap is ${h.kwh(v.reg.P1 - v.reg.P3, 4)}, and with electricity tax and VAT it gets close to ${h.kwh((v.reg.P1 - v.reg.P3) * (1 + P.impuestos.iee_general) * (1 + P.impuestos.iva_general), 4)}, even if the market cost exactly the same on both days.</p>
<h2>What the last few weeks show</h2>
${h.table(['Type of day', 'Average price with taxes', 'Energy period'], [
  ['Weekdays', h.kwh(v.lf.laborable), 'peak, standard and off-peak'],
  ['Saturdays, Sundays and national holidays', h.kwh(v.lf.finde), 'off-peak all 24 hours'],
  ['Difference', h.kwh(v.dif), ''],
], `Red Eléctrica PVPC 2.0TD from ${h.dia(v.lf.desde)} to ${h.dia(v.lf.hasta)}, plain average of every hour.`, ['l', 'r', 'l'])}
<p>That is an average over all hours. Hour by hour the gap varies a lot, and the mini calculator above works it out for the hour you pick with the averages of the last 28 days: the weekday profile shows the morning and evening peaks, while the weekend one is much flatter.</p>
<h2>Which jobs are worth saving for Saturday</h2>
<p>The power-hungry ones that are not urgent: laundry, the tumble dryer, a full dishwasher, batch cooking in the oven, ironing. Car charging too, if you do not need the car sooner. What does not pay is changing early-morning habits: those hours are already off-peak on weekdays and the difference comes down to the market.</p>
<p>To fine-tune, the ${h.a('baratas', 'cheapest hours')} page gives the best slot of every day, weekends included, and the ${h.a('lavadora', 'washing machine')} page prices a wash at each hour. Month-by-month differences are in the ${h.a('historial', 'history')}.</p>
<h2>Bank holidays and 12 October</h2>
<p>A fixed-date national holiday that falls on a weekday is billed like a Sunday: off-peak all day. That is what happened on Monday 12 October 2026. Extra days off added by regions or town halls, by contrast, change nothing on the bill: for the electricity tariff they are working days. Circular 3/2020 only counts 6 January and the non-substitutable fixed-date national holidays in the ${h.src('festivos2026', 'official public-holiday calendar')}: in 2026, 1 November and 6 December fall on a Sunday, and the Mondays 2 November and 7 December that some regions declare are billed as working days. The ${h.a('periodos', 'time-of-use periods')} guide has the full list of holidays that count.</p>
<h2>When the weekend is not cheaper</h2>
<p>The off-peak advantage covers tolls and charges, not the market. A Saturday with little wind and heavy cloud, or with high gas prices across Europe, can carry a market price high enough to cancel it out, especially in the evening. That is why the table for each day is worth a glance before you plan around the weekend: the rule of thumb holds on average, as the eight-week figures above show, but not every single weekend. The ${h.a('home', 'today’s price')} page and the ${h.a('manana', 'tomorrow’s price')} page give the exact answer for the two days ahead.</p>
<p>A second caveat is the appliance itself. Moving a wash from 21:00 on a Wednesday to 21:00 on a Saturday saves the peak toll; moving it from 03:00 on a Wednesday to 03:00 on a Saturday saves almost nothing, because both hours were already off-peak. The mini calculator at the top shows exactly that for any hour you pick.</p>
`;
    },
  },
});
