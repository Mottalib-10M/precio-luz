import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';

/** Coste del lavavajillas según la hora, con la fórmula de la etiqueta energética UE (Reglamento 2019/2017). */
const V = (h: Helpers) => {
  const A = h.P.aparatos.lavavajillas;
  const hoy = h.R.resumenDia(0);
  const precios = hoy.horas.map((x) => x.ttc);
  const dur = A.duracion_min / 60;
  const spec = h.M.specLavavajillas(A.servicios);
  const kD = h.M.kwhLavavajillas(A.servicios, 'D'), kB = h.M.kwhLavavajillas(A.servicios, 'B');
  const m = h.M.mejorInicio(precios, dur, kD), mB = h.M.mejorInicio(precios, dur, kB);
  const noche = h.M.costeTramo(precios, 22, Math.min(dur, 2), kD * Math.min(dur, 2) / dur);
  return { A, hoy, dur, spec, kD, kB, m, mB, noche, compacto: h.M.specLavavajillas(9) };
};

export default defineGuide({
  id: 'lavavajillas',
  group: 'aparato',
  order: 2,
  tool: 'aparato',
  toolProps: { aparato: 'lavavajillas' },
  related: ['lavadora', 'horno', 'baratas', 'periodos'],
  sources: ['ueEtiquetaLavavajillas', 'esiosPvpc', 'cnmcCircular3_2020'],
  es: {
    slug: 'coste-lavavajillas',
    nav: 'Cuánto cuesta el lavavajillas',
    card: 'El coste de un lavado del lavavajillas a cada hora y el mejor momento para ponerlo.',
    title: 'Coste lavavajillas 2026: precio de cada lavado según la hora',
    description: 'Cuánto cuesta poner el lavavajillas en 2026: el precio de un programa eco a cada hora de hoy o mañana con el PVPC e impuestos, según servicios y clase.',
    h1: 'Cuánto cuesta poner el lavavajillas',
    intro: 'Indica los servicios, la clase y la duración del programa. El simulador busca la hora de inicio más barata.',
    resume: (h) => {
      const v = V(h);
      return `Un lavavajillas de ${h.num(v.A.servicios)} servicios de clase D gasta como máximo ${h.num(v.kD, 3)} kWh en el programa eco, según la fórmula del Reglamento Delegado (UE) 2019/2017 que sirve para su etiqueta energética. Con el PVPC de hoy, ${h.dia(v.hoy.fecha)}, un programa de ${h.num(v.dur, 1)} horas cuesta ${h.eur(v.m.coste, 2)} con impuestos si arranca a las ${h.M.reloj(v.m.inicio)} y ${h.eur(v.m.peor, 2)} si arranca a las ${h.M.reloj(v.m.peorInicio)}. Uno de clase B del mismo tamaño gasta como mucho ${h.num(v.kB, 3)} kWh y su mejor lavado sale a ${h.eur(v.mB.coste, 2)}. El programa eco es largo porque lava a menos temperatura durante más tiempo, y esa duración cuenta: el simulador reparte la energía por todo el programa y paga cada tramo a su hora, de modo que la hora de inicio más barata no es siempre la de la hora suelta más barata del día.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: '¿Cuánto gasta un lavavajillas por lavado?', a: `Para uno de ${h.num(v.A.servicios)} servicios, el consumo de referencia de la etiqueta es ${h.num(v.spec, 3)} kWh por ciclo, y la clase indica qué fracción gasta como máximo: menos del 32 % en clase A, menos del 50 % en clase D. Un compacto de 9 servicios tiene una referencia de ${h.num(v.compacto, 3)} kWh.` },
        { q: '¿Merece la pena poner el lavavajillas lleno?', a: `Sí. El programa calienta y bombea el agua y seca la carga lleve los platos que lleve, así que dos lavados a media carga gastan más energía que uno lleno. La etiqueta europea mide el programa eco precisamente con la carga completa de servicios que anuncia el fabricante.` },
        { q: '¿El programa rápido gasta menos?', a: `No necesariamente. Un programa corto termina antes, pero suele calentar más el agua para limpiar en menos tiempo. La etiqueta europea solo mide el eco. Si usas otro programa, el consumo real puede ser mayor; escribe la duración real en el simulador y elige una clase peor para acercarte.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Consumo por clase</h2>
${h.table(['Clase', 'Índice máximo', `kWh por lavado (${h.num(v.A.servicios)} servicios)`], Object.entries(v.A.eei_max).map(([c, i]) => [c, h.num(i as number), h.num(h.M.kwhLavavajillas(v.A.servicios, c), 3)]), 'Programa eco. Consumo de referencia 0,025 × servicios + 1,350 kWh, Reglamento Delegado (UE) 2019/2017.', ['l', 'r', 'r'])}
<p>El lavavajillas es el aparato ideal para el inicio diferido: se carga después de cenar y no importa si termina a las dos o a las seis. En días laborables, las horas de 0 a 8 pagan los peajes y cargos más bajos, como explica la guía de ${h.a('periodos', 'periodos horarios')}; con mucho sol, a veces gana el mediodía. El simulador compara todas las horas de inicio en tramos de 15 minutos y te da la buena.</p>
<p>Si además usas el horno a diario, mira cuánto cuesta en la ${h.a('horno', 'página del horno eléctrico')}: suele coincidir con la hora punta de la cena.</p>`;
    },
  },
  en: {
    slug: 'dishwasher-cost',
    nav: 'Dishwasher running cost',
    card: 'What one dishwasher cycle costs at each hour, and the best time to start it.',
    title: 'Dishwasher Cost Spain 2026: Price per Cycle by Start Time',
    description: 'What a dishwasher costs to run in Spain in 2026: one eco cycle at each hour today or tomorrow on the PVPC with taxes, by place settings and energy class.',
    h1: 'What a dishwasher costs to run in Spain',
    intro: 'Enter the place settings, the class and the programme length. The calculator finds the cheapest start time.',
    resume: (h) => {
      const v = V(h);
      return `A ${h.num(v.A.servicios)}-place class D dishwasher uses at most ${h.num(v.kD, 3)} kWh on the eco programme, under the formula in Delegated Regulation (EU) 2019/2017 behind its energy label. On today’s PVPC, ${h.dia(v.hoy.fecha)}, a ${h.num(v.dur, 1)}-hour programme costs ${h.eur(v.m.coste, 2)} including taxes if it starts at ${h.M.reloj(v.m.inicio)} and ${h.eur(v.m.peor, 2)} if it starts at ${h.M.reloj(v.m.peorInicio)}. A class B model of the same size uses at most ${h.num(v.kB, 3)} kWh, and its best cycle today costs ${h.eur(v.mB.coste, 2)}. The eco programme is long because it washes at a lower temperature for more time, and that length matters: the calculator spreads the energy across the whole programme and charges each part at its own hour, so the cheapest start is not always the day’s single cheapest hour. Change the place settings, the class or the length to match your own machine’s label.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'How much electricity does a dishwasher use per cycle?', a: `For a ${h.num(v.A.servicios)}-place model the label’s reference consumption is ${h.num(v.spec, 3)} kWh per cycle, and the class shows the maximum share it uses: under 32% for class A, under 50% for class D. A compact 9-place machine has a reference of ${h.num(v.compacto, 3)} kWh.` },
        { q: 'Is it worth running the dishwasher only when full?', a: `Yes. The programme heats and pumps water and dries the load however many plates are inside, so two half-load cycles use more energy than one full one. The EU label measures the eco programme with exactly the full set of place settings the maker states.` },
        { q: 'Does the quick programme use less?', a: `Not necessarily. A short programme finishes sooner but usually heats the water more to clean in less time. The EU label only measures eco. If you use another programme the real consumption may be higher; enter the real length in the calculator and pick a worse class to get closer.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Consumption by class</h2>
${h.table(['Class', 'Maximum index', `kWh per cycle (${h.num(v.A.servicios)} place settings)`], Object.entries(v.A.eei_max).map(([c, i]) => [c, h.num(i as number), h.num(h.M.kwhLavavajillas(v.A.servicios, c), 3)]), 'Eco programme. Reference consumption 0.025 × place settings + 1.350 kWh, Delegated Regulation (EU) 2019/2017.', ['l', 'r', 'r'])}
<p>The dishwasher is the ideal appliance for a delayed start: load it after dinner and it does not matter whether it finishes at 2 am or 6 am. On weekdays the hours from midnight to 8 am carry the lowest tolls and charges, as the ${h.a('periodos', 'time-of-use periods')} guide explains; on very sunny days midday sometimes wins. The calculator tests every start time in 15-minute steps and gives you the right one.</p>
<p>If you also use the oven every day, see what it costs on the ${h.a('horno', 'electric oven page')}: it tends to fall in the dinner-time peak.</p>`;
    },
  },
});
