import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';

/** Coste de poner la lavadora según la hora, con el consumo de la etiqueta energética UE. */
const V = (h: Helpers) => {
  const A = h.P.aparatos.lavadora;
  const hoy = h.R.resumenDia(0);
  const precios = hoy.horas.map((x) => x.ttc);
  const dur = A.duracion_min / 60;
  const sce = h.M.sceLavadora(A.capacidad_kg);
  const kA = h.M.kwhLavadora(A.capacidad_kg, 'A'), kC = h.M.kwhLavadora(A.capacidad_kg, 'C'), kE = h.M.kwhLavadora(A.capacidad_kg, 'E');
  const m = h.M.mejorInicio(precios, dur, kC);
  const anual = (c: number) => c * 4 * 52;
  return { A, hoy, dur, sce, kA, kC, kE, m, anual, mA: h.M.mejorInicio(precios, dur, kA) };
};

export default defineGuide({
  id: 'lavadora',
  group: 'aparato',
  order: 1,
  tool: 'aparato',
  toolProps: { aparato: 'lavadora' },
  related: ['lavavajillas', 'baratas', 'finde', 'manana'],
  sources: ['ueEtiquetaLavadora', 'esiosPvpc', 'ley38Iee'],
  es: {
    slug: 'coste-poner-lavadora',
    nav: 'Cuánto cuesta poner la lavadora',
    card: 'Lo que cuesta un lavado a cada hora de hoy o mañana, y la mejor hora para programarla.',
    title: 'Coste poner lavadora 2026: precio de un lavado hora a hora',
    description: 'Cuánto cuesta poner la lavadora hoy: el precio de un lavado a cada hora con el PVPC 2026 e impuestos, según tu clase energética, y la mejor hora para ponerla.',
    h1: 'Cuánto cuesta poner la lavadora hoy',
    intro: 'Elige la capacidad, la clase energética y la hora: te damos el coste del lavado y la hora en que sale más barato.',
    resume: (h) => {
      const v = V(h);
      return `Una lavadora de ${h.num(v.A.capacidad_kg)} kg de clase C gasta como mucho ${h.num(v.kC, 3)} kWh en el programa eco 40-60, el que mide la etiqueta energética europea. Hoy, ${h.dia(v.hoy.fecha)}, ese lavado cuesta ${h.eur(v.m.coste, 2)} con impuestos si empieza a las ${h.M.reloj(v.m.inicio)}, la mejor hora, y ${h.eur(v.m.peor, 2)} si empieza a las ${h.M.reloj(v.m.peorInicio)}, la peor. Con cuatro lavados por semana durante un año, la diferencia entre programarla bien o mal es de unos ${h.eur(v.anual(v.m.peor - v.m.coste), 0)}. Una lavadora de clase A del mismo tamaño gasta como máximo ${h.num(v.kA, 3)} kWh, y su mejor lavado de hoy sale a ${h.eur(v.mA.coste, 2)}. El consumo sale de la fórmula del Reglamento Delegado (UE) 2019/2014, en el límite superior de cada clase; si tu etiqueta da otra cifra, cambia la clase o la capacidad. Los lavados a 60 °C o más largos gastan más que el eco.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: '¿Cuánto consume una lavadora por lavado?', a: `Depende de su capacidad y de su clase. Según la fórmula de la etiqueta europea, una de ${h.num(v.A.capacidad_kg)} kg tiene un consumo de referencia de ${h.num(v.sce, 3)} kWh por ciclo; la clase A gasta como mucho el 52 % de eso (${h.num(v.kA, 3)} kWh) y la clase E hasta el 91 % (${h.num(v.kE, 3)} kWh), siempre en el programa eco 40-60.` },
        { q: '¿Dónde miro el consumo real de mi lavadora?', a: `En la etiqueta energética: el número grande es el consumo en kWh cada 100 ciclos del programa eco 40-60. Divídelo entre 100 y tendrás el de un lavado. Si no tienes la etiqueta, el código QR lleva a la ficha del modelo en la base de datos europea EPREL.` },
        { q: '¿Es mejor lavar por la noche?', a: `No siempre. La noche paga los peajes y cargos más bajos, pero en días de sol el mediodía puede ser más barato todavía. Hoy la mejor hora para un lavado de ${h.num(v.dur, 0)} horas es las ${h.M.reloj(v.m.inicio)}. La calculadora lo recalcula para mañana en cuanto Red Eléctrica publica los precios.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Lo que gasta cada clase</h2>
${h.table(['Clase energética', 'Índice máximo', `kWh por lavado (${h.num(v.A.capacidad_kg)} kg)`], Object.entries(v.A.eei_max).map(([c, i]) => [c, h.num(i as number), h.num(h.M.kwhLavadora(v.A.capacidad_kg, c), 3)]), 'Programa eco 40-60. Consumo normalizado × índice máximo de la clase, Reglamento Delegado (UE) 2019/2014.', ['l', 'r', 'r'])}
<p>Buena parte de la energía de un lavado se va en calentar el agua, y por eso el programa y la temperatura pesan más que la marca. Un programa frío o el eco a 40 °C gastan mucho menos que un algodón a 60 °C. Lo que la hora cambia es el precio de cada kWh: la misma energía cuesta más o menos según cuándo arranca la máquina.</p>
<p>Si tu lavadora tiene inicio diferido, mira el precio de ${h.a('manana', 'mañana')} por la noche y déjala programada. Para el lavavajillas, el cálculo es el mismo con otra fórmula de consumo: está en su ${h.a('lavavajillas', 'página propia')}.</p>`;
    },
  },
  en: {
    slug: 'washing-machine-cost',
    nav: 'Washing machine running cost',
    card: 'What a wash costs at each hour today or tomorrow, and the best time to set it.',
    title: 'Washing Machine Cost Spain 2026: Price per Wash by the Hour',
    description: 'What a washing machine costs to run in Spain today: one wash at each hour on the 2026 PVPC with taxes, by energy class, and the best start time to set.',
    h1: 'What a washing machine costs to run today in Spain',
    intro: 'Pick the capacity, the energy class and the start time: you get the cost of the wash and the hour when it is cheapest.',
    resume: (h) => {
      const v = V(h);
      return `An ${h.num(v.A.capacidad_kg)} kg class C washing machine uses at most ${h.num(v.kC, 3)} kWh on the eco 40-60 programme, the one the EU energy label measures. Today, ${h.dia(v.hoy.fecha)}, that wash costs ${h.eur(v.m.coste, 2)} including taxes if it starts at ${h.M.reloj(v.m.inicio)}, the best time, and ${h.eur(v.m.peor, 2)} if it starts at ${h.M.reloj(v.m.peorInicio)}, the worst. At four washes a week for a year, the gap between getting the timing right and wrong is about ${h.eur(v.anual(v.m.peor - v.m.coste), 0)}. A class A machine of the same size uses at most ${h.num(v.kA, 3)} kWh, and its best wash today costs ${h.eur(v.mA.coste, 2)}. Energy use comes from the formula in Delegated Regulation (EU) 2019/2014, at the top of each class; if your label shows a different figure, change the class or capacity. Hotter or longer programmes use more than eco.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'How much electricity does a wash use?', a: `It depends on capacity and class. Under the EU label formula, a ${h.num(v.A.capacidad_kg)} kg machine has a reference use of ${h.num(v.sce, 3)} kWh per cycle; class A uses at most 52% of that (${h.num(v.kA, 3)} kWh) and class E up to 91% (${h.num(v.kE, 3)} kWh), always on the eco 40-60 programme.` },
        { q: 'Where do I find my machine’s real consumption?', a: `On the energy label: the large number is kWh per 100 cycles of the eco 40-60 programme. Divide by 100 for one wash. If you have lost the label, its QR code leads to the model’s entry in the EU’s EPREL product database.` },
        { q: 'Is it better to wash at night?', a: `Not always. Nights carry the lowest tolls and charges, but on sunny days midday can be cheaper still. Today the best start for a ${h.num(v.dur, 0)}-hour wash is ${h.M.reloj(v.m.inicio)}. The calculator redoes it for tomorrow as soon as Red Eléctrica publishes the prices.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>What each class uses</h2>
${h.table(['Energy class', 'Maximum index', `kWh per wash (${h.num(v.A.capacidad_kg)} kg)`], Object.entries(v.A.eei_max).map(([c, i]) => [c, h.num(i as number), h.num(h.M.kwhLavadora(v.A.capacidad_kg, c), 3)]), 'Eco 40-60 programme. Standard consumption × class maximum index, Delegated Regulation (EU) 2019/2014.', ['l', 'r', 'r'])}
<p>Much of a wash’s energy goes into heating water, which is why programme and temperature matter more than the brand. A cold programme or eco at 40 °C uses far less than cottons at 60 °C. What the hour changes is the price of each kWh: the same energy costs more or less depending on when the machine starts.</p>
<p>If your machine has a delay timer, check ${h.a('manana', 'tomorrow’s price')} in the evening and leave it set. For the dishwasher the sum is the same with a different consumption formula, on its ${h.a('lavavajillas', 'own page')}.</p>`;
    },
  },
});
