import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';

/** Precio por cuartos de hora: los 96 precios del mercado diario frente al PVPC horario. */
const V = (h: Helpers) => {
  const hoy = h.R.ESTADO.hoy;
  const q = h.M.CUARTOS[hoy] ?? [];
  const media = q.reduce((s, x) => s + x, 0) / Math.max(1, q.length);
  let salto = 0, horaSalto = 0;
  for (let i = 0; i * 4 < q.length; i++) { const s = q.slice(i * 4, i * 4 + 4); const d = Math.max(...s) - Math.min(...s); if (d > salto) { salto = d; horaSalto = i; } }
  const pv = h.M.HISTORICO[hoy]?.p ?? [];
  const mediaPv = pv.reduce((s, x) => s + x, 0) / Math.max(1, pv.length);
  return { hoy, q, media, salto, horaSalto, mediaPv };
};

export default defineGuide({
  id: 'cuartos',
  group: 'precio',
  order: 3,
  tool: 'cuartos',
  related: ['manana', 'pvpc', 'baratas', 'libre'],
  sources: ['reeMercado', 'esiosPvpc', 'rd216', 'mitecoRd446'],
  es: {
    slug: 'precio-luz-cuartos-de-hora',
    nav: 'Precio por cuartos de hora',
    card: 'Los 96 precios del mercado de hoy cada 15 minutos, junto al PVPC horario que se factura.',
    title: 'Precio luz cuartos de hora 2026: mercado cada 15 minutos',
    description: 'Precio de la luz por cuartos de hora en 2026: los 96 precios del mercado diario de hoy y mañana, junto al PVPC horario de los hogares. Datos de Red Eléctrica.',
    h1: 'Precio de la luz por cuartos de hora',
    intro: 'El mercado mayorista pone un precio cada 15 minutos desde octubre de 2025. La factura PVPC sigue siendo por horas: aquí ves las dos cosas.',
    resume: (h) => {
      const v = V(h);
      return `Hoy, ${h.dia(v.hoy)}, el mercado diario español ha fijado ${v.q.length} precios, uno por cuarto de hora, con una media de ${h.num(v.media, 2)} €/MWh, es decir ${h.num(v.media / 1000, 4)} € por kWh antes de peajes, cargos, margen e impuestos. Dentro de una misma hora el precio puede moverse mucho: hoy el mayor salto se da entre las ${String(v.horaSalto).padStart(2, '0')}:00 y las ${String(v.horaSalto + 1).padStart(2, '0')}:00, con ${h.num(v.salto, 2)} €/MWh de diferencia entre el cuarto más caro y el más barato. Ese detalle no llega a la factura de quien tiene PVPC, porque Red Eléctrica sigue publicando 24 precios horarios y los contadores de los hogares miden por horas; sí cuenta para algunas tarifas indexadas del mercado libre y para entender por qué el precio de una hora es el que es. La línea roja del gráfico es el PVPC de cada hora.`;
    },
    faqs: (h) => [
      { q: '¿Me cobran la luz por cuartos de hora si tengo PVPC?', a: `No. El término de energía del PVPC tiene 24 precios al día, los del archivo oficial de Red Eléctrica, y tu contador registra el consumo de cada hora. El paso del mercado a cuartos de hora, el 1 de octubre de 2025, cambió cómo se forma el precio mayorista, no cómo se factura a los hogares.` },
      { q: '¿Por qué el precio del mercado es mucho más bajo que el PVPC?', a: `Porque es solo la energía en el mercado diario, en €/MWh. El PVPC suma además los productos a plazo (el ${h.num(h.P.futuros_pvpc.peso_2026 * 100, 0)} % de la energía en ${h.P.year}), los servicios de ajuste, los peajes y cargos del periodo y, en la factura, los impuestos. En valle la diferencia es menor porque los peajes y cargos casi no pesan.` },
      { q: '¿Un precio negativo del mercado me sale gratis?', a: `No. Aunque el mercado marque cero o menos en algunos cuartos con mucho sol, el PVPC de esa hora sigue llevando peajes, cargos, ajustes y la parte comprada a plazo, y después los impuestos. Por eso en la tabla del PVPC no verás nunca un precio de cero.` },
    ],
    body: (h) => {
      const v = V(h);
      return `<h2>Del cuarto de hora a la hora</h2>
<p>El mercado diario europeo, en el que se compra la energía del día siguiente, trabaja desde octubre de 2025 con periodos de 15 minutos. Para el PVPC, Red Eléctrica traslada ese resultado a cada hora y le añade el resto de componentes que fija el ${h.src('rd216', 'Real Decreto 216/2014')}. Hoy la media del mercado es de ${h.num(v.media, 2)} €/MWh y la media del término de energía del PVPC, todavía sin impuestos, de ${h.num(v.mediaPv, 2)} €/MWh: la distancia entre las dos cifras son los productos a plazo, los ajustes y la parte regulada.</p>
<h2>A quién le sirve esta página</h2>
<p>A quien tiene una tarifa indexada del mercado libre que repercute el precio horario o cuartohorario, y a quien quiere entender por qué el PVPC de una hora sube o baja. Si tienes PVPC, la página útil es la del ${h.a('home', 'precio de la luz de hoy')}, con los 24 precios que pagas, y si dudas entre quedarte o pasar a un precio fijo, el ${h.a('libre', 'comparador PVPC o mercado libre')} hace la cuenta con impuestos.</p>`;
    },
  },
  en: {
    slug: 'quarter-hour-electricity-price',
    nav: 'Quarter-hour price',
    card: 'Today’s 96 market prices every 15 minutes, next to the hourly PVPC households pay.',
    title: 'Quarter-Hour Electricity Price Spain 2026: 15-Minute Market',
    description: 'Spain’s electricity price by quarter hour in 2026: today’s and tomorrow’s 96 market prices next to the hourly PVPC households are billed. Red Eléctrica data.',
    h1: 'Electricity price in Spain by quarter hour',
    intro: 'The wholesale market has set a price every 15 minutes since October 2025. The PVPC bill is still hourly: this page shows both.',
    resume: (h) => {
      const v = V(h);
      return `Today, ${h.dia(v.hoy)}, Spain’s day-ahead market set ${v.q.length} prices, one per quarter hour, averaging ${h.num(v.media, 2)} €/MWh, or ${h.num(v.media / 1000, 4)} € per kWh before tolls, charges, retail margin and taxes. Within a single hour the price can move a lot: today the widest swing is between ${String(v.horaSalto).padStart(2, '0')}:00 and ${String(v.horaSalto + 1).padStart(2, '0')}:00, with ${h.num(v.salto, 2)} €/MWh between the dearest and cheapest quarter. None of that reaches PVPC customers’ bills, because Red Eléctrica still publishes 24 hourly prices and household meters record by the hour. It does matter for some indexed market deals, and it helps explain why an hour’s price is what it is. The red line on the chart is each hour’s PVPC, before tax, so you can see at a glance how far the regulated tariff sits above the raw wholesale price at each moment of the day.`;
    },
    faqs: (h) => [
      { q: 'Am I billed by the quarter hour on the PVPC?', a: `No. The PVPC energy term has 24 prices a day, those in Red Eléctrica’s official file, and your meter records each hour’s use. The market’s switch to quarter hours on 1 October 2025 changed how the wholesale price is formed, not how households are billed.` },
      { q: 'Why is the market price so much lower than the PVPC?', a: `Because it is only the energy traded on the day-ahead market, in €/MWh. The PVPC also includes forward products (${h.num(h.P.futuros_pvpc.peso_2026 * 100, 0)}% of energy in ${h.P.year}), grid balancing, each period’s tolls and charges and, on the bill, taxes. Off-peak the gap narrows because tolls and charges weigh very little.` },
      { q: 'If the market goes negative, is my electricity free?', a: `No. Even when the market hits zero or below in some sunny quarters, that hour’s PVPC still carries tolls, charges, balancing costs and the forward-bought share, and then tax. That is why you will never see a zero in the PVPC table.` },
    ],
    body: (h) => {
      const v = V(h);
      return `<h2>From quarter hour to hour</h2>
<p>The European day-ahead market, where next-day energy is bought, has worked in 15-minute periods since October 2025. For the PVPC, Red Eléctrica carries that result over to each hour and adds the other components set by ${h.src('rd216', 'Royal Decree 216/2014')}. Today the market averages ${h.num(v.media, 2)} €/MWh and the PVPC energy term, still before tax, ${h.num(v.mediaPv, 2)} €/MWh: the gap is forward products, balancing and the regulated part.</p>
<h2>Who this page is for</h2>
<p>People on indexed market tariffs that pass through the hourly or quarter-hour price, and anyone who wants to understand why an hour’s PVPC goes up or down. If you are on the PVPC, the useful page is ${h.a('home', 'today’s electricity price')}, with the 24 prices you pay; and if you are weighing a switch to a fixed price, the ${h.a('libre', 'PVPC versus fixed price comparison')} does the sums with tax.</p>`;
    },
  },
});
