import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';

/** Guía: peajes (CNMC) y cargos (Ministerio) de la tarifa 2.0TD en 2026. */
const V = (h: Helpers) => {
  const P = h.P;
  const hoy = h.R.resumenDia(0);
  const parteReg = hoy.horas.reduce((s, x) => s + x.regulado, 0) / hoy.horas.length;
  const partePct = parteReg / hoy.mediaSin;
  const potKw = P.peajes.potencia_eur_kw_ano.P1 + P.cargos.potencia_eur_kw_ano.P1 + P.peajes.potencia_eur_kw_ano.P2 + P.cargos.potencia_eur_kw_ano.P2;
  return { P, hoy, parteReg, partePct, potKw, reg: h.M.REGULADO_ENERGIA };
};

export default defineGuide({
  id: 'peajes',
  group: 'guia',
  order: 3,
  mini: 'peajes',
  miniHref: 'factura',
  related: ['periodos', 'pvpc', 'impuestos', 'potencia', 'factura'],
  sources: ['cnmcPeajes2026', 'tedCargos2026', 'mitecoPeajes', 'cnmcCircular3_2020', 'rd216'],
  es: {
    slug: 'peajes-y-cargos',
    nav: 'Peajes y cargos',
    card: 'La parte regulada de la factura: qué pagan los peajes y los cargos y cuánto valen en 2026.',
    title: 'Peajes y cargos 2026: la parte regulada de la factura de luz',
    description: 'Peajes y cargos de la luz en 2026: valores de la CNMC y del Ministerio para la tarifa 2.0TD, en potencia y energía, qué financian y cuánto pesan cada mes.',
    h1: 'Peajes y cargos de la luz en 2026',
    intro: 'Una parte de lo que pagas no depende del mercado: la fijan la CNMC y el Ministerio cada año en el BOE.',
    resume: (h) => {
      const v = V(h);
      return `Los peajes de transporte y distribución pagan las redes eléctricas y los fija la CNMC; los cargos pagan otros costes del sistema, como las renovables con retribución regulada, la deuda de años anteriores y el sobrecoste de las islas, y los fija el Ministerio. Para ${v.P.year}, la Resolución de la CNMC de 18 de diciembre de 2025 y la Orden TED/1524/2025 dejan el peaje de potencia de punta-llano en ${h.num(v.P.peajes.potencia_eur_kw_ano.P1, 6)} € por kW y año y el cargo en ${h.num(v.P.cargos.potencia_eur_kw_ano.P1, 6)} €. En la energía, peajes y cargos suman ${h.kwh(v.reg.P1, 4)} por kWh en punta, ${h.kwh(v.reg.P2, 4)} en llano y ${h.kwh(v.reg.P3, 4)} en valle, sin impuestos. Hoy esa parte regulada supone ${h.num(v.partePct * 100, 0)} % del término de energía del PVPC de media. Son iguales para todas las comercializadoras: el PVPC y el mercado libre pagan los mismos peajes y cargos.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: '¿Qué diferencia hay entre peajes y cargos?', a: `Los peajes pagan las redes de transporte y distribución y los fija la CNMC con su propia metodología, la Circular 3/2020. Los cargos pagan otros costes regulados del sistema, como las primas a renovables y la deuda eléctrica, y los fija el Ministerio por orden. En la factura aparecen juntos.` },
        { q: '¿Los pago también en el mercado libre?', a: `Sí. Peajes y cargos son los mismos para cualquier comercializadora, porque los cobra la distribuidora. En el PVPC van dentro de cada término; en el mercado libre la oferta suele integrarlos en sus precios de potencia y energía. Si una oferta parece muy barata, puede que los separe en otra línea.` },
        { q: '¿Cuánto pago al año de peajes y cargos de potencia?', a: `Con 4,6 kW en punta-llano y en valle, ${h.eur(4.6 * v.potKw, 2)} al año antes de impuestos, sin contar el margen de comercialización del PVPC. Bajar a 3,45 kW lo deja en ${h.eur(3.45 * v.potKw, 2)}. La página de potencia contratada lo calcula con impuesto eléctrico e IVA y para tu potencia real.` },
        { q: '¿Qué financian exactamente los cargos?', a: `Según la Orden TED/1524/2025, en ${v.P.year} se destinan en un ${h.num(v.P.cargos.destino.recore * 100, 2)} % al régimen retributivo de las renovables, la cogeneración y los residuos, en un ${h.num(v.P.cargos.destino.deficit * 100, 2)} % a la deuda del sistema, en un ${h.num(v.P.cargos.destino.tnp * 100, 2)} % al sobrecoste de los territorios no peninsulares y el resto a otros conceptos.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      const P = v.P;
      return `<h2>Los valores de ${P.year}</h2>
${h.table(['Concepto', 'P1', 'P2', 'P3'], [
  ['Peaje de potencia (€/kW·año)', h.num(P.peajes.potencia_eur_kw_ano.P1, 6), h.num(P.peajes.potencia_eur_kw_ano.P2, 6), ''],
  ['Cargo de potencia (€/kW·año)', h.num(P.cargos.potencia_eur_kw_ano.P1, 6), h.num(P.cargos.potencia_eur_kw_ano.P2, 6), ''],
  ['Peaje de energía (€/kWh)', h.num(P.peajes.energia_eur_kwh.P1, 6), h.num(P.peajes.energia_eur_kwh.P2, 6), h.num(P.peajes.energia_eur_kwh.P3, 6)],
  ['Cargo de energía (€/kWh)', h.num(P.cargos.energia_eur_kwh.P1, 6), h.num(P.cargos.energia_eur_kwh.P2, 6), h.num(P.cargos.energia_eur_kwh.P3, 6)],
], `Tarifa 2.0TD. ${h.src('cnmcPeajes2026', 'Resolución de la CNMC de 18 de diciembre de 2025')} y ${h.src('tedCargos2026', 'Orden TED/1524/2025')}. En potencia, P1 es punta-llano y P2 valle; en energía, P1 punta, P2 llano y P3 valle.`, ['l', 'r', 'r', 'r'])}
<p>Las cifras llevan seis decimales porque así se publican; el BOE es la referencia, y el ${h.src('mitecoPeajes', 'Ministerio')} las resume en su página de peajes y cargos. Los peajes los calcula la CNMC con la ${h.src('cnmcCircular3_2020', 'Circular 3/2020')}, que reparte el coste de las redes entre los consumidores según su tensión y su perfil; los cargos los calcula el Ministerio con la metodología del Real Decreto 148/2021.</p>
<h2>Cómo aparecen en la factura del PVPC</h2>
<p>En el PVPC no hay una línea llamada «peajes»: van integrados. El término de potencia de la factura es peaje más cargo más margen de comercialización; el término de energía de cada hora, el que publica Red Eléctrica, ya lleva dentro el peaje y el cargo de su periodo. Este sitio lo comprueba hora a hora con el archivo oficial, que separa esa parte en una columna propia.</p>
<p>Hoy la parte regulada media del término de energía es ${h.kwh(v.parteReg, 4)} por kWh, sobre un término medio de ${h.kwh(v.hoy.mediaSin, 4)}. Cuando el mercado está barato, la parte regulada pesa más en porcentaje; cuando está caro, menos.</p>
<h2>Por qué cambian cada año</h2>
<p>Los peajes se revisan con la retribución que la CNMC reconoce a las redes y con la previsión de demanda; los cargos, con lo que el sistema tiene que pagar ese año. Si la demanda prevista sube, los mismos costes se reparten entre más kWh y bajan por unidad. Para ${P.year} el Ministerio aprobó los cargos con la Orden TED/1524/2025, publicada el 27 de diciembre de 2025, y los dos se aplican desde el 1 de enero.</p>
<h2>Qué puedes hacer tú</h2>
<p>Los peajes y cargos no se negocian, pero sí se puede reducir lo que pagas por ellos. En potencia, ajustando los kW contratados, como explica la página de ${h.a('potencia', 'potencia contratada')}. En energía, llevando el consumo al valle, donde peaje y cargo suman casi nada; los detalles de las franjas están en la guía de ${h.a('periodos', 'periodos horarios')}. Y para ver su peso en tu caso, el ${h.a('factura', 'simulador de factura')} los incluye línea a línea.</p>
<h2>Quién cobra los peajes y cargos</h2>
<p>Los cobra la distribuidora de tu zona, la dueña de los cables de tu calle, aunque nunca le pagues directamente: tu comercializadora le traslada el dinero. Por eso cambiar de comercializadora no los cambia, y una oferta barata solo puede serlo en la energía y en el margen propio de la empresa. La distribuidora también lee tu contador y envía las lecturas horarias a la comercializadora, que así factura cada hora en su periodo. Si falta una lectura, la distribuidora la estima y la corrige después, y la corrección aparece en una factura posterior.</p>
`;
    },
  },
  en: {
    slug: 'network-tolls-and-charges',
    nav: 'Tolls and charges',
    card: 'The regulated part of the bill: what tolls and charges pay for and what they are worth in 2026.',
    title: 'Network Tolls and Charges Spain 2026: Regulated Bill Costs',
    description: 'Spain’s electricity tolls (peajes) and charges (cargos) in 2026: CNMC and Ministry values for the 2.0TD tariff, what they fund and what they add each month.',
    h1: 'Electricity tolls and charges in Spain in 2026',
    intro: 'Part of what you pay has nothing to do with the market: the CNMC and the Ministry set it every year in the BOE.',
    resume: (h) => {
      const v = V(h);
      return `Transmission and distribution tolls (peajes) pay for the power networks and are set by the CNMC, Spain’s energy regulator. Charges (cargos) pay other system costs, such as renewables with regulated returns, past tariff debt and the extra cost of island grids, and are set by the Ministry. For ${v.P.year}, the CNMC Resolution of 18 December 2025 and Order TED/1524/2025 put the peak-standard power toll at ${h.num(v.P.peajes.potencia_eur_kw_ano.P1, 6)} € per kW per year and the charge at ${h.num(v.P.cargos.potencia_eur_kw_ano.P1, 6)} €. On energy, tolls and charges together come to ${h.kwh(v.reg.P1, 4)} per kWh at peak, ${h.kwh(v.reg.P2, 4)} at standard times and ${h.kwh(v.reg.P3, 4)} off-peak, before tax. Today that regulated share is ${h.num(v.partePct * 100, 0)}% of the PVPC energy term on average. They are the same with every retailer: the PVPC and market tariffs pay identical tolls and charges.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'What is the difference between tolls and charges?', a: `Tolls pay for the transmission and distribution networks and are set by the CNMC under its own method, Circular 3/2020. Charges pay other regulated system costs, such as renewable subsidies and the electricity debt, and are set by the Ministry by order. On the bill they appear together.` },
        { q: 'Do I pay them on a market tariff too?', a: `Yes. Tolls and charges are the same whatever the retailer, because the distributor collects them. On the PVPC they sit inside each term; market offers usually fold them into their power and energy prices. If an offer looks unusually cheap, it may be listing them on a separate line.` },
        { q: 'How much do I pay a year in power tolls and charges?', a: `With 4.6 kW in both peak-standard and off-peak, ${h.eur(4.6 * v.potKw, 2)} a year before tax, not counting the PVPC retail margin. Dropping to 3.45 kW brings it to ${h.eur(3.45 * v.potKw, 2)}. The contracted power page works it out with electricity tax and VAT, and for the power you actually have.` },
        { q: 'What exactly do the charges fund?', a: `Under Order TED/1524/2025, in ${v.P.year} ${h.num(v.P.cargos.destino.recore * 100, 2)}% goes to the regulated returns of renewables, cogeneration and waste plants, ${h.num(v.P.cargos.destino.deficit * 100, 2)}% to system debt, ${h.num(v.P.cargos.destino.tnp * 100, 2)}% to the extra cost of the non-mainland territories and the rest to other items. Retailers must print these shares on every bill.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      const P = v.P;
      return `<h2>The ${P.year} values</h2>
${h.table(['Item', 'P1', 'P2', 'P3'], [
  ['Power toll (€/kW·year)', h.num(P.peajes.potencia_eur_kw_ano.P1, 6), h.num(P.peajes.potencia_eur_kw_ano.P2, 6), ''],
  ['Power charge (€/kW·year)', h.num(P.cargos.potencia_eur_kw_ano.P1, 6), h.num(P.cargos.potencia_eur_kw_ano.P2, 6), ''],
  ['Energy toll (€/kWh)', h.num(P.peajes.energia_eur_kwh.P1, 6), h.num(P.peajes.energia_eur_kwh.P2, 6), h.num(P.peajes.energia_eur_kwh.P3, 6)],
  ['Energy charge (€/kWh)', h.num(P.cargos.energia_eur_kwh.P1, 6), h.num(P.cargos.energia_eur_kwh.P2, 6), h.num(P.cargos.energia_eur_kwh.P3, 6)],
], `2.0TD tariff. ${h.src('cnmcPeajes2026', 'CNMC Resolution of 18 December 2025')} and ${h.src('tedCargos2026', 'Order TED/1524/2025')}. For power, P1 is peak-standard and P2 off-peak; for energy, P1 peak, P2 standard and P3 off-peak.`, ['l', 'r', 'r', 'r'])}
<p>The figures have six decimals because that is how they are published; the BOE is the reference, and the ${h.src('mitecoPeajes', 'Ministry')} summarises them on its tolls and charges page. The CNMC works out tolls with ${h.src('cnmcCircular3_2020', 'Circular 3/2020')}, which shares network costs among consumers by voltage and profile; the Ministry works out charges under the Royal Decree 148/2021 method.</p>
<h2>How they show up on a PVPC bill</h2>
<p>A PVPC bill has no line called “tolls”: they are built in. The bill’s power term is toll plus charge plus retail margin; each hour’s energy term, the one Red Eléctrica publishes, already contains its period’s toll and charge. This site checks that hour by hour against the official file, which lists that share in a column of its own.</p>
<p>Today the average regulated share of the energy term is ${h.kwh(v.parteReg, 4)} per kWh, out of an average term of ${h.kwh(v.hoy.mediaSin, 4)}. When the market is cheap the regulated share weighs more in percentage terms; when it is dear, less.</p>
<h2>Why they change every year</h2>
<p>Tolls are revised with the revenue the CNMC allows the networks and with forecast demand; charges with what the system has to pay that year. If forecast demand rises, the same costs are spread over more kWh and fall per unit. For ${P.year} the Ministry approved charges in Order TED/1524/2025, published on 27 December 2025, and both apply from 1 January.</p>
<h2>What you can do about them</h2>
<p>Tolls and charges are not negotiable, but you can cut what you pay for them. On power, by adjusting the kW you contract, as the ${h.a('potencia', 'contracted power')} page explains. On energy, by shifting use to off-peak, where toll and charge come to almost nothing; the bands are detailed in the ${h.a('periodos', 'time-of-use periods')} guide. And to see their weight in your own case, the ${h.a('factura', 'bill calculator')} lists them line by line.</p>
<h2>Tolls and charges on the meter-reading side</h2>
<p>Tolls and charges are collected by your distribution company, the one that owns the cables in your street, even though you never pay it directly: your retailer passes the money on. That is why switching retailer never changes them, and why a cheap offer can only be cheap on the energy and on the retailer’s own margin. The distributor also reads your meter and sends the hourly readings to the retailer, which is how each hour ends up billed at its own period. If a reading is missing, the distributor estimates it and corrects it later, and the correction shows on a following bill.</p>
<p>For people coming from other European countries, two things often surprise. The first is how large the power component is: Spain bills contracted kW every day, which rewards keeping power low. The second is that tolls depend on the hour rather than on the season: the same peak toll applies in August and in January. If you are used to a single network charge per kWh, the ${h.a('periodos', 'time-of-use periods')} guide shows how the three bands work in practice.</p>
`;
    },
  },
});
