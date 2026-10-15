import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';

/** Guía: qué es el PVPC, cómo se calcula, quién puede tenerlo y qué cambió en 2024-2026. */
const V = (h: Helpers) => {
  const hoy = h.R.resumenDia(0);
  const reg = h.M.REGULADO_ENERGIA;
  const parteReg = hoy.horas.reduce((s, x) => s + x.regulado, 0) / hoy.horas.length;
  return { hoy, reg, parteReg, media30: h.R.media30() };
};

export default defineGuide({
  id: 'pvpc',
  group: 'guia',
  order: 1,
  mini: 'pvpc',
  related: ['libre', 'periodos', 'peajes', 'impuestos', 'bono'],
  sources: ['ley24', 'rd216', 'mitecoRd446', 'esiosPvpc', 'cnmcCircular3_2020'],
  es: {
    slug: 'que-es-el-pvpc',
    nav: 'Qué es el PVPC',
    card: 'La tarifa regulada de la luz explicada: de qué está hecho el precio y quién puede tenerla.',
    title: 'PVPC 2026: qué es la tarifa regulada y cómo se calcula',
    description: 'Qué es el PVPC, la tarifa regulada de la luz en 2026: quién puede contratarla, cómo se forma el precio de cada hora y qué pesan los futuros en tu factura.',
    h1: 'Qué es el PVPC y cómo se calcula su precio',
    intro: 'La tarifa regulada de la luz no tiene un precio fijo: cambia cada hora según una fórmula que fija el Gobierno.',
    resume: (h) => {
      const v = V(h);
      return `El PVPC, precio voluntario para el pequeño consumidor, es la tarifa de la luz regulada por el Estado para los hogares y pequeñas empresas con hasta 10 kW de potencia. No es un precio fijo sino una fórmula, la del Real Decreto 216/2014, que da un precio distinto para cada hora: suma el coste de la energía, los peajes de la CNMC, los cargos del Ministerio y un margen de comercialización fijado por orden. Desde ${h.P.year} el ${h.num(h.P.futuros_pvpc.peso_2026 * 100, 0)} % de la energía se valora con productos a plazo y el resto con el mercado diario, lo que suaviza los picos. Red Eléctrica publica cada tarde los 24 precios del día siguiente. En los últimos 30 días el término de energía ha salido de media a ${h.kwh(v.media30)} por kWh sin impuestos, y hoy la parte regulada de cada kWh es, en promedio, ${h.kwh(v.parteReg, 4)}. Solo lo venden las comercializadoras de referencia, y es la única tarifa con bono social.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: '¿Quién puede contratar el PVPC?', a: `Cualquier consumidor conectado en baja tensión con una potencia contratada de hasta 10 kW, sea un hogar o una pequeña empresa. Se contrata con una de las comercializadoras de referencia, que están obligadas a ofrecerlo con el mismo precio. No tiene permanencia: puedes entrar y salir cuando quieras.` },
        { q: '¿El PVPC es más barato que el mercado libre?', a: `A veces sí y a veces no. Sigue al mercado mayorista, así que gana en épocas de precios bajos y pierde cuando la energía se encarece. Lo único seguro es que sus precios son públicos y sin letra pequeña. Para tu caso, compara tu factura de los últimos 30 días con el comparador del sitio.` },
        { q: '¿Qué son las comercializadoras de referencia?', a: `Las empresas autorizadas por el Ministerio para ofrecer el PVPC y el bono social. Aplican todas el mismo precio, el que publica Red Eléctrica, así que no hay una más barata que otra en la tarifa regulada. Pueden diferir en la atención al cliente y en los servicios añadidos, que no forman parte del PVPC.` },
        { q: '¿Por qué el PVPC subió o bajó tanto de un día para otro?', a: `Porque una parte de la energía se paga al precio del mercado diario, que depende del viento, el sol, el agua de los embalses y el precio del gas. La parte comprada a plazo cambia poco, y los peajes y cargos son fijos durante el año. Por eso los días de mucho viento el PVPC se desploma.` },
        { q: '¿Puedo tener PVPC y placas solares?', a: `Sí. Con autoconsumo y compensación de excedentes, la comercializadora de referencia descuenta la energía que viertes a la red a un precio que también publica Red Eléctrica cada hora. La compensación no puede superar el coste de la energía consumida en el mes.` },
        { q: `¿Cuánto del precio de hoy es regulado?`, a: `Hoy, de media, ${h.kwh(v.parteReg, 4)} por kWh son peajes y cargos, y el resto es energía y ajustes. La parte regulada cambia con el periodo: ${h.kwh(v.reg.P1, 4)} en punta, ${h.kwh(v.reg.P2, 4)} en llano y ${h.kwh(v.reg.P3, 4)} en valle, siempre sin impuestos. Después se aplican el impuesto eléctrico y el IVA a todo el precio.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      const P = h.P;
      return `<h2>Una fórmula, no un precio</h2>
<p>El artículo 17 de la ${h.src('ley24', 'Ley 24/2013 del Sector Eléctrico')} define el PVPC como el precio máximo que pueden cobrar las comercializadoras de referencia a los consumidores que se acojan a él. El ${h.src('rd216', 'Real Decreto 216/2014')} fija cómo se calcula. La factura tiene dos términos. El de potencia se paga por cada kW contratado y día, y en ${P.year} vale ${h.num(h.M.POT_P1_PVPC, 6)} € por kW y año en punta-llano y ${h.num(h.M.POT_P2_PVPC, 6)} € en valle, antes de impuestos. El de energía se paga por cada kWh consumido, al precio de la hora en que se consume.</p>
<p>Ese precio horario es el que publica Red Eléctrica en ${h.src('esiosPvpc', 'e·sios')}: el término de facturación de energía activa del PVPC 2.0TD. Incluye ya los peajes y cargos del término de energía, por eso no hay que sumarlos aparte; lo que sí hay que añadir son los impuestos, como hace la ${h.a('home', 'tabla del precio de hoy')}.</p>
<h2>De qué está hecho el precio de cada hora</h2>
<p>El archivo oficial desglosa el precio en varias componentes. Las principales son:</p>
<ul>
<li><strong>Energía.</strong> El coste de comprar la electricidad. Desde la reforma del ${h.src('mitecoRd446', 'Real Decreto 446/2023')}, una parte creciente se valora con una cesta de productos a plazo, mensuales, trimestrales y anuales: el ${h.num(P.futuros_pvpc.peso_2024 * 100, 0)} % en 2024, el ${h.num(P.futuros_pvpc.peso_2025 * 100, 0)} % en 2025 y el ${h.num(P.futuros_pvpc.peso_2026 * 100, 0)} % en ${P.year}. El resto sigue el mercado diario.</li>
<li><strong>Servicios de ajuste.</strong> Lo que cuesta a Red Eléctrica mantener el sistema equilibrado en tiempo real, repartido entre todos los consumidores.</li>
<li><strong>Peajes y cargos.</strong> Los peajes pagan las redes de transporte y distribución y los fija la CNMC; los cargos pagan otros costes del sistema y los fija el Ministerio. Su valor depende del periodo de la hora, como explica la guía de ${h.a('peajes', 'peajes y cargos')}.</li>
<li><strong>Otros.</strong> Pagos por capacidad, financiación del operador del mercado y del sistema, y un pequeño coste de comercialización variable.</li>
</ul>
<p>El mini-simulador de arriba separa, para el precio que escribas, la parte regulada del resto. Hoy, de media, la parte regulada son ${h.kwh(v.parteReg, 4)} de cada kWh.</p>
<h2>Por qué ahora hay futuros dentro del PVPC</h2>
<p>Hasta 2023 el PVPC seguía casi por completo al mercado diario, y en 2022, con el precio del gas disparado, la factura de los hogares acogidos se multiplicó. La reforma buscó estabilidad: al meter productos a plazo, una parte del precio se fija con meses de antelación y los sobresaltos del mercado diario pesan menos. La contrapartida es que, cuando el mercado se desploma, el PVPC baja menos de lo que bajaría antes. Las horas siguen teniendo precios distintos, porque la señal del mercado diario se mantiene para cada hora.</p>
<h2>Cuartos de hora y contadores</h2>
<p>Desde el 1 de octubre de 2025 el mercado diario fija un precio cada 15 minutos, pero el PVPC sigue teniendo 24 precios al día, porque los contadores domésticos registran por horas. La página de ${h.a('cuartos', 'precio por cuartos de hora')} muestra las dos series juntas.</p>
<h2>Quién vende el PVPC y cómo se contrata</h2>
<p>Solo las comercializadoras de referencia pueden ofrecerlo, todas con el mismo precio. Basta con llamar o entrar en su web y pedir el PVPC con tu CUPS, el código de tu punto de suministro, que aparece en cualquier factura. No hay permanencia ni penalización por salir, y el cambio no requiere ninguna obra ni cambio de contador. El PVPC es, además, la única tarifa con la que se puede pedir el ${h.a('bono', 'bono social')}.</p>
<h2>PVPC frente a tarifa fija</h2>
<p>La gran diferencia con una tarifa del mercado libre a precio fijo es quién asume el riesgo. Con el PVPC lo asumes tú: si el mercado sube, pagas más. Con un precio fijo lo asume la comercializadora, que lo cobra en el precio. Para saber qué te habría convenido últimamente, el ${h.a('libre', 'comparador PVPC o mercado libre')} calcula las dos facturas de los últimos 30 días con tu consumo.</p>`;
    },
  },
  en: {
    slug: 'what-is-pvpc',
    nav: 'What is the PVPC',
    card: 'Spain’s regulated electricity tariff explained: what the price is made of and who can have it.',
    title: 'PVPC Spain 2026: the Regulated Electricity Tariff Explained',
    description: 'What the PVPC is, Spain’s regulated electricity tariff in 2026: who can sign up, how each hour’s price is built and what forward contracts mean for your bill.',
    h1: 'What the PVPC is and how its price is worked out',
    intro: 'Spain’s regulated electricity tariff has no fixed price: it changes every hour under a formula set by the government.',
    resume: (h) => {
      const v = V(h);
      return `The PVPC (precio voluntario para el pequeño consumidor) is Spain’s state-regulated electricity tariff for homes and small businesses with up to 10 kW of contracted power. It is not a fixed price but a formula, set by Royal Decree 216/2014, that gives a different price for every hour: it adds up the cost of energy, the network tolls set by the CNMC regulator, the government’s system charges and a retail margin fixed by ministerial order. Since ${h.P.year}, ${h.num(h.P.futuros_pvpc.peso_2026 * 100, 0)}% of the energy is priced with forward products and the rest on the day-ahead market, which smooths out the spikes. Red Eléctrica publishes the next day’s 24 prices every evening. Over the last 30 days the energy term averaged ${h.kwh(v.media30)} per kWh before tax, and today the regulated part of each kWh averages ${h.kwh(v.parteReg, 4)}. Only reference retailers sell it, and it is the only tariff that comes with the social discount.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Who can sign up for the PVPC?', a: `Any low-voltage customer with up to 10 kW of contracted power, household or small business. You sign up with one of the reference retailers, which must all offer it at the same price. There is no tie-in: you can join and leave whenever you like, including if you are a foreign resident with a Spanish supply contract.` },
        { q: 'Is the PVPC cheaper than the free market?', a: `Sometimes yes, sometimes no. It follows the wholesale market, so it wins when prices are low and loses when energy gets dearer. What is certain is that its prices are public and have no small print. For your case, compare your last 30 days with the site’s comparison tool.` },
        { q: 'What are reference retailers?', a: `Companies authorised by the Ministry to offer the PVPC and the social discount. They all charge the same price, the one Red Eléctrica publishes, so none is cheaper on the regulated tariff. They can differ in customer service and in add-ons, which are not part of the PVPC.` },
        { q: 'Why did the PVPC jump or drop so much overnight?', a: `Because part of the energy is paid at the day-ahead market price, which depends on wind, sun, reservoir levels and the price of gas. The forward-bought share changes little, and tolls and charges are fixed for the year. That is why the PVPC collapses on very windy days.` },
        { q: 'Can I have the PVPC and solar panels?', a: `Yes. With self-consumption and surplus compensation, the reference retailer credits the energy you export at a price Red Eléctrica also publishes every hour. The credit cannot exceed the cost of the energy you used in the month, so oversized systems gain nothing extra on the bill.` },
        { q: 'How much of today’s price is regulated?', a: `Today, on average, ${h.kwh(v.parteReg, 4)} per kWh is tolls and charges and the rest is energy and adjustments. The regulated part depends on the period: ${h.kwh(v.reg.P1, 4)} at peak, ${h.kwh(v.reg.P2, 4)} at standard times and ${h.kwh(v.reg.P3, 4)} off-peak, always before tax. Electricity tax and VAT then apply to the whole price.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      const P = h.P;
      return `<h2>A formula, not a price</h2>
<p>Article 17 of ${h.src('ley24', 'Act 24/2013 on the Electricity Sector')} defines the PVPC as the maximum price reference retailers may charge consumers who opt for it, and ${h.src('rd216', 'Royal Decree 216/2014')} sets out how it is worked out. The bill has two terms. The power term is paid for each contracted kW per day; in ${P.year} it is ${h.num(h.M.POT_P1_PVPC, 6)} € per kW per year at peak-standard and ${h.num(h.M.POT_P2_PVPC, 6)} € off-peak, before tax. The energy term is paid for each kWh used, at the price of the hour you use it.</p>
<p>That hourly price is the one Red Eléctrica publishes on ${h.src('esiosPvpc', 'e·sios')}: the PVPC 2.0TD active energy billing term. It already includes the tolls and charges of the energy term, so you do not add them separately; what you do add is tax, as the ${h.a('home', 'today’s price table')} does.</p>
<h2>What each hour’s price is made of</h2>
<p>The official file breaks the price into several components. The main ones are:</p>
<ul>
<li><strong>Energy.</strong> The cost of buying the electricity. Since the ${h.src('mitecoRd446', 'Royal Decree 446/2023')} reform, a growing share is priced with a basket of monthly, quarterly and yearly forward products: ${h.num(P.futuros_pvpc.peso_2024 * 100, 0)}% in 2024, ${h.num(P.futuros_pvpc.peso_2025 * 100, 0)}% in 2025 and ${h.num(P.futuros_pvpc.peso_2026 * 100, 0)}% in ${P.year}. The rest follows the day-ahead market.</li>
<li><strong>Balancing services.</strong> What it costs Red Eléctrica to keep the system balanced in real time, shared among all consumers.</li>
<li><strong>Tolls and charges.</strong> Tolls pay for the transmission and distribution networks and are set by the CNMC; charges pay other system costs and are set by the Ministry. Their value depends on each hour’s period, as the ${h.a('peajes', 'tolls and charges')} guide explains.</li>
<li><strong>Other items.</strong> Capacity payments, funding for the market and system operators, and a small variable retail cost.</li>
</ul>
<p>The mini calculator above separates, for whatever price you enter, the regulated part from the rest. Today the regulated part averages ${h.kwh(v.parteReg, 4)} of each kWh.</p>
<h2>Why forward contracts are now inside the PVPC</h2>
<p>Until 2023 the PVPC followed the day-ahead market almost entirely, and in 2022, with gas prices soaring, bills for households on it multiplied. The reform aimed for stability: with forward products in the mix, part of the price is locked in months ahead and day-ahead shocks weigh less. The flip side is that when the market collapses, the PVPC falls less than it used to. Hours still have different prices, because the day-ahead signal is kept for each hour.</p>
<h2>Quarter hours and meters</h2>
<p>Since 1 October 2025 the day-ahead market sets a price every 15 minutes, but the PVPC still has 24 prices a day because household meters record by the hour. The ${h.a('cuartos', 'quarter-hour price page')} shows both series side by side.</p>
<h2>Who sells the PVPC and how to sign up</h2>
<p>Only reference retailers can offer it, all at the same price. Call them or go to their website and ask for the PVPC with your CUPS, the supply-point code printed on every bill. There is no tie-in and no exit fee, and switching needs no works and no new meter. The PVPC is also the only tariff on which you can apply for the ${h.a('bono', 'social discount')}.</p>
<h2>PVPC versus a fixed price</h2>
<p>The big difference from a fixed-price market tariff is who carries the risk. On the PVPC you do: if the market rises, you pay more. On a fixed price the retailer does, and charges for it in the price. To see what would have suited you lately, the ${h.a('libre', 'PVPC versus fixed price comparison')} works out both bills for the last 30 days with your own use.</p>`;
    },
  },
});
