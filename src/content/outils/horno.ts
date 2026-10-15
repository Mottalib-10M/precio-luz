import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';

/** Coste del horno eléctrico según la hora (Reglamento Delegado (UE) 65/2014). */
const V = (h: Helpers) => {
  const A = h.P.aparatos.horno;
  const hoy = h.R.resumenDia(0);
  const precios = hoy.horas.map((x) => x.ttc);
  const sec = h.M.secHorno(A.volumen_l);
  const kA = h.M.kwhHorno(A.volumen_l, 'A'), kApp = h.M.kwhHorno(A.volumen_l, 'A++');
  const cena = h.M.costeTramo(precios, 21, 1, kA);
  const m = h.M.mejorInicio(precios, 1, kA);
  return { A, hoy, sec, kA, kApp, cena, m };
};

export default defineGuide({
  id: 'horno',
  group: 'aparato',
  order: 3,
  tool: 'aparato',
  toolProps: { aparato: 'horno' },
  related: ['lavavajillas', 'potencia', 'baratas', 'periodos'],
  sources: ['ueEtiquetaHorno', 'esiosPvpc', 'cnmcCircular3_2020'],
  es: {
    slug: 'coste-horno-electrico',
    nav: 'Cuánto cuesta el horno eléctrico',
    card: 'Lo que cuesta una hora de horno según el momento del día y su clase energética.',
    title: 'Coste horno eléctrico 2026: cuánto cuesta una hora de horno',
    description: 'Cuánto cuesta usar el horno eléctrico en 2026: el precio de un ciclo según la hora con el PVPC de hoy o mañana e impuestos, por volumen y clase energética.',
    h1: 'Cuánto cuesta usar el horno eléctrico',
    intro: 'El horno suele encenderse a la hora más cara del día, la de la cena. Calcula cuánto cuesta y cuánto cambia según la hora.',
    resume: (h) => {
      const v = V(h);
      return `Un horno eléctrico de ${h.num(v.A.volumen_l)} litros y clase A gasta como mucho ${h.num(v.kA, 3)} kWh en el ciclo normalizado con el que se mide su etiqueta energética, que consiste en calentar una carga de referencia. Con el PVPC de hoy, ${h.dia(v.hoy.fecha)}, ese ciclo cuesta ${h.eur(v.cena, 2)} con impuestos a las 21:00, en plena punta de los laborables, y ${h.eur(v.m.coste, 2)} a las ${h.M.reloj(v.m.inicio)}, la mejor hora del día. Un horno de clase A++ del mismo tamaño gasta como mucho ${h.num(v.kApp, 3)} kWh. Un asado largo o una temperatura alta gastan más que el ciclo de la etiqueta: si conoces la potencia de tu horno, el simulador genérico de la portada calcula vatios por horas. El horno es también uno de los aparatos que más potencia piden a la vez, y conviene tenerlo en cuenta al elegir la potencia contratada.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: '¿Cuánto consume un horno eléctrico en una hora?', a: `La etiqueta europea no da un consumo por hora, sino por ciclo normalizado: para un horno de ${h.num(v.A.volumen_l)} litros, el consumo de referencia es ${h.num(v.sec, 2)} kWh y la clase A gasta menos del 107 % de eso. En la práctica depende de la temperatura, del tiempo y de si se abre la puerta.` },
        { q: '¿Gasta menos el horno con ventilador?', a: `Las etiquetas distinguen el consumo en modo convencional y en modo de convección forzada, y el segundo suele ser menor porque reparte el calor y permite bajar la temperatura. Mira las dos cifras en la etiqueta de tu modelo o en su ficha de la base de datos europea EPREL.` },
        { q: '¿Cocinar por la tarde sale más caro?', a: `En laborables, de 18 a 22 horas es periodo punta, con los peajes y cargos más altos, y a menudo coincide con las horas más caras del mercado. Hoy un ciclo a las 21:00 cuesta ${h.eur(v.cena, 2)} y a la mejor hora ${h.eur(v.m.coste, 2)}. Los fines de semana todas las horas van en valle.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Consumo de referencia por clase</h2>
${h.table(['Clase', 'Índice máximo', `kWh por ciclo (${h.num(v.A.volumen_l)} litros)`], Object.entries(v.A.eei_max).map(([c, i]) => [c, h.num(i as number), h.num(h.M.kwhHorno(v.A.volumen_l, c), 3)]), 'Consumo normalizado 0,0042 × volumen + 0,55 kWh, Reglamento Delegado (UE) 65/2014, anexo II.', ['l', 'r', 'r'])}
<p>El horno es el caso contrario al lavavajillas: no se puede programar a las tres de la madrugada, porque se usa cuando se come. Lo que sí se puede hacer es aprovechar el fin de semana para las cocciones largas, que en sábado y domingo pagan peajes de valle, o el mediodía de un día de sol. El gráfico del simulador muestra las horas del día que elijas y marca la mejor para la duración que pongas.</p>
<p>Cuidado también con la potencia: el horno y la placa de inducción a la vez pueden superar la potencia contratada y hacer saltar el interruptor. La página de ${h.a('potencia', 'potencia contratada')} calcula lo que cuesta subir o bajar un escalón.</p>`;
    },
  },
  en: {
    slug: 'electric-oven-cost',
    nav: 'Electric oven running cost',
    card: 'What an hour of oven use costs depending on the time of day and its energy class.',
    title: 'Electric Oven Cost Spain 2026: What One Hour of Baking Costs',
    description: 'What an electric oven costs to run in Spain in 2026: one cycle by start time on today’s or tomorrow’s PVPC with taxes, by volume and EU energy label class.',
    h1: 'What an electric oven costs to run in Spain',
    intro: 'The oven usually goes on at the dearest time of day, dinner time. Work out what it costs and how much the hour changes it.',
    resume: (h) => {
      const v = V(h);
      return `A ${h.num(v.A.volumen_l)}-litre class A electric oven uses at most ${h.num(v.kA, 3)} kWh on the standard cycle behind its energy label, which consists of heating a reference load. On today’s PVPC, ${h.dia(v.hoy.fecha)}, that cycle costs ${h.eur(v.cena, 2)} including taxes at 9 pm, right in the weekday peak, and ${h.eur(v.m.coste, 2)} at ${h.M.reloj(v.m.inicio)}, the day’s best time. A class A++ oven of the same size uses at most ${h.num(v.kApp, 3)} kWh. A long roast or a high temperature uses more than the label cycle: if you know your oven’s power, the general calculator on the home page works from watts and hours. The oven is also one of the appliances that draws most power at once, worth keeping in mind when choosing your contracted power. All prices on this page are PVPC prices with electricity tax and VAT.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'How much electricity does an oven use in an hour?', a: `The EU label gives consumption per standard cycle, not per hour: for a ${h.num(v.A.volumen_l)}-litre oven the reference is ${h.num(v.sec, 2)} kWh, and class A uses less than 107% of that. In practice it depends on temperature, time and how often the door is opened.` },
        { q: 'Does a fan oven use less?', a: `Labels show consumption in conventional mode and in forced-air convection mode, and the second is usually lower because it spreads the heat and lets you cook at a lower temperature. Check both figures on your model’s label or its entry in the EU’s EPREL database.` },
        { q: 'Is cooking in the evening more expensive?', a: `On weekdays 18:00 to 22:00 is the peak period, with the highest tolls and charges, and it often matches the market’s dearest hours. Today a cycle at 9 pm costs ${h.eur(v.cena, 2)} and at the best time ${h.eur(v.m.coste, 2)}. At weekends every hour is off-peak.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Reference consumption by class</h2>
${h.table(['Class', 'Maximum index', `kWh per cycle (${h.num(v.A.volumen_l)} litres)`], Object.entries(v.A.eei_max).map(([c, i]) => [c, h.num(i as number), h.num(h.M.kwhHorno(v.A.volumen_l, c), 3)]), 'Standard consumption 0.0042 × volume + 0.55 kWh, Delegated Regulation (EU) 65/2014, annex II.', ['l', 'r', 'r'])}
<p>The oven is the opposite of the dishwasher: you cannot set it for 3 am, because you use it when you eat. What you can do is keep long bakes for the weekend, when Saturday and Sunday pay off-peak tolls, or for the middle of a sunny day. The calculator’s chart shows the day you pick and marks the best slot for the length you enter.</p>
<p>Watch the power too: oven and induction hob together can exceed your contracted power and trip the switch. The ${h.a('potencia', 'contracted power')} page works out what moving up or down a step costs.</p>`;
    },
  },
});
