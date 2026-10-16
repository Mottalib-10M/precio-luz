import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';

/** Bono social de la luz: requisitos, categoría, descuento y ahorro en la factura. */
const V = (h: Helpers) => {
  const B = h.P.bono_social;
  const u1 = h.M.umbralRenta(1, 0, false), u21 = h.M.umbralRenta(2, 1, false), u22 = h.M.umbralRenta(2, 2, false);
  return { B, u1, u21, u22 };
};

export default defineGuide({
  id: 'bono',
  group: 'factura',
  order: 4,
  tool: 'bono',
  related: ['factura', 'pvpc', 'libre', 'potencia'],
  sources: ['rd897', 'rdl7_2026', 'bonoSocialWeb', 'sepeIprem', 'tedCargos2026', 'ted634_2026'],
  es: {
    slug: 'bono-social-luz',
    nav: 'Bono social de la luz',
    card: 'Si te corresponde, en qué categoría y cuánto baja tu factura con el descuento de 2026.',
    title: 'Bono social luz 2026: requisitos, renta y descuento',
    description: 'Bono social de la luz 2026: comprueba con tu renta y tu hogar si te corresponde, si eres vulnerable o severo, y cuánto bajaría tu factura PVPC con el descuento.',
    h1: 'Bono social de la luz 2026: ¿te corresponde y cuánto ahorras?',
    intro: 'Con el número de personas y la renta de tu hogar te decimos la categoría y lo que baja tu factura. Sin dar ningún dato a nadie.',
    resume: (h) => {
      const v = V(h);
      return `En ${h.P.year} el bono social descuenta un ${h.num(v.B.descuento_vulnerable * 100, 1)} % de la potencia y de la energía a los consumidores vulnerables y un ${h.num(v.B.descuento_severo * 100, 1)} % a los vulnerables severos, hasta el 31 de diciembre de 2026, según el Real Decreto-ley 7/2026; sin esa prórroga los descuentos ordinarios del Real Decreto 897/2017 son del ${h.num(v.B.descuento_ordinario_vulnerable * 100, 0)} % y del ${h.num(v.B.descuento_ordinario_severo * 100, 0)} %. Por renta, tiene derecho el hogar que no supera 1,5 veces el IPREM de 14 pagas (${h.eur(v.u1, 0)} para una persona sola), con 0,3 más por cada adulto adicional y 0,5 por cada menor: ${h.eur(v.u21, 0)} para dos adultos y un menor. Las familias numerosas, los pensionistas con pensión mínima y los beneficiarios del Ingreso Mínimo Vital entran por su situación. Solo existe con el PVPC y se pide a una comercializadora de referencia. La calculadora te da la categoría y el ahorro en una factura de 30 días.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: '¿Cuál es el límite de renta para el bono social en 2026?', a: `1,5 veces el IPREM de 14 pagas, ${h.eur(v.u1, 0)} al año, para quien vive solo. Se suma 0,3 por cada adulto más y 0,5 por cada menor, y 1 más si hay discapacidad de al menos el 33 %, dependencia de grado II o III, violencia de género o terrorismo, familia monoparental o electrodependencia. Con dos adultos y dos menores: ${h.eur(v.u22, 0)}.` },
        { q: '¿Cuándo se es vulnerable severo?', a: `Cuando la renta del hogar no llega a la mitad del umbral que le corresponde. También las familias numerosas con renta de hasta dos IPREM (${h.eur(2 * v.B.iprem_14_pagas, 0)}) y los pensionistas con pensión mínima con renta de hasta un IPREM (${h.eur(v.B.iprem_14_pagas, 0)}). El descuento sube entonces al ${h.num(v.B.descuento_severo * 100, 1)} %.` },
        { q: '¿El descuento se aplica a toda la factura?', a: `A la potencia y a la energía hasta un límite anual de kWh que depende del hogar: ${h.num(v.B.limites_kwh_ano[0].kwh)} kWh para una o dos personas y hasta ${h.num(v.B.limites_kwh_ano[3].kwh)} para familias numerosas. Lo que se consume por encima se paga a precio PVPC normal. Los impuestos se calculan después del descuento.` },
        { q: '¿Dónde se pide el bono social?', a: `A una comercializadora de referencia, con el formulario y los documentos que indica el Ministerio para la Transición Ecológica. La comercializadora la tramita en la plataforma del Ministerio, que comprueba la renta sin que la empresa vea esos datos, y debe responder en diez días hábiles. Si tienes una tarifa del mercado libre, hay que pasar antes al PVPC, porque el bono social no existe fuera de él.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Quién tiene derecho</h2>
<p>El ${h.src('rd897', 'Real Decreto 897/2017')} define al consumidor vulnerable: una persona física, titular del contrato de su vivienda habitual, acogida al PVPC y con una de estas condiciones. La renta del hogar por debajo del umbral, ser familia numerosa, que todos los que tienen ingresos sean pensionistas con la pensión mínima y no tengan otros ingresos de más de 500 euros al año, o que alguien del hogar cobre el Ingreso Mínimo Vital.</p>
${h.table(['Hogar', 'Umbral de renta (vulnerable)', 'Umbral (severo)'], [
  ['1 adulto', h.eur(h.M.umbralRenta(1, 0, false), 0), h.eur(h.M.umbralRenta(1, 0, false) / 2, 0)],
  ['2 adultos', h.eur(h.M.umbralRenta(2, 0, false), 0), h.eur(h.M.umbralRenta(2, 0, false) / 2, 0)],
  ['2 adultos y 1 menor', h.eur(v.u21, 0), h.eur(v.u21 / 2, 0)],
  ['2 adultos y 2 menores', h.eur(v.u22, 0), h.eur(v.u22 / 2, 0)],
  ['1 adulto y 1 menor (monoparental)', h.eur(h.M.umbralRenta(1, 1, true), 0), h.eur(h.M.umbralRenta(1, 1, true) / 2, 0)],
], `Renta anual del hogar, IPREM de 14 pagas de ${h.eur(v.B.iprem_14_pagas, 0)} (${h.src('sepeIprem', 'SEPE')}). La familia monoparental suma 1 al multiplicador.`, ['l', 'r', 'r'])}
<p>La solicitud se hace con la comercializadora de referencia; el Ministerio explica los pasos y da la lista de comercializadoras de referencia, también las de Ceuta y Melilla, en su ${h.src('bonoSocialWeb', 'página del bono social')}. Una vez concedido, el bono se aplica durante dos años (a las familias numerosas, mientras esté vigente su título); antes de que venza, la comercializadora vuelve a comprobar los requisitos y, si se cumplen, lo renueva por otros dos años (Real Decreto 897/2017, artículos 9 y 10). El descuento rebaja la potencia y la energía hasta el límite de kWh; el contador y los impuestos de la ${h.a('factura', 'factura')} se siguen pagando como en cualquier otro contrato.</p>`;
    },
  },
  en: {
    slug: 'social-electricity-discount',
    nav: 'Social discount (bono social)',
    card: 'Whether you qualify, in which category, and how much your bill drops with the 2026 discount.',
    title: 'Bono Social Spain 2026: Eligibility, Income Limits, Discount',
    description: 'Spain’s bono social electricity discount in 2026: check with your income and household whether you qualify, as vulnerable or severe, and what your bill saves.',
    h1: 'Spain’s social electricity discount (bono social) in 2026',
    intro: 'From the number of people and your household income we give you the category and how much your bill drops. No data goes to anyone.',
    resume: (h) => {
      const v = V(h);
      return `In ${h.P.year} the bono social takes ${h.num(v.B.descuento_vulnerable * 100, 1)}% off power and energy for vulnerable consumers and ${h.num(v.B.descuento_severo * 100, 1)}% for severely vulnerable ones, until 31 December 2026 under Royal Decree-law 7/2026; without that extension the standard discounts in Royal Decree 897/2017 are ${h.num(v.B.descuento_ordinario_vulnerable * 100, 0)}% and ${h.num(v.B.descuento_ordinario_severo * 100, 0)}%. On income, a household qualifies if it earns no more than 1.5 times the 14-payment IPREM, a Spanish reference index (${h.eur(v.u1, 0)} for someone living alone), plus 0.3 for each extra adult and 0.5 for each child: ${h.eur(v.u21, 0)} for two adults and a child. Large families, minimum-pension pensioners and people receiving the Minimum Living Income qualify by their situation. It only exists on the PVPC and you apply through a reference retailer. The calculator gives you the category and the saving on a 30-day bill.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'What is the income limit for the bono social in 2026?', a: `1.5 times the 14-payment IPREM, ${h.eur(v.u1, 0)} a year, for someone living alone. Add 0.3 per extra adult and 0.5 per child, and 1 more for a disability of 33% or more, grade II or III dependency, gender or terrorist violence, a single-parent family or electricity-dependent medical equipment. Two adults and two children: ${h.eur(v.u22, 0)}.` },
        { q: 'Who counts as severely vulnerable?', a: `A household whose income is below half its threshold. Also large families with income up to twice the IPREM (${h.eur(2 * v.B.iprem_14_pagas, 0)}) and minimum-pension pensioners with income up to one IPREM (${h.eur(v.B.iprem_14_pagas, 0)}). The discount then rises to ${h.num(v.B.descuento_severo * 100, 1)}%, and the household may also be protected from disconnection if social services support it.` },
        { q: 'Does the discount apply to the whole bill?', a: `To power and to energy up to a yearly kWh cap that depends on the household: ${h.num(v.B.limites_kwh_ano[0].kwh)} kWh for one or two people and up to ${h.num(v.B.limites_kwh_ano[3].kwh)} for large families. Anything above is charged at the normal PVPC price. Taxes are worked out after the discount.` },
        { q: 'Where do I apply for the bono social?', a: `With a reference retailer, using the form and documents listed by the Ministry for the Ecological Transition. The retailer files it on the Ministry’s platform, which checks income without the company seeing that data, and must answer within ten working days. If you are on a market tariff you must switch to the PVPC first, because the bono social does not exist outside it.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Who qualifies</h2>
<p>${h.src('rd897', 'Royal Decree 897/2017')} defines a vulnerable consumer as an individual who holds the contract for their main home, is on the PVPC and meets one of these conditions: household income below the threshold; being a large family; everyone with income being a pensioner on the minimum pension with no other income above 500 euros a year; or someone in the household receiving the Minimum Living Income.</p>
${h.table(['Household', 'Income threshold (vulnerable)', 'Threshold (severe)'], [
  ['1 adult', h.eur(h.M.umbralRenta(1, 0, false), 0), h.eur(h.M.umbralRenta(1, 0, false) / 2, 0)],
  ['2 adults', h.eur(h.M.umbralRenta(2, 0, false), 0), h.eur(h.M.umbralRenta(2, 0, false) / 2, 0)],
  ['2 adults and 1 child', h.eur(v.u21, 0), h.eur(v.u21 / 2, 0)],
  ['2 adults and 2 children', h.eur(v.u22, 0), h.eur(v.u22 / 2, 0)],
  ['1 adult and 1 child (single parent)', h.eur(h.M.umbralRenta(1, 1, true), 0), h.eur(h.M.umbralRenta(1, 1, true) / 2, 0)],
], `Yearly household income, 14-payment IPREM of ${h.eur(v.B.iprem_14_pagas, 0)} (${h.src('sepeIprem', 'SEPE')}). A single-parent family adds 1 to the multiplier.`, ['l', 'r', 'r'])}
<p>You apply through the reference retailer; the Ministry sets out the steps and lists the reference retailers, including those for Ceuta and Melilla, on its ${h.src('bonoSocialWeb', 'social discount page')}. Once granted, the discount applies for two years (for large families, while their family card is valid); before it expires the retailer re-checks the conditions and, if they are still met, renews it for two more years (Royal Decree 897/2017, articles 9 and 10). It reduces power and energy up to the cap, but you still pay, like everyone, the meter and the taxes shown on the ${h.a('factura', 'bill')}.</p>`;
    },
  },
});
