import { defineGuide } from '../../lib/guide-types';
import type { Helpers } from '../../lib/guide-types';

/** Cargar el coche eléctrico en casa: coste de una recarga según la hora y el punto de carga. */
const V = (h: Helpers) => {
  const C = h.P.aparatos.coche;
  const hoy = h.R.resumenDia(0), man = h.R.resumenDia(1);
  const precios = [...hoy.horas.map((x) => x.ttc), ...man.horas.map((x) => x.ttc)];
  const r23 = h.M.recarga(C.bateria_kwh, C.desde_pct, C.hasta_pct, 2.3), r74 = h.M.recarga(C.bateria_kwh, C.desde_pct, C.hasta_pct, 7.4);
  const noche23 = h.M.costeTramo(precios, 22, r23.horas, r23.kwh);
  const m74 = h.M.mejorInicio(precios.slice(0, 24 + Math.ceil(r74.horas)), r74.horas, r74.kwh);
  const tarde74 = h.M.costeTramo(precios, 19, r74.horas, r74.kwh);
  const valleKw = h.M.POT_P2_PVPC;
  return { C, hoy, r23, r74, noche23, m74, tarde74, valleKw };
};

export default defineGuide({
  id: 'coche',
  group: 'aparato',
  order: 4,
  tool: 'aparato',
  toolProps: { aparato: 'coche' },
  related: ['potencia', 'manana', 'baratas', 'periodos'],
  sources: ['esiosPvpc', 'cnmcCircular3_2020', 'cnmcPeajes2026', 'tedCargos2026'],
  es: {
    slug: 'cargar-coche-electrico-precio',
    nav: 'Cargar el coche eléctrico',
    card: 'Lo que cuesta cargar el coche en casa según la hora y el enchufe o el wallbox.',
    title: 'Cargar coche eléctrico precio 2026: coste en casa con PVPC',
    description: 'Cuánto cuesta cargar el coche eléctrico en casa con el PVPC 2026: precio de la recarga según la hora, la batería y el punto de carga, con los impuestos.',
    h1: 'Cuánto cuesta cargar el coche eléctrico en casa',
    intro: 'Pon la batería, cuánto quieres cargar y tu punto de carga. Te decimos lo que cuesta y a qué hora conviene empezar.',
    resume: (h) => {
      const v = V(h);
      return `Cargar del ${v.C.desde_pct} al ${v.C.hasta_pct} % una batería de ${h.num(v.C.bateria_kwh)} kWh supone meter ${h.num(v.r23.kwh)} kWh. Con un enchufe doméstico de ${h.num(2.3, 1)} kW la recarga dura ${h.num(v.r23.horas, 1)} horas y, empezando a las 22:00 de hoy, ${h.dia(v.hoy.fecha)}, cuesta ${h.eur(v.noche23, 2)} con impuestos al precio PVPC de cada hora. Con un wallbox de ${h.num(7.4, 1)} kW se hace en ${h.num(v.r74.horas, 1)} horas, y entonces sí se puede elegir la hora: la mejor salida es a las ${h.M.reloj(v.m74.inicio)}, por ${h.eur(v.m74.coste, 2)}, frente a ${h.eur(v.tarde74, 2)} si se enchufa al llegar a casa a las 19:00. El simulador usa el precio de mañana para la parte de la recarga que pasa de medianoche, o una estimación si aún no está publicado. No incluye las pérdidas del cargador y de la batería, que hacen que salga algo más energía de la red que la que entra en el coche.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: '¿Cuánto cuesta cargar un coche eléctrico en casa?', a: `Lo que entra en la batería por el precio de cada hora en que carga. Hoy, ${h.num(v.r23.kwh)} kWh (del ${v.C.desde_pct} al ${v.C.hasta_pct} % de ${h.num(v.C.bateria_kwh)} kWh) cuestan ${h.eur(v.noche23, 2)} con impuestos cargando desde las 22:00 con un enchufe de 2,3 kW. Con wallbox, empezando a la mejor hora, ${h.eur(v.m74.coste, 2)}.` },
        { q: '¿Necesito más potencia contratada para el coche?', a: `Si cargas de noche, basta con subir la potencia de valle (P2), que en ${h.P.year} cuesta ${h.num(v.valleKw, 3)} € por kW y año sin impuestos, frente a ${h.num(h.M.POT_P1_PVPC, 2)} € el kW de punta-llano. Con un wallbox de 7,4 kW y la casa encendida, la potencia de valle tiene que cubrir los dos consumos.` },
        { q: '¿Es mejor una tarifa especial para coche eléctrico?', a: `Algunas comercializadoras del mercado libre ofrecen un precio muy bajo en ciertas horas de la noche. Compáralo con el PVPC de esas mismas horas, impuestos incluidos, y con tu consumo del resto del día, que suele salir más caro en esas tarifas. El comparador PVPC o mercado libre hace la cuenta.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Enchufe o wallbox</h2>
${h.table(['Punto de carga', 'Potencia', `Horas para ${h.num(v.r23.kwh)} kWh`], h.P.aparatos.coche.potencias_tipicas_kw.map((k, i) => [['Enchufe doméstico (10 A)', 'Enchufe reforzado (16 A)', 'Wallbox monofásico (32 A)'][i], `${h.num(k, 1)} kW`, h.num(h.M.recarga(v.C.bateria_kwh, v.C.desde_pct, v.C.hasta_pct, k).horas, 1)]), 'Potencia = intensidad × 230 V. Sin pérdidas de carga.', ['l', 'r', 'r'])}
<p>Con un enchufe normal, una recarga grande ocupa casi toda la noche y apenas deja elegir: se carga en las horas que hay. Con un wallbox, la misma energía cabe en unas pocas horas y se puede colocar en el tramo más barato, que en días de mucho sol puede estar a mediodía si el coche está en casa. En los dos casos, la guía de ${h.a('periodos', 'periodos horarios')} explica por qué de 0 a 8 horas la parte regulada del precio es mínima.</p>
<p>La ${h.a('potencia', 'potencia contratada')} es la otra mitad de la cuenta: subir solo la de valle cuesta poco y evita que salte el interruptor con el coche y la casa a la vez.</p>`;
    },
  },
  en: {
    slug: 'ev-charging-cost',
    nav: 'EV home charging cost',
    card: 'What charging your car at home costs by hour, with a socket or a wallbox.',
    title: 'EV Charging Cost Spain 2026: Home Charging on the PVPC',
    description: 'What charging an electric car at home costs in Spain on the 2026 PVPC: the price of a charge by start time, battery and charge point, with tax included.',
    h1: 'What charging an electric car at home costs in Spain',
    intro: 'Enter the battery, how much to charge and your charge point. We tell you what it costs and when to start.',
    resume: (h) => {
      const v = V(h);
      return `Charging a ${h.num(v.C.bateria_kwh)} kWh battery from ${v.C.desde_pct}% to ${v.C.hasta_pct}% means putting in ${h.num(v.r23.kwh)} kWh. On a 2.3 kW household socket the charge takes ${h.num(v.r23.horas, 1)} hours and, starting at 10 pm today, ${h.dia(v.hoy.fecha)}, it costs ${h.eur(v.noche23, 2)} including taxes at each hour’s PVPC price. With a 7.4 kW wallbox it takes ${h.num(v.r74.horas, 1)} hours, and then you really can pick the time: the best start is ${h.M.reloj(v.m74.inicio)}, for ${h.eur(v.m74.coste, 2)}, against ${h.eur(v.tarde74, 2)} if you plug in on getting home at 7 pm. The calculator uses tomorrow’s price for the part of the charge that runs past midnight, or an estimate if it is not out yet. Charger and battery losses are not included; they mean slightly more energy leaves the grid than ends up in the car. Battery size and charge levels are yours to change.`;
    },
    faqs: (h) => {
      const v = V(h);
      return [
        { q: 'How much does it cost to charge an electric car at home?', a: `The energy going into the battery times each charging hour’s price. Today, ${h.num(v.r23.kwh)} kWh (${v.C.desde_pct}% to ${v.C.hasta_pct}% of ${h.num(v.C.bateria_kwh)} kWh) costs ${h.eur(v.noche23, 2)} with taxes charging from 10 pm on a 2.3 kW socket. With a wallbox, starting at the best time, ${h.eur(v.m74.coste, 2)}.` },
        { q: 'Do I need more contracted power for the car?', a: `If you charge at night, raising the off-peak power (P2) is enough; in ${h.P.year} it costs ${h.num(v.valleKw, 3)} € per kW per year before tax, against ${h.num(h.M.POT_P1_PVPC, 2)} € for a peak-standard kW. With a 7.4 kW wallbox and the house running, off-peak power has to cover both loads.` },
        { q: 'Is a special EV tariff better?', a: `Some market retailers offer a very low price in certain night hours. Compare it with the PVPC for those same hours, taxes included, and with your consumption for the rest of the day, which tends to cost more on those tariffs. The PVPC versus fixed price comparison does the sums.` },
      ];
    },
    body: (h) => {
      const v = V(h);
      return `<h2>Socket or wallbox</h2>
${h.table(['Charge point', 'Power', `Hours for ${h.num(v.r23.kwh)} kWh`], h.P.aparatos.coche.potencias_tipicas_kw.map((k, i) => [['Household socket (10 A)', 'Reinforced socket (16 A)', 'Single-phase wallbox (32 A)'][i], `${h.num(k, 1)} kW`, h.num(h.M.recarga(v.C.bateria_kwh, v.C.desde_pct, v.C.hasta_pct, k).horas, 1)]), 'Power = current × 230 V. No charging losses.', ['l', 'r', 'r'])}
<p>On an ordinary socket a big charge fills most of the night and leaves little choice: it charges in whatever hours there are. With a wallbox the same energy fits into a few hours and can go into the cheapest slot, which on very sunny days may be midday if the car is at home. Either way, the ${h.a('periodos', 'time-of-use periods')} guide explains why the regulated part of the price is minimal from midnight to 8 am.</p>
<p>${h.a('potencia', 'Contracted power')} is the other half of the sum: raising only the off-peak power costs little and stops the switch tripping with the car and the house running together.</p>`;
    },
  },
});
