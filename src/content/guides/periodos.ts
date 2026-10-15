import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';

/** Guía: punta, llano y valle de la tarifa 2.0TD, con lo que cuesta cada periodo hoy. */
const V = (h: Helpers) => {
  const hoy = h.R.resumenDia(0);
  const por = (p: 'P1' | 'P2' | 'P3') => { const x = hoy.horas.filter((y) => y.periodo === p); return x.length ? x.reduce((s, y) => s + y.ttc, 0) / x.length : NaN; };
  const lf = h.R.laborableVsFinde(8);
  return { hoy, p1: por('P1'), p2: por('P2'), p3: por('P3'), reg: h.M.REGULADO_ENERGIA, lf, valleHoy: h.M.esDiaValle(hoy.fecha) };
};

export default defineGuide({
  id: 'periodos',
  group: 'guia',
  order: 2,
  mini: 'periodos',
  miniHref: 'baratas',
  related: ['peajes', 'baratas', 'finde', 'potencia', 'coche'],
  sources: ['cnmcCircular3_2020', 'cnmcPeajes2026', 'tedCargos2026', 'esiosPvpc'],
  es: {
    slug: 'periodos-horarios-luz',
    nav: 'Punta, llano y valle',
    card: 'Las franjas de la tarifa 2.0TD, qué cuesta cada una y por qué el valle no siempre gana.',
    title: 'Periodos horarios luz 2026: punta, llano y valle en la 2.0TD',
    description: 'Periodos horarios de la luz en 2026: horas de punta, llano y valle de la tarifa 2.0TD, fines de semana y festivos, y lo que pesan peajes y cargos en cada uno.',
    h1: 'Periodos horarios de la luz: punta, llano y valle',
    intro: 'La tarifa 2.0TD divide el día en tres franjas con peajes y cargos distintos. Saber en cuál estás ayuda a leer el precio.',
    resume: (h) => {
      const v = V(h);
      return `La tarifa de acceso 2.0TD, la de casi todos los hogares, tiene tres periodos para la energía desde junio de 2021, según la Circular 3/2020 de la CNMC. Punta (P1), de lunes a viernes de 10 a 14 y de 18 a 22 horas. Llano (P2), de lunes a viernes de 8 a 10, de 14 a 18 y de 22 a 24 horas. Valle (P3), de 0 a 8 horas los laborables y las 24 horas de sábados, domingos y festivos nacionales de fecha fija. En ${h.P.year}, los peajes y cargos de la energía suman ${h.kwh(v.reg.P1, 4)} por kWh en punta, ${h.kwh(v.reg.P2, 4)} en llano y ${h.kwh(v.reg.P3, 4)} en valle, sin impuestos. Con el PVPC esa diferencia va dentro del precio de cada hora; con una tarifa de tres periodos del mercado libre, cada franja tiene su precio fijo. Para la potencia solo hay dos periodos: punta-llano y valle. Hoy, ${h.dia(v.hoy.fecha)}, ${v.valleHoy ? 'todo el día es valle' : `la media con impuestos es de ${h.kwh(v.p1)} en punta, ${h.kwh(v.p2)} en llano y ${h.kwh(v.p3)} en valle`}.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: '¿Qué días son valle todo el día?', a: `Los sábados, los domingos y los festivos nacionales de fecha fija: 1 y 6 de enero, 1 de mayo, 15 de agosto, 12 de octubre, 1 de noviembre y 6, 8 y 25 de diciembre. Los festivos autonómicos y locales, y los que cambian de fecha como el Viernes Santo, siguen el horario de un laborable.` },
        { q: '¿Cambian los periodos en verano?', a: `No. Desde la reforma de 2021 los horarios de punta, llano y valle son los mismos todo el año en la Península, Baleares y Canarias, en hora local. Ceuta y Melilla tienen un calendario propio. El cambio de hora de octubre y marzo solo hace que un día tenga 25 o 23 horas.` },
        { q: '¿Por qué una hora de llano puede salir más barata que una de valle?', a: `Porque el periodo solo fija los peajes y cargos; el resto del precio es energía, y la energía del mediodía soleado puede valer casi nada. En los últimos 56 días la media con impuestos fue de ${h.kwh(v.lf.laborable)} en laborables y ${h.kwh(v.lf.finde)} en fines de semana y festivos.` },
        { q: '¿Cuántas horas de cada periodo hay en un laborable?', a: `Ocho de punta (de 10 a 14 y de 18 a 22), ocho de llano (de 8 a 10, de 14 a 18 y de 22 a 24) y ocho de valle (de 0 a 8). En la semana completa, el valle suma 88 de las 168 horas porque cubre también el fin de semana entero.` },
        { q: '¿El periodo de potencia es el mismo que el de energía?', a: `No del todo. La potencia solo tiene dos periodos: P1, que junta punta y llano, de 8 a 24 horas en laborables, y P2, el valle. Por eso puedes contratar más potencia para la noche, por ejemplo para cargar el coche, sin pagar tanto como en el día.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      const P = h.P;
      return `<h2>El horario completo</h2>
${h.table(['Franja', 'Lunes a viernes', 'Sábado, domingo y festivo nacional', 'Peajes + cargos (€/kWh)'], [
  ['Punta (P1)', '10:00–14:00 y 18:00–22:00', 'nunca', h.num(v.reg.P1, 6)],
  ['Llano (P2)', '08:00–10:00, 14:00–18:00 y 22:00–24:00', 'nunca', h.num(v.reg.P2, 6)],
  ['Valle (P3)', '00:00–08:00', 'las 24 horas', h.num(v.reg.P3, 6)],
], `Circular 3/2020 de la CNMC; importes ${P.year} sin impuestos de la Resolución de la CNMC de 18 de diciembre de 2025 y la Orden TED/1524/2025.`, ['l', 'l', 'l', 'r'])}
<p>Los importes regulados de la tabla son la diferencia que el periodo introduce en el precio de cada kWh. Entre punta y valle hay ${h.kwh(v.reg.P1 - v.reg.P3, 4)} por kWh antes de impuestos: es lo mínimo que se ahorra pasando un consumo de la punta al valle, aunque la energía costara lo mismo en las dos horas.</p>
<h2>Cómo se comprueba que el periodo es el correcto</h2>
<p>El archivo de Red Eléctrica trae, para cada hora, la parte de peajes y cargos que ha incluido en el precio. Este sitio la compara con el periodo que dice la ${h.src('cnmcCircular3_2020', 'Circular 3/2020')} y con los importes del BOE, en todas las horas del año, antes de cada publicación. Si un festivo o un cambio de hora se clasificara mal, las pruebas lo detectarían. Hasta hoy cuadran todas, también el 12 de octubre, festivo nacional que cayó en lunes en 2026.</p>
<h2>Punta, llano y valle en el PVPC y en el mercado libre</h2>
<p>Con el PVPC no hay que pensar en franjas: el precio de cada hora ya incluye la parte del periodo, y basta con mirar la tabla del día. Con una tarifa de discriminación horaria del mercado libre, en cambio, hay tres precios fijos, uno por franja, y la regla es simple: lo que se pueda, en valle. El ${h.a('libre', 'comparador')} permite poner un precio fijo único; si tu oferta tiene tres, usa el precio medio que te salga con tu reparto.</p>
<h2>El mediodía solar</h2>
<p>La regla de oro de que la noche es lo más barato ya no siempre se cumple. En días de mucho sol, la fotovoltaica hunde el precio de la energía entre el final de la mañana y la tarde, y aunque esas horas paguen peajes de llano, el total puede quedar por debajo de la madrugada. La página de ${h.a('baratas', 'horas baratas')} lo muestra cada día con cifras, y la del ${h.a('finde', 'fin de semana')} compara laborables y festivos hora a hora.</p>
<h2>Y la potencia</h2>
<p>La potencia contratada se paga por días, no por horas, pero también tiene periodos: punta-llano (P1) y valle (P2). El kW de valle es muy barato, ${h.num(h.M.POT_P2_PVPC, 3)} € al año antes de impuestos frente a ${h.num(h.M.POT_P1_PVPC, 3)} € el de punta-llano, y por eso a quien carga el ${h.a('coche', 'coche eléctrico')} de noche le compensa subir solo la potencia de valle. Lo calcula la página de ${h.a('potencia', 'potencia contratada')}.</p>`;
    },
  },
  en: {
    slug: 'time-of-use-periods',
    nav: 'Peak, standard and off-peak',
    card: 'The 2.0TD time bands, what each costs and why off-peak does not always win.',
    title: 'Time-of-Use Periods Spain 2026: Peak, Standard and Off-Peak',
    description: 'Spain’s time-of-use periods in 2026: peak, standard and off-peak hours on the 2.0TD tariff, weekends and holidays, and what tolls and charges weigh in each.',
    h1: 'Electricity time-of-use periods in Spain: peak, standard, off-peak',
    intro: 'The 2.0TD tariff splits the day into three bands with different tolls and charges. Knowing which one you are in helps you read the price.',
    resume: (h) => {
      const v = V(h);
      return `The 2.0TD access tariff, used by nearly every household, has had three energy periods since June 2021 under CNMC Circular 3/2020. Peak (P1) runs Monday to Friday from 10:00 to 14:00 and from 18:00 to 22:00. Standard (P2, “llano”) runs Monday to Friday from 8:00 to 10:00, 14:00 to 18:00 and 22:00 to 24:00. Off-peak (P3, “valle”) covers midnight to 8:00 on weekdays and all 24 hours on Saturdays, Sundays and fixed-date national holidays. In ${h.P.year} the energy tolls and charges come to ${h.kwh(v.reg.P1, 4)} per kWh at peak, ${h.kwh(v.reg.P2, 4)} at standard times and ${h.kwh(v.reg.P3, 4)} off-peak, before tax. On the PVPC that difference is built into each hour’s price; on a three-period market tariff each band has its own fixed price. Power has only two periods, peak-standard and off-peak. Today, ${h.dia(v.hoy.fecha)}, ${v.valleHoy ? 'the whole day is off-peak' : `the average with tax is ${h.kwh(v.p1)} at peak, ${h.kwh(v.p2)} at standard times and ${h.kwh(v.p3)} off-peak`}.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'Which days are off-peak all day?', a: `Saturdays, Sundays and fixed-date national holidays: 1 and 6 January, 1 May, 15 August, 12 October, 1 November and 6, 8 and 25 December. Regional and local holidays, and movable ones such as Good Friday, follow the weekday timetable, so check the national list before planning a holiday wash.` },
        { q: 'Do the periods change in summer?', a: `No. Since the 2021 reform the peak, standard and off-peak times are the same all year on the mainland, the Balearics and the Canaries, in local time. Ceuta and Melilla have their own calendar. The October and March clock changes only make one day 25 or 23 hours long.` },
        { q: 'Why can a standard hour be cheaper than an off-peak one?', a: `Because the period only sets the tolls and charges; the rest of the price is energy, and energy on a sunny midday can be almost free. Over the last 56 days the average with tax was ${h.kwh(v.lf.laborable)} on weekdays and ${h.kwh(v.lf.finde)} on weekends and holidays.` },
        { q: 'How many hours of each period are there on a weekday?', a: `Eight peak (10–14 and 18–22), eight standard (8–10, 14–18 and 22–24) and eight off-peak (0–8). Over a full week off-peak adds up to 88 of the 168 hours, because it also covers the whole weekend. That is more than half the hours, which is why shifting flexible jobs is worth the effort.` },
        { q: 'Is the power period the same as the energy period?', a: `Not quite. Power has only two periods: P1, combining peak and standard, from 8:00 to 24:00 on weekdays, and P2, off-peak. That is why you can contract more power for the night, to charge a car for instance, without paying daytime rates for it.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      const P = h.P;
      return `<h2>The full timetable</h2>
${h.table(['Band', 'Monday to Friday', 'Saturday, Sunday, national holiday', 'Tolls + charges (€/kWh)'], [
  ['Peak (P1)', '10:00–14:00 and 18:00–22:00', 'never', h.num(v.reg.P1, 6)],
  ['Standard (P2)', '08:00–10:00, 14:00–18:00 and 22:00–24:00', 'never', h.num(v.reg.P2, 6)],
  ['Off-peak (P3)', '00:00–08:00', 'all 24 hours', h.num(v.reg.P3, 6)],
], `CNMC Circular 3/2020; ${P.year} amounts before tax from the CNMC Resolution of 18 December 2025 and Order TED/1524/2025.`, ['l', 'l', 'l', 'r'])}
<p>The regulated amounts in the table are the difference the period makes to each kWh’s price. Between peak and off-peak there is ${h.kwh(v.reg.P1 - v.reg.P3, 4)} per kWh before tax: the minimum you save by moving use from peak to off-peak, even if energy cost the same at both times.</p>
<h2>How we check each hour’s period</h2>
<p>Red Eléctrica’s file includes, for each hour, the tolls-and-charges share it has built into the price. This site compares it with the period set by ${h.src('cnmcCircular3_2020', 'Circular 3/2020')} and with the BOE amounts, on every hour of the year, before each release. If a holiday or a clock change were misclassified, the tests would catch it. So far every hour matches, including 12 October, a national holiday that fell on a Monday in 2026.</p>
<h2>Peak, standard and off-peak on the PVPC and on market deals</h2>
<p>On the PVPC there is no need to think in bands: each hour’s price already includes its period’s share, so you only need the day’s table. On a market time-of-use tariff, by contrast, there are three fixed prices, one per band, and the rule is simple: whatever can wait, off-peak. The ${h.a('libre', 'comparison tool')} takes a single fixed price; if your offer has three, enter the average your own split gives.</p>
<h2>The solar midday</h2>
<p>The old rule that night is cheapest no longer always holds. On very sunny days solar pushes energy prices down from late morning to mid-afternoon, and even though those hours pay standard-period tolls, the total can come in below the small hours. The ${h.a('baratas', 'cheapest hours')} page shows it every day with figures, and the ${h.a('finde', 'weekend')} page compares weekdays and holidays hour by hour.</p>
<h2>And power</h2>
<p>Contracted power is paid by the day, not by the hour, but it too has periods: peak-standard (P1) and off-peak (P2). An off-peak kW is very cheap, ${h.num(h.M.POT_P2_PVPC, 3)} € a year before tax against ${h.num(h.M.POT_P1_PVPC, 3)} € for peak-standard, so anyone charging an ${h.a('coche', 'electric car')} overnight gains by raising only the off-peak power. The ${h.a('potencia', 'contracted power')} page works it out.</p>
<h2>A note for people new to Spain</h2>
<p>If you have just moved, your bill may show “P1”, “P2” and “P3” next to the energy lines and “P1” and “P2” next to power. They are these bands. Smart meters, which almost every home now has, record each hour, so there is nothing to set up: the periods apply automatically from the day you sign up.</p>
`;
    },
  },
});
