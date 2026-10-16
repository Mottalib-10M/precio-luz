import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { energiaPeriodo } from '../../components/calc/FacturaCalc';
import { bundle } from '../../lib/bundle';

/** PVPC o mercado libre: la misma factura con el PVPC real y con un precio fijo, impuestos en los dos lados. */
const V = (h: Helpers) => {
  const b = bundle();
  const hasta = b.hoy;
  const d = new Date(`${hasta}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - 29);
  const desde = d.toISOString().slice(0, 10);
  const e = energiaPeriodo(b, desde, hasta, 270);
  const pvpc = h.M.factura({ dias: e.dias, kwP1: 4.6, kwP2: 4.6, kwh: 270, energia: e.energia, fecha: hasta });
  // Precio fijo que iguala la factura PVPC con la misma potencia regulada: el umbral de la decisión.
  const potDia = (h.M.POT_P1_PVPC + h.M.POT_P2_PVPC) / 365;
  const empate = e.energia / 270;
  const imp = h.M.impuestosDelDia(hasta);
  return { e, pvpc, potDia, empate, empateTtc: h.M.libreConImpuestos(empate, imp), desde, hasta };
};

export default defineGuide({
  id: 'libre',
  group: 'factura',
  order: 2,
  tool: 'factura',
  toolProps: { mode: 'comparar' },
  related: ['factura', 'pvpc', 'bono', 'historial', 'potencia'],
  sources: ['esiosPvpc', 'ley24', 'cnmcComparador', 'rd216', 'ley37Iva'],
  es: {
    slug: 'pvpc-o-mercado-libre',
    nav: 'PVPC o mercado libre',
    card: 'Tu factura de 30 días con el PVPC y con tu precio fijo, con impuestos en los dos lados.',
    title: 'PVPC o mercado libre 2026: compara tu factura con impuestos',
    description: 'PVPC o mercado libre en 2026: tu factura de los últimos 30 días con el PVPC real y con el precio fijo de tu oferta, impuestos en los dos lados. Sin teléfono.',
    h1: 'PVPC o mercado libre: ¿qué te sale más barato?',
    intro: 'Escribe el precio de la oferta que te proponen. Te decimos cuánto habrías pagado con ella y con el PVPC en los últimos 30 días.',
    resume: (h) => {
      const v = V(h);
      return `En los últimos 30 días, del ${h.dia(v.e.desde)} al ${h.dia(v.e.hasta)}, la energía del PVPC salió de media a ${h.kwh(v.empate, 4)} por kWh antes de impuestos para un hogar con el consumo tipo de Red Eléctrica, y una factura de 270 kWh con 4,6 kW habría costado ${h.eur(v.pvpc.total, 2)}. Es la cifra de empate: una oferta de precio fijo con la misma potencia solo te habría ahorrado dinero si su energía estaba por debajo de ${h.kwh(v.empate, 4)} sin impuestos, que son ${h.kwh(v.empateTtc, 4)} con impuesto eléctrico e IVA. La comparación solo es justa si se hace con impuestos en los dos lados y con tu consumo; las comercializadoras suelen anunciar el precio fijo sin impuestos y algunas webs lo comparan con un PVPC al que tampoco le suman nada. Este comparador lo hace bien y no te pide ningún dato de contacto.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: '¿Es mejor el PVPC o una tarifa fija?', a: `Depende del precio fijo y de cuándo consumes. En los últimos 30 días, una tarifa fija habría ganado al PVPC por debajo de ${h.kwh(v.empate, 4)} sin impuestos con la misma potencia. El PVPC sigue al mercado: en meses baratos gana, en meses caros pierde, y a cambio no tiene permanencia.` },
        { q: '¿Puedo volver al PVPC si me paso al mercado libre?', a: `Sí. Pueden volver al PVPC las personas físicas y las microempresas con hasta 10 kW (artículo 5.3 del Real Decreto 216/2014, que desarrolla el artículo 17 de la Ley 24/2013); se contrata con cualquier comercializadora de referencia. Mira antes si tu contrato libre tiene penalización por permanencia, que debe figurar en las condiciones.` },
        { q: '¿Qué precio de la potencia pongo para la oferta libre?', a: `El que aparezca en la oferta, en céntimos por kW y día: 0,0864 €/kW·día se escribe 8,64. Si viene por año, divídelo entre 365. Por defecto el campo lleva el término de potencia regulado del PVPC, ${h.num(v.potDia * 100, 2)} céntimos por kW y día, para que la comparación empiece solo con la diferencia de la energía.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Lo que hay que comparar</h2>
<p>Una oferta del mercado libre tiene dos precios: el de la energía, en euros por kWh, y el de la potencia, en euros por kW y día o por kW y año. A los dos se les aplican los mismos impuestos que al PVPC y el mismo alquiler de contador, así que la comparación correcta es la de la factura completa. El comparador calcula las dos facturas con tu consumo, tu potencia y los impuestos del día, y te da la diferencia.</p>
<p>Ojo con tres trampas habituales. Un precio «sin impuestos» frente a un PVPC «con impuestos», o al revés. Un precio fijo que solo es fijo el primer año. Y un descuento que se aplica solo a la energía y no a la potencia. Para ver qué ofertas existen sin dar tus datos, la CNMC tiene un ${h.src('cnmcComparador', 'comparador oficial de ofertas')}.</p>
<h2>El PVPC de los últimos meses</h2>
<p>El PVPC se mueve con el mercado, y una decisión tomada en un mes caro puede no aguantar un año. El ${h.a('historial', 'historial por meses')} muestra la media de cada mes con impuestos; el precio de empate de ${h.kwh(v.empate, 4)} sin impuestos de estos 30 días no tiene por qué repetirse.</p>`;
    },
  },
  en: {
    slug: 'pvpc-vs-fixed-price',
    nav: 'PVPC or fixed price',
    card: 'Your 30-day bill on the PVPC and on your fixed price, with tax on both sides.',
    title: 'PVPC vs Fixed Price Spain 2026: Compare Your Bill with Tax',
    description: 'PVPC or a fixed-price deal in 2026: your bill for the last 30 days on the real PVPC and on the fixed price you were offered, tax on both sides. No phone.',
    h1: 'PVPC or a fixed price: which costs you less?',
    intro: 'Enter the price you have been offered. We show what you would have paid with it, and with the PVPC, over the last 30 days.',
    resume: (h) => {
      const v = V(h);
      return `Over the last 30 days, from ${h.dia(v.e.desde)} to ${h.dia(v.e.hasta)}, PVPC energy averaged ${h.kwh(v.empate, 4)} per kWh before tax for a home on Red Eléctrica’s standard consumption profile, and a 270 kWh bill with 4.6 kW of power would have cost ${h.eur(v.pvpc.total, 2)}. That is the break-even figure: a fixed-price deal with the same power would only have saved you money if its energy price was below ${h.kwh(v.empate, 4)} before tax, which is ${h.kwh(v.empateTtc, 4)} with electricity tax and VAT. The comparison is only fair with tax on both sides and with your own consumption. Retailers usually quote fixed prices before tax, and some comparison sites set them against a PVPC that has no tax added either. This tool does it properly, and it asks for no contact details at all.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Is the PVPC better than a fixed tariff?', a: `It depends on the fixed price and on when you use power. Over the last 30 days a fixed deal would have beaten the PVPC below ${h.kwh(v.empate, 4)} before tax, with the same power. The PVPC tracks the market: it wins in cheap months and loses in dear ones, and it has no tie-in.` },
        { q: 'Can I go back to the PVPC after switching?', a: `Yes. Individuals and micro-enterprises with up to 10 kW can return to the PVPC (article 5.3 of Royal Decree 216/2014, under article 17 of Act 24/2013); you sign up with any reference retailer. Check first whether your market contract has an early-exit penalty, which must appear in its terms.` },
        { q: 'What power price should I enter for the fixed offer?', a: `Whatever the offer states, in cents per kW per day: 0.0864 €/kW·day is entered as 8.64. If it is per year, divide by 365. By default the field holds the PVPC’s regulated power term, ${h.num(v.potDia * 100, 2)} cents per kW per day, so the comparison starts from the energy difference alone. Overwrite it with your offer’s figure.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>What you actually need to compare</h2>
<p>A market offer has two prices: energy, in euros per kWh, and power, in euros per kW per day or per year. Both carry the same taxes as the PVPC and the same meter rental, so the right comparison is the whole bill. The tool works out both bills with your use, your power and the day’s taxes, and gives you the difference.</p>
<p>Watch for three common traps: a pre-tax price set against a tax-inclusive PVPC, or the other way round; a fixed price that is only fixed for the first year; and a discount that applies to energy but not to power. To see which offers exist without handing over your details, the CNMC regulator has an ${h.src('cnmcComparador', 'official offers comparison tool')}.</p>
<h2>The PVPC over recent months</h2>
<p>The PVPC moves with the market, and a decision made in an expensive month may not hold for a year. The ${h.a('historial', 'month-by-month history')} shows each month’s average with tax; this 30-day break-even of ${h.kwh(v.empate, 4)} before tax will not necessarily repeat.</p>`;
    },
  },
});
