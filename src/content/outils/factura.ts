import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';
import { energiaPeriodo } from '../../components/calc/FacturaCalc';
import { bundle } from '../../lib/bundle';

/** Simulador de factura PVPC: los últimos 30 días reales, consumo repartido con el perfil oficial. */
const V = (h: Helpers) => {
  const b = bundle();
  const hasta = b.hoy;
  const d = new Date(`${hasta}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - 29);
  const desde = d.toISOString().slice(0, 10);
  const e = energiaPeriodo(b, desde, hasta, 270);
  const f = h.M.factura({ dias: e.dias, kwP1: 4.6, kwP2: 4.6, kwh: 270, energia: e.energia, fecha: hasta });
  const f2 = h.M.factura({ dias: e.dias, kwP1: 3.45, kwP2: 3.45, kwh: 270, energia: e.energia, fecha: hasta });
  return { e, f, f2, desde, hasta };
};

export default defineGuide({
  id: 'factura',
  group: 'factura',
  order: 1,
  tool: 'factura',
  toolProps: { mode: 'factura' },
  related: ['libre', 'potencia', 'bono', 'impuestos', 'peajes'],
  sources: ['esiosPvpc', 'cnmcPeajes2026', 'tedCargos2026', 'etuComercializacion', 'itcContador', 'cnmcFactura'],
  es: {
    slug: 'simulador-factura-luz',
    nav: 'Simulador de factura de la luz',
    card: 'Tu factura PVPC de los últimos 30 días, línea a línea, con tu consumo y tu potencia.',
    title: 'Factura de la luz 2026: simulador con el PVPC de 30 días',
    description: 'Simulador de factura de la luz 2026 con el PVPC real de los últimos 30 días: potencia, energía, bono social, impuesto eléctrico, contador e IVA, con tu consumo.',
    h1: 'Simulador de factura de la luz con el PVPC real',
    intro: 'Pon tu consumo y tu potencia: te damos la factura que habrías pagado con los precios de los últimos 30 días.',
    resume: (h) => {
      const v = V(h);
      return `Con 270 kWh en 30 días y 4,6 kW de potencia, la factura PVPC del ${h.dia(v.e.desde)} al ${h.dia(v.e.hasta)} habría sido de ${h.eur(v.f.total, 2)} con impuestos: ${h.eur(v.f.potencia, 2)} de potencia, ${h.eur(v.f.energia, 2)} de energía, ${h.eur(v.f.iee, 2)} de impuesto eléctrico, ${h.eur(v.f.contador, 2)} de contador, ${h.eur(v.f.financiacionBono, 2)} de financiación del bono social y ${h.eur(v.f.indirecto, 2)} de IVA. El simulador no usa un precio medio inventado: reparte tu consumo hora a hora con el perfil de consumo tipo que publica Red Eléctrica para los contadores 2.0TD y paga cada hora a su precio PVPC real. Puedes cambiar los kWh, la potencia, Canarias o la Península y el bono social; la cuenta se rehace al instante y cada línea sale de una norma del BOE citada abajo. Es la misma estructura que verás en la factura de tu comercializadora de referencia.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: '¿Por qué mi factura real sale distinta del simulador?', a: `Porque tu reparto horario no es el del perfil tipo de Red Eléctrica, tu periodo de facturación no coincide con estos 30 días y quizá tu potencia en valle es otra. Con el contador inteligente, la comercializadora usa tu consumo de cada hora; el simulador usa el perfil oficial cuando no lo conoce.` },
        { q: '¿Cuánto bajaría la factura con menos potencia?', a: `Con el mismo consumo y 3,45 kW en lugar de 4,6 kW, la factura de estos 30 días bajaría de ${h.eur(v.f.total, 2)} a ${h.eur(v.f2.total, 2)}. La potencia se paga cada día aunque no consumas; antes de bajarla, comprueba que no saltará el interruptor con los aparatos que usas a la vez.` },
        { q: '¿Qué es la financiación del bono social que aparece en la factura?', a: `Es la parte del coste del bono social que pagan todos los clientes a través de su comercializadora: ${h.num(h.P.bono_social_financiacion.eur_cups_ano, 6)} € por punto de suministro y año en ${h.P.year}, según la Orden TED/1524/2025, repartidos por días en cada factura. Lo paga todo el mundo, tenga o no bono social, y también en el mercado libre.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Las líneas de una factura PVPC</h2>
${h.table(['Línea', 'Cómo se calcula', 'En el ejemplo'], [
  ['Potencia', 'kW × (peaje + cargo + margen) por día, en punta-llano y en valle', h.eur(v.f.potencia, 2)],
  ['Energía', 'kWh de cada hora × precio PVPC de esa hora', h.eur(v.f.energia, 2)],
  ['Financiación del bono social', `${h.num(h.P.bono_social_financiacion.eur_cups_ano, 6)} € al año, por días`, h.eur(v.f.financiacionBono, 2)],
  ['Impuesto eléctrico', `${h.num(v.f.imp.iee * 100, 8)} % de lo anterior`, h.eur(v.f.iee, 2)],
  ['Alquiler del contador', `${h.num(h.P.contador.alquiler_eur_mes, 2)} € al mes, por días`, h.eur(v.f.contador, 2)],
  ['IVA', `${h.num(v.f.imp.iva * 100, 0)} % sobre todo lo anterior`, h.eur(v.f.indirecto, 2)],
  ['Total', '', h.eur(v.f.total, 2)],
], `270 kWh y 4,6 kW, PVPC del ${h.dia(v.e.desde)} al ${h.dia(v.e.hasta)}.`, ['l', 'l', 'r'])}
<p>La CNMC tiene su propio ${h.src('cnmcFactura', 'simulador oficial de la factura')}, útil para contrastar. La diferencia de este es que trabaja con los precios ya publicados de cada hora y muestra lo que habrías pagado, no una previsión. Si quieres comparar con una oferta de precio fijo, el ${h.a('libre', 'comparador PVPC o mercado libre')} usa este mismo cálculo; y si tienes derecho al ${h.a('bono', 'bono social')}, elige tu categoría en el campo correspondiente.</p>`;
    },
  },
  en: {
    slug: 'electricity-bill-calculator',
    nav: 'Electricity bill calculator',
    card: 'Your PVPC bill for the last 30 days, line by line, with your use and your power.',
    title: 'Electricity Bill Calculator Spain 2026: Your Real PVPC Bill',
    description: 'Electricity bill calculator for Spain, 2026, on the real PVPC of the last 30 days: power, energy, social discount, electricity tax, meter and VAT, for your use.',
    h1: 'Electricity bill calculator on the real PVPC',
    intro: 'Enter your use and your power: you get the bill you would have paid at the prices of the last 30 days.',
    resume: (h) => {
      const v = V(h);
      return `With 270 kWh over 30 days and 4.6 kW of contracted power, the PVPC bill from ${h.dia(v.e.desde)} to ${h.dia(v.e.hasta)} would have come to ${h.eur(v.f.total, 2)} including taxes: ${h.eur(v.f.potencia, 2)} for power, ${h.eur(v.f.energia, 2)} for energy, ${h.eur(v.f.iee, 2)} of electricity tax, ${h.eur(v.f.contador, 2)} for the meter, ${h.eur(v.f.financiacionBono, 2)} towards the social discount and ${h.eur(v.f.indirecto, 2)} of VAT. The calculator does not use a made-up average price. It spreads your consumption hour by hour with the standard 2.0TD meter profile Red Eléctrica publishes and charges each hour at its real PVPC price. Change the kWh, the power, mainland or Canary Islands and the social discount, and the sum redoes itself instantly; every line comes from a BOE rule cited below. It follows the same layout as a reference retailer’s bill, so you can hold it up against yours.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Why does my real bill differ from the calculator?', a: `Because your hour-by-hour pattern is not Red Eléctrica’s standard profile, your billing period does not match these 30 days and your off-peak power may differ. With a smart meter the retailer uses your actual hourly use; the calculator uses the official profile when it does not know it.` },
        { q: 'How much would a lower power save?', a: `With the same consumption and 3.45 kW instead of 4.6 kW, this 30-day bill would drop from ${h.eur(v.f.total, 2)} to ${h.eur(v.f2.total, 2)}. Power is paid every day even if you use nothing; before lowering it, check the switch will not trip with the appliances you run together.` },
        { q: 'What is the social-discount funding line on the bill?', a: `It is the share of the cost of the bono social that every customer pays through their retailer: ${h.num(h.P.bono_social_financiacion.eur_cups_ano, 6)} € per supply point per year in ${h.P.year}, under Order TED/1524/2025, spread by days across each bill. Everyone pays it, with or without the discount, and on market tariffs too.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>The lines of a PVPC bill</h2>
${h.table(['Line', 'How it is worked out', 'In the example'], [
  ['Power', 'kW × (toll + charge + margin) per day, peak-standard and off-peak', h.eur(v.f.potencia, 2)],
  ['Energy', 'kWh in each hour × that hour’s PVPC price', h.eur(v.f.energia, 2)],
  ['Social-discount funding', `${h.num(h.P.bono_social_financiacion.eur_cups_ano, 6)} € a year, by days`, h.eur(v.f.financiacionBono, 2)],
  ['Electricity tax', `${h.num(v.f.imp.iee * 100, 8)}% of the above`, h.eur(v.f.iee, 2)],
  ['Meter rental', `${h.num(h.P.contador.alquiler_eur_mes, 2)} € a month, by days`, h.eur(v.f.contador, 2)],
  ['VAT', `${h.num(v.f.imp.iva * 100, 0)}% on everything above`, h.eur(v.f.indirecto, 2)],
  ['Total', '', h.eur(v.f.total, 2)],
], `270 kWh and 4.6 kW, PVPC from ${h.dia(v.e.desde)} to ${h.dia(v.e.hasta)}.`, ['l', 'l', 'r'])}
<p>The CNMC regulator runs its own ${h.src('cnmcFactura', 'official bill simulator')}, handy as a cross-check. The difference here is that this one works with each hour’s already-published price and shows what you would have paid, not a forecast. To compare against a fixed-price offer, the ${h.a('libre', 'PVPC versus fixed price comparison')} uses the same sum; and if you qualify for the ${h.a('bono', 'social discount')}, pick your category in its field.</p>`;
    },
  },
});
