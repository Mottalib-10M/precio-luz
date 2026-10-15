import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';

/** Guía: impuesto eléctrico, IVA e IGIC en la factura de la luz, con las rebajas temporales de 2026. */
const V = (h: Helpers) => {
  const hoy = h.R.ESTADO.hoy;
  const imp = h.M.impuestosDelDia(hoy);
  const abr = h.M.impuestosDelDia('2026-04-15', 4.6);
  const ipc = h.M.IPC;
  const sep = ipc.find((m) => m.mes === '2026-09'), oct = ipc.find((m) => m.mes === '2026-10');
  const base = 60;
  const iee = base * imp.iee, iva = (base + iee) * imp.iva;
  const ieeA = base * abr.iee, ivaA = (base + ieeA) * abr.iva;
  return { hoy, imp, abr, sep, oct, base, iee, iva, ieeA, ivaA };
};

export default defineGuide({
  id: 'impuestos',
  group: 'guia',
  order: 4,
  mini: 'impuestos',
  miniHref: 'factura',
  related: ['factura', 'historial', 'peajes', 'bono', 'pvpc'],
  sources: ['ley38Iee', 'ley37Iva', 'rdl7_2026', 'rdl18_2026', 'rdl25_2026', 'ineIpc', 'igicCanarias'],
  es: {
    slug: 'impuestos-factura-luz',
    nav: 'Impuestos de la luz',
    card: 'Impuesto eléctrico, IVA e IGIC: cuánto suman, cómo se calculan y qué cambia en noviembre.',
    title: 'Impuestos factura luz 2026: IVA e impuesto eléctrico al día',
    description: 'Impuestos de la luz en 2026: impuesto eléctrico del 5,11 %, IVA del 21 % o IGIC en Canarias, la rebaja de primavera y la regla del IPC para noviembre.',
    h1: 'Impuestos de la factura de la luz en 2026',
    intro: 'Dos impuestos se suman a la luz: el especial sobre la electricidad y el IVA. En 2026 han cambiado dos veces y pueden volver a cambiar.',
    resume: (h) => {
      const v = V(h);
      return `Hoy, ${h.dia(v.hoy)}, la factura de la luz paga el impuesto especial sobre la electricidad al ${h.num(v.imp.iee * 100, 8)} % y el IVA al ${h.num(v.imp.iva * 100, 0)} %, los tipos generales de la Ley 38/1992 y de la Ley 37/1992. Sobre 60 € de potencia y energía, eso son ${h.eur(v.iee, 2)} de impuesto eléctrico y ${h.eur(v.iva, 2)} de IVA, porque el IVA se calcula también sobre el impuesto eléctrico. No siempre ha sido así este año: del 22 de marzo al 31 de mayo de 2026, el Real Decreto-ley 7/2026 bajó el impuesto eléctrico al 0,5 % y el IVA al 10 % para potencias inferiores a 10 kW, y la misma factura pagaba ${h.eur(v.ieeA + v.ivaA, 2)} de impuestos en lugar de ${h.eur(v.iee + v.iva, 2)}. El Real Decreto-ley 25/2026 deja preparada otra rebaja para noviembre y diciembre si el IPC de la electricidad sube más de un 15 %. En Canarias no hay IVA sino IGIC, al 0 % en la vivienda con hasta 10 kW.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: '¿Bajará el IVA de la luz en noviembre de 2026?', a: v.sep ? `No, según el dato publicado por el INE: el IPC de la electricidad de septiembre subió un ${h.num(v.sep.variacion, 1)} % sobre septiembre de 2025, por debajo del 15 % que exige el Real Decreto-ley 25/2026 para aplicar el IVA al 10 % y el impuesto eléctrico al 0,5 % en noviembre. Diciembre depende del IPC de octubre.` : `Depende del IPC de la electricidad de septiembre que publica el INE a mediados de octubre: si sube más de un 15 % sobre el año anterior, en noviembre se aplican el IVA al 10 % y el impuesto eléctrico al 0,5 %. La página se actualiza sola con el dato.` },
        { q: '¿El IVA se paga también sobre el impuesto eléctrico?', a: `Sí. La base del IVA es todo lo anterior: potencia, energía, financiación del bono social, impuesto eléctrico y alquiler del contador. Por eso los dos impuestos juntos suben la factura algo más que la suma de sus tipos: con los generales, un ${h.num(((1 + v.imp.iee) * (1 + v.imp.iva) - 1) * 100, 1)} % sobre la potencia y la energía.` },
        { q: '¿Qué es el mínimo del impuesto eléctrico?', a: `La ley fija una cuota mínima de 1 € por MWh consumido en los usos domésticos (0,5 € en los industriales). Con el tipo general casi nunca se alcanza, porque el 5,11 % de una factura normal es mucho más; con el tipo rebajado del 0,5 % sí puede ser la cifra que se aplica.` },
        { q: '¿Qué impuesto paga la luz en Canarias?', a: `El IGIC en lugar del IVA. El texto refundido de 2025 aplica el tipo cero a la electricidad que se entrega a personas físicas en su vivienda con una potencia de hasta 10 kW. El impuesto especial sobre la electricidad sí se paga, al mismo tipo que en la Península.` },
        { q: '¿Y en Ceuta y Melilla?', a: `No se paga IVA sino el IPSI, un impuesto local que fija cada ciudad en su ordenanza. Como además el PVPC de Ceuta y Melilla tiene sus propios precios publicados, este sitio no calcula esos dos territorios para no dar una cifra que no podemos comprobar.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Los dos impuestos, paso a paso</h2>
<p>El ${h.src('ley38Iee', 'impuesto especial sobre la electricidad')} se calcula sobre el importe de la potencia, la energía y los demás conceptos del suministro, sin incluir el alquiler del contador. Su tipo general es del 5,11269632 %, con una cuota mínima de 1 € por MWh para los hogares. Después viene el ${h.src('ley37Iva', 'IVA')}, al tipo general del 21 %, que se aplica sobre todo lo anterior: potencia, energía, impuesto eléctrico y contador.</p>
${h.table(['Concepto', 'Hoy', 'En abril de 2026'], [
  ['Potencia y energía (ejemplo)', h.eur(v.base, 2), h.eur(v.base, 2)],
  ['Impuesto eléctrico', `${h.eur(v.iee, 2)} (${h.num(v.imp.iee * 100, 2)} %)`, `${h.eur(v.ieeA, 2)} (${h.num(v.abr.iee * 100, 2)} %)`],
  ['IVA', `${h.eur(v.iva, 2)} (${h.num(v.imp.iva * 100, 0)} %)`, `${h.eur(v.ivaA, 2)} (${h.num(v.abr.iva * 100, 0)} %)`],
  ['Total con impuestos', h.eur(v.base + v.iee + v.iva, 2), h.eur(v.base + v.ieeA + v.ivaA, 2)],
], 'Ejemplo con 60 € de potencia y energía y 4,6 kW, sin contador. Tipos de cada fecha según la Ley 38/1992, la Ley 37/1992 y el RDL 7/2026.', ['l', 'r', 'r'])}
<h2>Lo que pasó en 2026</h2>
<p>El ${h.src('rdl7_2026', 'Real Decreto-ley 7/2026')}, de 20 de marzo, aprobado por la subida de la energía tras la crisis de Oriente Medio, rebajó desde el 22 de marzo el impuesto eléctrico al 0,5 % y el IVA al 10 % para los contratos con menos de 10 kW y para los consumidores vulnerables severos con bono social. La rebaja debía durar hasta el 30 de junio, pero estaba condicionada: si el IPC de la electricidad de abril no subía más de un 15 % sobre abril de 2025, decaía en junio. No subió, y desde el 1 de junio volvieron los tipos generales.</p>
<p>El ${h.src('rdl18_2026', 'Real Decreto-ley 18/2026')} creó una salvaguarda para agosto y septiembre, ligada al IPC de junio y de julio. El INE publicó subidas del ${h.num(h.M.IPC.find((m) => m.mes === '2026-06')?.variacion ?? NaN, 1)} % y del ${h.num(h.M.IPC.find((m) => m.mes === '2026-07')?.variacion ?? NaN, 1)} %, por debajo del umbral, y la rebaja no se activó. El ${h.src('rdl25_2026', 'Real Decreto-ley 25/2026')} repite el mecanismo para noviembre, con el IPC de septiembre, y para diciembre, con el de octubre.</p>
<h2>Cómo lo aplica este sitio</h2>
<p>Los tipos de cada periodo están en el fichero de parámetros del sitio, con la norma que los fija. Para noviembre y diciembre, el programa que actualiza los precios descarga cada día la serie del IPC de la electricidad del ${h.src('ineIpc', 'INE')} y aplica la regla del Real Decreto-ley 25/2026: si la subida anual del mes de referencia supera el 15 %, el mes siguiente se calcula con la rebaja. ${v.sep ? `El dato de septiembre ya está publicado (${h.num(v.sep.variacion, 1)} %), así que noviembre se calcula con los tipos generales.` : ''} ${v.oct ? `El de octubre también (${h.num(v.oct.variacion, 1)} %).` : 'El de octubre se conocerá a mediados de noviembre; hasta entonces, diciembre se muestra con los tipos generales y un aviso.'}</p>
<h2>Canarias, Ceuta y Melilla</h2>
<p>En Canarias el IVA no existe: se paga el IGIC, y el ${h.src('igicCanarias', 'texto refundido del IGIC de 2025')} aplica el tipo cero a la electricidad de la vivienda con hasta 10 kW contratados. El impuesto eléctrico sí se paga igual que en la Península. En Ceuta y Melilla se paga el IPSI, que fija cada ciudad; no lo calculamos.</p>
<p>Para ver el efecto de los impuestos en tu factura completa, el ${h.a('factura', 'simulador de factura')} los aplica con la fecha de hoy, y el ${h.a('historial', 'historial por meses')} muestra cómo bajó la media con impuestos de abril y mayo.</p>`;
    },
  },
  en: {
    slug: 'electricity-taxes-spain',
    nav: 'Electricity taxes',
    card: 'Electricity tax, VAT and IGIC: what they add, how they are worked out and what changes in November.',
    title: 'Electricity Taxes Spain 2026: VAT and Electricity Tax Today',
    description: 'Taxes on Spanish electricity bills in 2026: 5.11% electricity tax, 21% VAT or IGIC in the Canaries, the spring cut and the price-index rule for November.',
    h1: 'Taxes on electricity bills in Spain in 2026',
    intro: 'Two taxes are added to electricity: the special electricity tax and VAT. In 2026 they have changed twice and may change again.',
    resume: (h) => {
      const v = V(h);
      return `Today, ${h.dia(v.hoy)}, Spanish electricity bills pay the special electricity tax at ${h.num(v.imp.iee * 100, 8)}% and VAT at ${h.num(v.imp.iva * 100, 0)}%, the standard rates under Act 38/1992 and Act 37/1992. On 60 € of power and energy, that is ${h.eur(v.iee, 2)} of electricity tax and ${h.eur(v.iva, 2)} of VAT, because VAT is charged on the electricity tax too. It has not been like that all year. From 22 March to 31 May 2026, Royal Decree-law 7/2026 cut electricity tax to 0.5% and VAT to 10% for contracts under 10 kW, and the same bill carried ${h.eur(v.ieeA + v.ivaA, 2)} of tax instead of ${h.eur(v.iee + v.iva, 2)}. Royal Decree-law 25/2026 sets up another cut for November and December if the electricity consumer price index rises by more than 15%. The Canary Islands have IGIC instead of VAT, at 0% for homes with up to 10 kW.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Will VAT on electricity drop in November 2026?', a: v.sep ? `No, on the INE’s published figure: September’s electricity price index was up ${h.num(v.sep.variacion, 1)}% on September 2025, below the 15% that Royal Decree-law 25/2026 requires for 10% VAT and 0.5% electricity tax in November. December depends on the October index, published in mid-November, and the site applies it automatically.` : `It depends on September’s electricity price index, published by the INE in mid-October: if it is more than 15% above a year earlier, November gets 10% VAT and 0.5% electricity tax. This page updates itself with the figure.` },
        { q: 'Is VAT charged on the electricity tax as well?', a: `Yes. The VAT base is everything above it: power, energy, social-discount funding, electricity tax and meter rental. So the two taxes together raise the bill a little more than their rates added up: with standard rates, ${h.num(((1 + v.imp.iee) * (1 + v.imp.iva) - 1) * 100, 1)}% on power and energy. The calculators on this site apply both in that order.` },
        { q: 'What is the electricity tax minimum?', a: `The law sets a minimum of 1 € per MWh used in domestic settings (0.5 € for industrial use). At the standard rate it is almost never reached, because 5.11% of a normal bill is much more; at the reduced 0.5% rate it can become the figure that applies.` },
        { q: 'What tax does electricity pay in the Canary Islands?', a: `IGIC instead of VAT. The 2025 consolidated IGIC text applies a zero rate to electricity supplied to individuals in their home with up to 10 kW of power. The special electricity tax is still paid, at the same rate as on the mainland.` },
        { q: 'What about Ceuta and Melilla?', a: `They pay IPSI instead of VAT, a local tax each city sets by bylaw. Since the PVPC also has separate published prices there, this site does not calculate those two territories rather than give a figure we cannot check. Residents there should rely on their retailer’s bill.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>The two taxes, step by step</h2>
<p>The ${h.src('ley38Iee', 'special electricity tax')} is charged on power, energy and the other supply items, excluding meter rental. Its standard rate is 5.11269632%, with a minimum of 1 € per MWh for households. Then comes ${h.src('ley37Iva', 'VAT')} at the standard 21%, applied to everything above: power, energy, electricity tax and meter.</p>
${h.table(['Item', 'Today', 'In April 2026'], [
  ['Power and energy (example)', h.eur(v.base, 2), h.eur(v.base, 2)],
  ['Electricity tax', `${h.eur(v.iee, 2)} (${h.num(v.imp.iee * 100, 2)}%)`, `${h.eur(v.ieeA, 2)} (${h.num(v.abr.iee * 100, 2)}%)`],
  ['VAT', `${h.eur(v.iva, 2)} (${h.num(v.imp.iva * 100, 0)}%)`, `${h.eur(v.ivaA, 2)} (${h.num(v.abr.iva * 100, 0)}%)`],
  ['Total with taxes', h.eur(v.base + v.iee + v.iva, 2), h.eur(v.base + v.ieeA + v.ivaA, 2)],
], 'Example with 60 € of power and energy and 4.6 kW, meter excluded. Each date’s rates under Act 38/1992, Act 37/1992 and RDL 7/2026.', ['l', 'r', 'r'])}
<h2>What happened in 2026</h2>
<p>${h.src('rdl7_2026', 'Royal Decree-law 7/2026')} of 20 March, passed after energy prices rose with the Middle East crisis, cut electricity tax to 0.5% from 22 March, and VAT to 10% for contracts under 10 kW and for severely vulnerable customers on the social discount. The cut was meant to last until 30 June but came with a condition: if April’s electricity price index was not more than 15% above April 2025, it would lapse in June. It was not, and standard rates returned on 1 June.</p>
<p>${h.src('rdl18_2026', 'Royal Decree-law 18/2026')} added a safeguard for August and September, tied to the June and July index. The INE published rises of ${h.num(h.M.IPC.find((m) => m.mes === '2026-06')?.variacion ?? NaN, 1)}% and ${h.num(h.M.IPC.find((m) => m.mes === '2026-07')?.variacion ?? NaN, 1)}%, below the threshold, so the cut did not kick in. ${h.src('rdl25_2026', 'Royal Decree-law 25/2026')} repeats the mechanism for November, using September’s index, and for December, using October’s.</p>
<h2>How this site applies it</h2>
<p>Each period’s rates live in the site’s parameter file, with the rule that sets them. For November and December, the script that updates prices downloads the ${h.src('ineIpc', 'INE')} electricity price index every day and applies the Royal Decree-law 25/2026 rule: if the reference month’s yearly rise exceeds 15%, the following month is worked out with the cut. ${v.sep ? `September’s figure is already out (${h.num(v.sep.variacion, 1)}%), so November is calculated at standard rates.` : ''} ${v.oct ? `October’s is out too (${h.num(v.oct.variacion, 1)}%).` : 'October’s will be known in mid-November; until then December is shown at standard rates with a notice.'}</p>
<h2>Canary Islands, Ceuta and Melilla</h2>
<p>There is no VAT in the Canaries: IGIC applies instead, and the ${h.src('igicCanarias', '2025 consolidated IGIC text')} sets a zero rate for home electricity with up to 10 kW. The electricity tax is paid just as on the mainland. Ceuta and Melilla pay IPSI, set by each city; we do not calculate it.</p>
<p>To see what tax does to your whole bill, the ${h.a('factura', 'bill calculator')} applies today’s rates, and the ${h.a('historial', 'monthly history')} shows how April and May’s tax-inclusive average dropped.</p>
<p>One practical point for newcomers: tax lines on a Spanish bill appear as “Impuesto eléctrico” or “Impuesto sobre la electricidad” and “IVA”, always at the bottom, after the power and energy terms.</p>`;
    },
  },
});
