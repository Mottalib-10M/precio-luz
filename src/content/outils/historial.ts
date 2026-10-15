import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';

/** Precio de la luz por meses: media mensual del PVPC con y sin impuestos, desde los archivos diarios. */
const nombreMes = (h: Helpers, m: string) => new Date(`${m}-15T12:00:00Z`).toLocaleDateString(h.lang === 'es' ? 'es-ES' : 'en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const V = (h: Helpers) => {
  const M = h.R.MESES.filter((m) => m.dias >= 20);
  const caro = M.reduce((a, b) => (b.ttc > a.ttc ? b : a));
  const barato = M.reduce((a, b) => (b.ttc < a.ttc ? b : a));
  const ultimo = h.R.MESES[h.R.MESES.length - 1];
  return { M, caro, barato, ultimo, todos: h.R.MESES };
};

export default defineGuide({
  id: 'historial',
  group: 'precio',
  order: 4,
  tool: 'historial',
  related: ['impuestos', 'pvpc', 'libre', 'finde'],
  sources: ['esiosPvpc', 'rdl7_2026', 'rdl18_2026', 'ley38Iee'],
  es: {
    slug: 'precio-luz-por-meses',
    nav: 'Precio de la luz por meses',
    card: 'La media del PVPC de cada mes, con y sin impuestos, y la comparación con el año anterior.',
    title: 'Precio luz por meses 2026: media PVPC mensual con impuestos',
    description: 'Precio medio de la luz mes a mes en 2026: el PVPC de cada mes con y sin impuestos, la hora más barata y la más cara, frente al mismo mes del año anterior.',
    h1: 'Precio de la luz por meses: la media del PVPC',
    intro: 'Cada mes, la media de todas sus horas con los impuestos de cada día, a partir de los archivos diarios de Red Eléctrica.',
    resume: (h) => {
      const v = V(h);
      return `De los meses completos que recoge esta página, el más caro fue ${nombreMes(h, v.caro.mes)}, con ${h.kwh(v.caro.ttc)} de media con impuestos, y el más barato ${nombreMes(h, v.barato.mes)}, con ${h.kwh(v.barato.ttc)}. El mes en curso, ${nombreMes(h, v.ultimo.mes)}, lleva ${v.ultimo.dias} días publicados y una media de ${h.kwh(v.ultimo.ttc)}. Son medias simples de todas las horas del mes, no medias ponderadas por consumo: describen el precio, no una factura concreta, que depende de a qué horas consumes. Cada día lleva sus propios impuestos, así que los meses de abril y mayo de 2026, con el IVA al 10 % y el impuesto eléctrico al 0,5 % del Real Decreto-ley 7/2026, salen más baratos con impuestos de lo que dirían los precios sin impuestos. La opción «Excluidos» quita los impuestos para comparar solo el precio de Red Eléctrica.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: '¿Por qué la media de un mes no coincide con lo que pagué?', a: `Porque tu factura pondera cada hora por lo que consumiste en ella y suma la potencia, el contador y los impuestos sobre todo. La media de esta página da el mismo peso a las tres de la madrugada que a las nueve de la noche. Para tu caso, usa el simulador de factura con tus kWh.` },
        { q: '¿Desde cuándo hay datos?', a: `La página guarda los últimos ${h.num(h.R.ESTADO.diasHistorico)} días publicados por Red Eléctrica, desde ${nombreMes(h, v.todos[0].mes)}. Cada noche se añade el día nuevo y se descarta el más antiguo, para que la comparación con el mismo mes del año anterior esté siempre disponible.` },
        { q: '¿Los meses con rebaja de impuestos se comparan bien?', a: `Con impuestos, cada mes refleja lo que se pagó de verdad, rebaja incluida. Si quieres comparar solo la evolución del precio de la electricidad, sin el efecto de los cambios fiscales, elige «Excluidos»: verás el término de energía tal como lo publica Red Eléctrica.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Todos los meses, en una tabla</h2>
${h.table(['Mes', 'Días', 'Sin impuestos', 'Con impuestos', 'Hora más barata', 'Hora más cara'], v.todos.map((m) => [nombreMes(h, m.mes), m.dias, h.num(m.sin, 4), h.num(m.ttc, 4), h.num(m.min, 4), h.num(m.max, 4)]), 'PVPC 2.0TD, Península, €/kWh. Media simple de todas las horas de cada mes; impuestos vigentes cada día.', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>El primer y el último mes de la tabla pueden estar incompletos: el primero empieza donde empieza el archivo que conservamos y el último es el mes en curso. Entre el mes completo más barato y el más caro de la tabla hay ${h.num((v.caro.ttc / v.barato.ttc - 1) * 100, 0)} % de diferencia: el mes en que consumes importa tanto como la hora.</p>`;
    },
  },
  en: {
    slug: 'electricity-price-by-month',
    nav: 'Electricity price by month',
    card: 'Each month’s average PVPC price, with and without taxes, against the year before.',
    title: 'Electricity Price by Month Spain 2026: Monthly PVPC Average',
    description: 'Spain’s average electricity price month by month in 2026: each month’s PVPC with and without taxes, its cheapest and dearest hour, and a year earlier.',
    h1: 'Electricity price in Spain by month: the PVPC average',
    intro: 'For each month, the average of all its hours with each day’s taxes, worked out from Red Eléctrica’s daily files.',
    resume: (h) => {
      const v = V(h);
      return `Of the complete months on this page, the most expensive was ${nombreMes(h, v.caro.mes)}, averaging ${h.kwh(v.caro.ttc)} including taxes, and the cheapest ${nombreMes(h, v.barato.mes)}, at ${h.kwh(v.barato.ttc)}. The current month, ${nombreMes(h, v.ultimo.mes)}, has ${v.ultimo.dias} days published so far and averages ${h.kwh(v.ultimo.ttc)}. These are plain averages of every hour in the month, not weighted by consumption: they describe the price, not any particular bill, which depends on when you use power. Each day carries its own taxes, so April and May 2026, with VAT at 10% and electricity tax at 0.5% under Royal Decree-law 7/2026, look cheaper with tax than the pre-tax prices alone would suggest. The “Excluded” option strips taxes out so you can compare Red Eléctrica’s price on its own, and the chart shows every month side by side.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Why does a month’s average not match what I paid?', a: `Because your bill weights each hour by what you used in it and adds power, meter rental and taxes on top. The average here gives 3 am the same weight as 9 pm. For your own case, use the bill calculator with your kWh.` },
        { q: 'How far back does the data go?', a: `The page keeps the last ${h.num(h.R.ESTADO.diasHistorico)} days published by Red Eléctrica, from ${nombreMes(h, v.todos[0].mes)}. Each night the new day is added and the oldest dropped, so the comparison with the same month a year earlier is always available. The download script keeps the file in the site’s repository, so the history never depends on a third-party website.` },
        { q: 'Do months with tax cuts compare fairly?', a: `With taxes, each month shows what was actually paid, cut included. To compare only how the electricity price moved, without the effect of tax changes, choose “Excluded”: you get the energy term exactly as Red Eléctrica publishes it, before electricity tax and VAT are added.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Every month in one table</h2>
${h.table(['Month', 'Days', 'Before tax', 'With tax', 'Cheapest hour', 'Dearest hour'], v.todos.map((m) => [nombreMes(h, m.mes), m.dias, h.num(m.sin, 4), h.num(m.ttc, 4), h.num(m.min, 4), h.num(m.max, 4)]), 'PVPC 2.0TD, mainland, €/kWh. Plain average of every hour in the month; each day’s taxes applied.', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The first and last months in the table may be incomplete: the first starts where our stored file begins and the last is the month in progress. Between the cheapest and the dearest complete month in the table there is a ${h.num((v.caro.ttc / v.barato.ttc - 1) * 100, 0)}% gap: the month you use power in matters as much as the hour.</p>`;
    },
  },
});
