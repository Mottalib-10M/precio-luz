/**
 * Textos de la portada (es / en). Cada cifra sale del motor, de los parámetros o de los datos del día
 * (h.R), nunca escrita a mano: el texto se rehace en cada build, después de que Red Eléctrica publique.
 */
import type { Helpers, FAQ } from '../lib/guide-types';

interface HomeText { title: string; description: string; h1: string; intro: string; resume: (h: Helpers) => string; faqs: (h: Helpers) => FAQ[]; body: (h: Helpers) => string }

const datos = (h: Helpers) => {
  const hoy = h.R.resumenDia(0), man = h.R.resumenDia(1);
  const imp = h.M.impuestosDelDia(hoy.fecha);
  const lav = h.M.kwhLavadora(h.P.aparatos.lavadora.capacidad_kg, h.P.aparatos.lavadora.clase);
  const precios = hoy.horas.map((x) => x.ttc);
  const lavBarata = h.M.mejorInicio(precios, 2, lav);
  const reg = h.M.REGULADO_ENERGIA;
  const ejemploSin = hoy.mediaSin;
  const ieeEj = ejemploSin * imp.iee;
  const ivaEj = (ejemploSin + ieeEj) * imp.iva;
  const pot = h.M.potenciaAnual(4.6);
  const mes = h.R.MESES[h.R.MESES.length - 1];
  const mesAnt = h.R.MESES.find((m) => m.mes === `${Number(mes.mes.slice(0, 4)) - 1}${mes.mes.slice(4)}`);
  return { hoy, man, imp, lav, lavBarata, reg, ejemploSin, ieeEj, ivaEj, pot, mes, mesAnt, ratio: hoy.max.ttc / Math.max(hoy.min.ttc, 1e-6) };
};
const pct = (h: Helpers, x: number, d = 2) => `${h.num(x * 100, d)} %`;
const nombreMes = (h: Helpers, m: string) => new Date(`${m}-15T12:00:00Z`).toLocaleDateString(h.lang === 'es' ? 'es-ES' : 'en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export const HOME: Record<'es' | 'en', HomeText> = {
  es: {
    title: 'Precio de la luz hoy 2026: PVPC con impuestos hora a hora',
    description: 'Precio de la luz hoy y mañana: las 24 horas del PVPC con IVA e impuesto eléctrico, la hora más barata y el coste de tus aparatos. Datos de Red Eléctrica.',
    h1: 'Precio de la luz hoy: el PVPC con impuestos, hora a hora',
    intro: 'Lo que pagas de verdad por cada kWh hoy, con IVA e impuesto eléctrico, a partir del archivo oficial de Red Eléctrica.',
    resume: (h) => {
      const v = datos(h);
      return `Hoy, ${h.dia(v.hoy.fecha)}, el kilovatio hora de la tarifa regulada PVPC cuesta de media ${h.kwh(v.hoy.media)} con impuestos en la Península y Baleares: la hora más barata es la de ${h.tramo(v.hoy.min.h)}, a ${h.kwh(v.hoy.min.ttc)}, y la más cara la de ${h.tramo(v.hoy.max.h)}, a ${h.kwh(v.hoy.max.ttc)}, ${h.num(v.ratio, 1)} veces más. Son los 24 precios que publica Red Eléctrica en su archivo oficial del PVPC 2.0TD, que ya incluyen la energía, los peajes de la CNMC y los cargos del Ministerio, a los que sumamos el impuesto especial sobre la electricidad (${pct(h, v.imp.iee, 2)}) y el IVA (${pct(h, v.imp.iva, 0)}) en vigor ese día. Casi todas las páginas que se ven en Google dan el precio sin impuestos; aquí verás los dos y podrás calcular, sin dejar ningún teléfono, cuánto te cuesta poner la lavadora, el horno o cargar el coche a cada hora, y si te compensa un precio fijo del mercado libre.`;
    },
    faqs: (h) => {
      const v = datos(h);
      return [
        { q: '¿A qué hora se publica el precio de la luz de mañana?', a: `Red Eléctrica publica los 24 precios del PVPC del día siguiente cada tarde antes de las 20:15, como le obliga el Real Decreto 216/2014. Esta página se regenera sola poco después, a partir de las 20:40 y otra vez una hora más tarde, y el día de mañana aparece en la pestaña «Mañana». Antes de esa hora mostramos un precio medio estimado y lo decimos claramente.` },
        { q: '¿El precio de la tabla incluye impuestos?', a: `El archivo de Red Eléctrica da el término de energía sin impuestos. Nosotros le sumamos el impuesto eléctrico (${pct(h, v.imp.iee, 2)}) y el IVA (${pct(h, v.imp.iva, 0)}), o el IGIC al 0 % en Canarias para viviendas de hasta 10 kW. La opción «Excluidos» muestra la cifra de Red Eléctrica tal cual.` },
        { q: '¿Por qué el precio sale con 24 horas y no por cuartos de hora?', a: `El mercado mayorista fija un precio cada 15 minutos desde el 1 de octubre de 2025, pero el PVPC que se factura sigue teniendo 24 precios al día: los contadores de los hogares registran el consumo por horas. Los 96 cuartos del mercado los puedes ver en la página de ${'cuartos de hora'}.` },
        { q: '¿Cuál es la hora más barata para poner la lavadora hoy?', a: `Con los precios de hoy, un lavado de ${h.num(v.lav, 2)} kWh (lavadora de 8 kg, clase C, programa eco) sale más barato si empieza a las ${h.M.reloj(v.lavBarata.inicio)}: ${h.eur(v.lavBarata.coste, 2)} con impuestos. La calculadora de esta página lo recalcula con la hora y el aparato que elijas.` },
        { q: '¿El precio es el mismo en toda España?', a: `El término de energía del PVPC es el mismo en la Península, Baleares y Canarias. Cambian los impuestos: en Canarias no se paga IVA sino IGIC, que es del 0 % para la vivienda con hasta 10 kW. Ceuta y Melilla tienen su propio precio, porque allí la punta y el llano empiezan una hora más tarde, y pagan IPSI al 1 % en lugar de IVA, según la ordenanza fiscal de cada ciudad. Elige tu territorio en «Dónde vives».` },
        { q: '¿Qué parte del precio no depende del mercado?', a: `Los peajes de la CNMC y los cargos del Ministerio del término de energía: en ${h.P.year} suman ${h.kwh(v.reg.P1, 4)} en punta, ${h.kwh(v.reg.P2, 4)} en llano y ${h.kwh(v.reg.P3, 4)} en valle, sin impuestos. Por eso el valle, de 0 a 8 horas y todo el fin de semana, parte con ventaja.` },
        { q: '¿Estos precios sirven si tengo una tarifa del mercado libre?', a: `Solo si tu contrato es indexado al mercado. Con una tarifa de precio fijo pagas lo mismo a cualquier hora, y la tabla te sirve para comparar: el simulador de facturas calcula lo que habrías pagado en los últimos 30 días con el PVPC y con tu precio fijo.` },
      ];
    },
    body: (h) => {
      const v = datos(h);
      const P = h.P;
      const tramos = [...v.hoy.horas].sort((a, b) => a.ttc - b.ttc);
      return `<h2>El precio de hoy en cinco cifras</h2>
<p>La tabla de arriba recoge las ${v.hoy.horas.length} horas del ${h.dia(v.hoy.fecha)}. Para decidir rápido basta con cinco datos, todos con impuestos y en la Península:</p>
${h.table(['Dato', 'Hora', 'Precio con impuestos'], [
  ['Media del día', '24 horas', h.kwh(v.hoy.media)],
  ['Hora más barata', h.tramo(v.hoy.min.h), h.kwh(v.hoy.min.ttc)],
  ['Segunda más barata', h.tramo(tramos[1].h), h.kwh(tramos[1].ttc)],
  ['Hora más cara', h.tramo(v.hoy.max.h), h.kwh(v.hoy.max.ttc)],
  ['Mejor bloque de 3 horas seguidas', `desde las ${String(v.hoy.horas[v.hoy.bloque3.inicio].h).padStart(2, '0')}:00`, h.kwh(v.hoy.bloque3.media)],
], `PVPC 2.0TD del ${h.dia(v.hoy.fecha)}, Red Eléctrica, con impuesto eléctrico e IVA vigentes.`, ['l', 'l', 'r'])}
<p>La diferencia entre la hora más cara y la más barata no es un detalle: un aparato que gasta un kilovatio hora cuesta ${h.eur(v.hoy.max.ttc, 2)} en la peor hora y ${h.eur(v.hoy.min.ttc, 2)} en la mejor. Con una lavadora, un lavavajillas o la carga de un coche eléctrico, elegir la hora es la única forma de ahorrar que no exige cambiar de contrato.</p>

<h2>Por qué damos el precio con impuestos</h2>
<p>La cifra que publica Red Eléctrica es el término de energía antes de impuestos. Es correcta, pero no es lo que pagas: sobre cada kilovatio hora se aplica primero el impuesto especial sobre la electricidad y después el IVA, que en la factura de un hogar se calcula también sobre ese impuesto. Con la media de hoy el cálculo queda así:</p>
${h.table(['Concepto', '€/kWh'], [
  ['Término de energía del PVPC (Red Eléctrica)', h.num(v.ejemploSin, 4)],
  [`Impuesto eléctrico, ${pct(h, v.imp.iee, 5)}`, h.num(v.ieeEj, 4)],
  [`IVA, ${pct(h, v.imp.iva, 0)} sobre lo anterior`, h.num(v.ivaEj, 4)],
  ['Lo que pagas por cada kWh', h.num(v.ejemploSin + v.ieeEj + v.ivaEj, 4)],
], `Media del ${h.dia(v.hoy.fecha)}. Impuestos de la ${h.src('ley38Iee', 'Ley 38/1992')} y de la ${h.src('ley37Iva', 'Ley 37/1992')}.`, ['l', 'r'])}
<p>Un precio sin impuestos parece un ${h.num(((v.ieeEj + v.ivaEj) / v.ejemploSin) * 100, 0)} % más bajo de lo que es. Cuando una web compara ese número con la tarifa fija de una comercializadora, que suele anunciarse con impuestos, la comparación sale torcida. Aquí el selector «Impuestos: incluidos / excluidos» muestra las dos cifras, y todos los simuladores trabajan con la cifra completa.</p>
<p>Los tipos no han sido los mismos todo el año. El ${h.src('rdl7_2026', 'Real Decreto-ley 7/2026')} rebajó el IVA al 10 % para potencias inferiores a 10 kW y el impuesto eléctrico al 0,5 % del 22 de marzo al 31 de mayo de 2026; desde junio se aplican de nuevo el 21 % y el 5,11269632 %. El ${h.src('rdl25_2026', 'Real Decreto-ley 25/2026')} prevé volver a la rebaja en noviembre o diciembre si el IPC de la electricidad del INE sube más de un 15 % en septiembre u octubre. La calculadora aplica a cada día el tipo que le corresponde, y en el historial de meses cada mes lleva sus impuestos.</p>

<h2>Por qué el archivo oficial lo cambia todo</h2>
<p>Muchas páginas de precio de la luz copian a mano una tabla, la publican con la fecha del día y la dejan ahí. Hemos visto en Google páginas tituladas con la fecha de hoy que daban las cifras de hace once meses, una tabla de mañana vacía una semana después y una media del día que no coincidía con su propia tabla. Esta web no escribe ningún precio: un programa descarga cada tarde el archivo público del PVPC de ${h.src('esiosPvpc', 'e·sios, el sistema de información de Red Eléctrica')}, comprueba que la fecha del archivo es la que toca y reconstruye todas las páginas. Si un día el archivo no llega, la página no inventa nada: muestra un precio medio estimado con los días anteriores del mismo tipo y lo dice en un recuadro.</p>
<p>El mismo archivo trae, hora por hora, la parte de peajes y cargos y el perfil de consumo tipo que Red Eléctrica usa para los contadores. Gracias a eso podemos comprobar dos cosas que ninguna otra web comprueba: que el periodo de cada hora (punta, llano o valle) es el que dice la ${h.src('cnmcCircular3_2020', 'Circular 3/2020 de la CNMC')}, y que los peajes y cargos que Red Eléctrica incluye coinciden al céntimo de milésima con los publicados en el BOE para ${P.year}. Las pruebas automáticas del sitio lo verifican en todas las horas del año antes de cada publicación.</p>

<h2>Cuartos de hora: lo que cambió en 2025 y lo que no</h2>
<p>Desde el 1 de octubre de 2025 el mercado diario fija un precio para cada cuarto de hora, 96 al día. Eso no ha llegado a la factura de los hogares con PVPC: el archivo oficial sigue teniendo 24 filas y los contadores domésticos miden por horas. Lo que paga un consumidor con tarifa regulada es, por tanto, el precio de cada hora. Si tienes una tarifa indexada del mercado libre, o simplemente quieres ver cuánto se mueve el mayorista dentro de una misma hora, la página de ${h.a('cuartos', 'precio por cuartos de hora')} muestra los 96 precios del día junto al PVPC horario.</p>

<h2>De dónde sale cada céntimo</h2>
<p>El precio de cada hora suma tres bloques. El primero es la energía: desde ${P.year} el ${h.num(P.futuros_pvpc.peso_2026 * 100, 0)} % se compra con productos a plazo (mensuales, trimestrales y anuales) y el resto en el mercado diario, según la metodología del Real Decreto 446/2023 que explica el ${h.src('mitecoRd446', 'Ministerio para la Transición Ecológica')}. El segundo son los peajes de transporte y distribución, que fija la ${h.src('cnmcPeajes2026', 'CNMC')}. El tercero son los cargos del sistema, que fija el Ministerio en la ${h.src('tedCargos2026', 'Orden TED/1524/2025')} y que pagan las renovables con régimen retributivo, el déficit de años anteriores y el sobrecoste de las islas.</p>
${h.table(['Periodo 2.0TD', 'Cuándo', 'Peaje (CNMC)', 'Cargo (Ministerio)', 'Total regulado'], [
  ['Punta (P1)', 'laborables de 10 a 14 y de 18 a 22', h.num(P.peajes.energia_eur_kwh.P1, 6), h.num(P.cargos.energia_eur_kwh.P1, 6), h.num(v.reg.P1, 6)],
  ['Llano (P2)', 'laborables de 8 a 10, de 14 a 18 y de 22 a 24', h.num(P.peajes.energia_eur_kwh.P2, 6), h.num(P.cargos.energia_eur_kwh.P2, 6), h.num(v.reg.P2, 6)],
  ['Valle (P3)', 'de 0 a 8, fines de semana y festivos nacionales', h.num(P.peajes.energia_eur_kwh.P3, 6), h.num(P.cargos.energia_eur_kwh.P3, 6), h.num(v.reg.P3, 6)],
], `Término de energía, €/kWh sin impuestos, ${P.year}. Resolución de la CNMC de 18 de diciembre de 2025 y Orden TED/1524/2025.`, ['l', 'l', 'r', 'r', 'r'])}
<p>Esos importes regulados explican por qué la noche y el fin de semana suelen ser más baratos aunque el mercado esté caro: en valle la parte regulada es casi nula. Y explican también por qué el mediodía soleado puede ganar al valle: cuando la fotovoltaica hunde el precio de la energía, la parte que queda es la de los peajes y cargos del llano. Lo cuenta con detalle la guía de ${h.a('periodos', 'periodos horarios')}.</p>

<h2>Valores y parámetros ${P.year}</h2>
<p>Además del precio de cada hora, la factura del PVPC lleva una parte fija que no depende de cuándo consumes. Estos son los importes que usa el simulador, todos sacados del BOE:</p>
${h.table(['Concepto', 'Importe', 'Norma'], [
  ['Peaje de potencia punta-llano (P1)', `${h.num(P.peajes.potencia_eur_kw_ano.P1, 6)} €/kW·año`, 'Resolución CNMC 18/12/2025'],
  ['Cargo de potencia punta-llano (P1)', `${h.num(P.cargos.potencia_eur_kw_ano.P1, 6)} €/kW·año`, 'Orden TED/1524/2025'],
  ['Margen de comercialización del PVPC', `${h.num(P.comercializacion.margen_fijo_eur_kw_ano, 3)} €/kW·año`, 'Orden ETU/1948/2016'],
  ['Peaje + cargo de potencia valle (P2)', `${h.num(P.peajes.potencia_eur_kw_ano.P2 + P.cargos.potencia_eur_kw_ano.P2, 6)} €/kW·año`, 'CNMC y Orden TED/1524/2025'],
  ['Financiación del bono social', `${h.num(P.bono_social_financiacion.eur_cups_ano, 6)} €/año`, 'Orden TED/634/2026 (desde el 26/06/2026)'],
  ['Alquiler del contador inteligente', `${h.num(P.contador.alquiler_eur_mes, 2)} €/mes`, 'Orden ITC/3860/2007'],
  ['Impuesto especial sobre la electricidad', pct(h, v.imp.iee, 8), 'Ley 38/1992'],
  ['IVA (Península y Baleares)', pct(h, v.imp.iva, 0), 'Ley 37/1992'],
  ['IGIC (Canarias, vivienda hasta 10 kW)', '0 %', 'Decreto Legislativo 1/2025 de Canarias'],
  ['IPSI (Ceuta y Melilla, sustituye al IVA)', '1 %', 'Ordenanzas fiscales del IPSI de Ceuta (art. 33.Cuatro) y de Melilla (anexo 1)'],
], undefined, ['l', 'r', 'l'])}
<p>Con 4,6 kW contratados, solo la potencia cuesta ${h.eur(v.pot)} al año antes de impuestos. Es el motivo por el que revisar la ${h.a('potencia', 'potencia contratada')} suele ahorrar más que perseguir la hora barata.</p>

<h2>Ejemplos con los precios de hoy</h2>
<p>Lo que cuesta un uso de cada aparato si lo enciendes en la mejor y en la peor hora del ${h.dia(v.hoy.fecha)}, con impuestos. Consumos según la etiqueta energética de la Unión Europea, en el límite superior de la clase indicada:</p>
${(() => {
  const precios = v.hoy.horas.map((x) => x.ttc);
  const A = P.aparatos;
  const filas: Array<[string, number, number]> = [
    ['Lavadora 8 kg, clase C, eco 40-60', h.M.kwhLavadora(A.lavadora.capacidad_kg, A.lavadora.clase), A.lavadora.duracion_min / 60],
    ['Lavavajillas 13 servicios, clase D, eco', h.M.kwhLavavajillas(A.lavavajillas.servicios, A.lavavajillas.clase), A.lavavajillas.duracion_min / 60],
    ['Horno 65 litros, clase A, un ciclo', h.M.kwhHorno(A.horno.volumen_l, A.horno.clase), A.horno.duracion_min / 60],
  ];
  return h.table(['Aparato', 'kWh', 'Mejor hora', 'Peor hora'], filas.map(([n, k, d]) => { const m = h.M.mejorInicio(precios, d, k); return [n, h.num(k, 2), `${h.M.reloj(m.inicio)} · ${h.eur(m.coste, 2)}`, `${h.M.reloj(m.peorInicio)} · ${h.eur(m.peor, 2)}`]; }), `Calculado con el motor del sitio sobre el PVPC del ${h.dia(v.hoy.fecha)}.`, ['l', 'r', 'r', 'r']);
})()}
<p>Las cifras por uso son pequeñas; el ahorro aparece al cabo del año. Cuatro lavados a la semana durante 52 semanas son más de doscientos ciclos, y la diferencia entre la mejor y la peor hora se multiplica por ese número. Cada aparato tiene su página: ${h.a('lavadora', 'lavadora')}, ${h.a('lavavajillas', 'lavavajillas')}, ${h.a('horno', 'horno eléctrico')} y ${h.a('coche', 'coche eléctrico')}.</p>

<h2>Cómo pagar menos con el PVPC</h2>
<ol>
<li>Mira la tabla antes de encender lo que gasta mucho: horno, secadora, lavavajillas, termo o coche. Una hora verde suele costar menos de la mitad que una roja.</li>
<li>Programa el inicio diferido. Casi todas las lavadoras y lavavajillas permiten retrasar la salida varias horas, y el simulador te dice a qué hora conviene.</li>
<li>Aprovecha el fin de semana. Sábados y domingos todas las horas pagan peajes y cargos de valle; la ${h.a('finde', 'guía del fin de semana')} calcula lo que ganas pasando la colada al sábado.</li>
<li>Ajusta la potencia al uso real. Cada kW de más se paga todos los días del año.</li>
<li>Comprueba si tienes derecho al ${h.a('bono', 'bono social')}: en ${P.year} descuenta un ${h.num(P.bono_social.descuento_vulnerable * 100, 1)} % o un ${h.num(P.bono_social.descuento_severo * 100, 1)} %, y solo existe con el PVPC.</li>
<li>Antes de cambiar a un precio fijo, haz la cuenta con tu consumo en el ${h.a('libre', 'comparador PVPC o mercado libre')}, con impuestos en los dos lados.</li>
</ol>

<h2>Mañana, el fin de semana y los meses anteriores</h2>
<p>El precio de ${h.a('manana', 'mañana')} llega cada tarde y esta portada lo resume en su segunda tarjeta. Si buscas sobre todo ${h.a('baratas', 'las horas más baratas')}, la página dedicada te deja elegir cuántas horas seguidas necesitas. ${v.mesAnt ? `Para ver la tendencia, el ${h.a('historial', 'historial por meses')} compara cada mes con el mismo mes del año anterior: ${nombreMes(h, v.mes.mes)} va en ${h.kwh(v.mes.ttc)} de media, frente a ${h.kwh(v.mesAnt.ttc)} en ${nombreMes(h, v.mesAnt.mes)}.` : `El ${h.a('historial', 'historial por meses')} da la media de cada mes con sus impuestos.`} Y si te preguntas qué es exactamente la tarifa regulada, empieza por la guía del ${h.a('pvpc', 'PVPC explicado')}.</p>`;
    },
  },
  en: {
    title: 'Electricity Price Spain Today 2026: PVPC with Tax by Hour',
    description: 'Electricity price in Spain today and tomorrow: all 24 PVPC hours with VAT and electricity tax, the cheapest hour and each appliance’s cost. Red Eléctrica data.',
    h1: 'Electricity price in Spain today: the PVPC with taxes, hour by hour',
    intro: 'What each kWh really costs you today, VAT and electricity tax included, built from Red Eléctrica’s official file.',
    resume: (h) => {
      const v = datos(h);
      return `Today, ${h.dia(v.hoy.fecha)}, a kilowatt hour on Spain’s regulated PVPC tariff costs ${h.kwh(v.hoy.media)} on average with taxes on the mainland and the Balearics. The cheapest hour is ${h.tramo(v.hoy.min.h)}, at ${h.kwh(v.hoy.min.ttc)}, and the dearest is ${h.tramo(v.hoy.max.h)}, at ${h.kwh(v.hoy.max.ttc)}, ${h.num(v.ratio, 1)} times as much. These are the 24 prices Red Eléctrica, the grid operator, publishes in its official PVPC 2.0TD file; they already include energy, the network tolls set by the CNMC regulator and the government’s system charges. We add the electricity tax (${pct(h, v.imp.iee, 2)}) and VAT (${pct(h, v.imp.iva, 0)}) in force that day. Most Spanish price pages show the pre-tax figure only. Here you get both, plus calculators for what the washing machine, the oven or an electric car charge costs at each hour, and whether a fixed-price deal would beat the PVPC on your own bill. No phone number, no form.`;
    },
    faqs: (h) => {
      const v = datos(h);
      return [
        { q: 'When does tomorrow’s electricity price come out in Spain?', a: `Red Eléctrica publishes the 24 PVPC prices for the next day every evening before 8:15 pm Madrid time, as Royal Decree 216/2014 requires. This site rebuilds itself shortly afterwards, from 8:40 pm and again an hour later, and tomorrow then appears under the “Tomorrow” tab. Before that we show an estimated average and label it as such.` },
        { q: 'Do the prices in the table include tax?', a: `Red Eléctrica’s file gives the energy term before tax. We add the electricity tax (${pct(h, v.imp.iee, 2)}) and VAT (${pct(h, v.imp.iva, 0)}), or the Canary Islands’ IGIC at 0% for homes up to 10 kW. The “Excluded” option shows Red Eléctrica’s figure untouched.` },
        { q: 'Why are there 24 hourly prices and not 96 quarter hours?', a: `The wholesale market has set a price for every 15 minutes since 1 October 2025, but the PVPC that households are billed still has 24 prices a day, because domestic meters record consumption hour by hour. The 96 market quarters are on the quarter-hour price page.` },
        { q: 'What is the cheapest time to run the washing machine today?', a: `With today’s prices, a ${h.num(v.lav, 2)} kWh wash (8 kg machine, class C, eco programme) is cheapest if it starts at ${h.M.reloj(v.lavBarata.inicio)}: ${h.eur(v.lavBarata.coste, 2)} including tax. The second calculator on this page reworks it for the start time and the appliance you choose, with tomorrow’s prices too.` },
        { q: 'Is the price the same everywhere in Spain?', a: `The PVPC energy term is the same on the mainland, the Balearics and the Canary Islands. Taxes differ: the Canaries charge IGIC instead of VAT, at 0% for homes with up to 10 kW. Ceuta and Melilla have their own price, because peak and standard hours start an hour later there, and they pay 1% IPSI instead of VAT, under each city’s tax bylaw. Pick your territory under “Where you live”.` },
        { q: 'Which part of the price has nothing to do with the market?', a: `The CNMC tolls and the government charges in the energy term: in ${h.P.year} they add up to ${h.kwh(v.reg.P1, 4)} at peak, ${h.kwh(v.reg.P2, 4)} at standard times and ${h.kwh(v.reg.P3, 4)} off-peak, before tax. That is why off-peak, midnight to 8 am and all weekend, starts with an advantage.` },
        { q: 'I am on a fixed-price deal. Is any of this useful to me?', a: `Only if your contract is indexed to the market. On a fixed price every hour costs the same, and the table becomes a benchmark: the bill calculator works out what the last 30 days would have cost on the PVPC and on your fixed price, taxes on both sides.` },
      ];
    },
    body: (h) => {
      const v = datos(h);
      const P = h.P;
      const tramos = [...v.hoy.horas].sort((a, b) => a.ttc - b.ttc);
      return `<h2>Today’s price in five numbers</h2>
<p>The table above lists all ${v.hoy.horas.length} hours of ${h.dia(v.hoy.fecha)}. Five figures are enough to decide quickly, all with taxes, mainland prices:</p>
${h.table(['Figure', 'Hour', 'Price with taxes'], [
  ['Daily average', 'all 24 hours', h.kwh(v.hoy.media)],
  ['Cheapest hour', h.tramo(v.hoy.min.h), h.kwh(v.hoy.min.ttc)],
  ['Second cheapest', h.tramo(tramos[1].h), h.kwh(tramos[1].ttc)],
  ['Most expensive hour', h.tramo(v.hoy.max.h), h.kwh(v.hoy.max.ttc)],
  ['Best three hours in a row', `from ${String(v.hoy.horas[v.hoy.bloque3.inicio].h).padStart(2, '0')}:00`, h.kwh(v.hoy.bloque3.media)],
], `PVPC 2.0TD for ${h.dia(v.hoy.fecha)}, Red Eléctrica, with the electricity tax and VAT in force.`, ['l', 'l', 'r'])}
<p>The gap between the dearest and the cheapest hour matters. An appliance that draws one kilowatt hour costs ${h.eur(v.hoy.max.ttc, 2)} at the worst time today and ${h.eur(v.hoy.min.ttc, 2)} at the best. For a washing machine, a dishwasher or an electric car, choosing the hour is the one saving that needs no change of contract.</p>

<h2>Why we show the price with taxes</h2>
<p>Red Eléctrica publishes the energy term before tax. It is the right number, but it is not what you pay. Every kilowatt hour first carries Spain’s special electricity tax (impuesto especial sobre la electricidad), and then VAT, which on a household bill is charged on top of that tax as well. Using today’s average:</p>
${h.table(['Item', '€/kWh'], [
  ['PVPC energy term (Red Eléctrica)', h.num(v.ejemploSin, 4)],
  [`Electricity tax, ${pct(h, v.imp.iee, 5)}`, h.num(v.ieeEj, 4)],
  [`VAT at ${pct(h, v.imp.iva, 0)} on the above`, h.num(v.ivaEj, 4)],
  ['What you pay per kWh', h.num(v.ejemploSin + v.ieeEj + v.ivaEj, 4)],
], `Average for ${h.dia(v.hoy.fecha)}. Taxes under ${h.src('ley38Iee', 'Act 38/1992')} and ${h.src('ley37Iva', 'Act 37/1992')}.`, ['l', 'r'])}
<p>A pre-tax price looks about ${h.num(((v.ieeEj + v.ivaEj) / v.ejemploSin) * 100, 0)}% lower than the real one. Put it next to a retailer’s fixed price, which is usually advertised with tax, and the comparison is skewed. Here the “Taxes: included / excluded” switch shows both figures, and every calculator works with the full one.</p>
<p>Rates have not been constant this year. ${h.src('rdl7_2026', 'Royal Decree-law 7/2026')} cut VAT to 10% for contracts under 10 kW and the electricity tax to 0.5% from 22 March to 31 May 2026; since June the standard 21% and 5.11269632% apply again. ${h.src('rdl25_2026', 'Royal Decree-law 25/2026')} brings the cut back in November or December if the INE’s electricity consumer price index rises more than 15% year on year in September or October. The calculator applies each day’s own rate, and the monthly history uses each month’s taxes.</p>

<h2>Why the official file changes everything</h2>
<p>Plenty of price pages copy a table by hand, stamp it with today’s date and leave it. In Google we found pages dated today showing figures from eleven months earlier, a “tomorrow” table still empty a week later, and a daily average that did not match the page’s own table. This site writes no price itself. A script downloads the public PVPC file from ${h.src('esiosPvpc', 'e·sios, Red Eléctrica’s information system')} every evening, checks the file’s date is the one expected and rebuilds every page. If the file fails to arrive, nothing is made up: the page shows an estimated average built from previous days of the same kind and says so in a box.</p>
<p>The same file includes, hour by hour, the tolls-and-charges component and the standard consumption profile Red Eléctrica applies to meters. That lets us check two things no other site checks: that each hour sits in the period (peak, standard or off-peak) set by ${h.src('cnmcCircular3_2020', 'CNMC Circular 3/2020')}, and that the tolls and charges inside Red Eléctrica’s price match the ${P.year} figures in the BOE, Spain’s official gazette, to a thousandth of a cent. The site’s automated tests verify it on every hour of the year before each release.</p>

<h2>Quarter hours: what changed in 2025 and what did not</h2>
<p>Since 1 October 2025 Spain’s day-ahead market has set a price for each quarter hour, 96 a day. That has not reached PVPC households: the official file still has 24 rows and home meters record by the hour, so a regulated-tariff customer pays the price of each hour. If you are on an indexed market deal, or just want to see how much the wholesale price moves within an hour, the ${h.a('cuartos', 'quarter-hour price page')} shows the day’s 96 prices next to the hourly PVPC.</p>

<h2>Where each cent comes from</h2>
<p>Each hourly price has three parts. First, energy: from ${P.year}, ${h.num(P.futuros_pvpc.peso_2026 * 100, 0)}% of it is bought through forward products (monthly, quarterly and yearly) and the remaining 45% on the day-ahead and intraday markets, under the Royal Decree 446/2023 method described by the ${h.src('mitecoRd446', 'Ministry for the Ecological Transition')}. Second, transmission and distribution tolls, set by the ${h.src('cnmcPeajes2026', 'CNMC')}. Third, system charges, set by the government in ${h.src('tedCargos2026', 'Order TED/1524/2025')}, which pay for subsidised renewables, past tariff deficits and the extra cost of island grids.</p>
${h.table(['2.0TD period', 'When', 'Toll (CNMC)', 'Charge (Ministry)', 'Regulated total'], [
  ['Peak (P1)', 'weekdays 10–14 and 18–22', h.num(P.peajes.energia_eur_kwh.P1, 6), h.num(P.cargos.energia_eur_kwh.P1, 6), h.num(v.reg.P1, 6)],
  ['Standard (P2)', 'weekdays 8–10, 14–18 and 22–24', h.num(P.peajes.energia_eur_kwh.P2, 6), h.num(P.cargos.energia_eur_kwh.P2, 6), h.num(v.reg.P2, 6)],
  ['Off-peak (P3)', '0–8, weekends and national holidays', h.num(P.peajes.energia_eur_kwh.P3, 6), h.num(P.cargos.energia_eur_kwh.P3, 6), h.num(v.reg.P3, 6)],
], `Energy term, €/kWh before tax, ${P.year}. CNMC Resolution of 18 December 2025 and Order TED/1524/2025.`, ['l', 'l', 'r', 'r', 'r'])}
<p>Those regulated amounts explain why nights and weekends are usually cheaper even when the market is expensive: off-peak, the regulated part is almost nothing. They also explain why a sunny midday can beat the night: when solar output pushes the energy price down, what is left is the standard-period tolls and charges. The ${h.a('periodos', 'time-of-use periods guide')} goes through it.</p>

<h2>Values and parameters for ${P.year}</h2>
<p>Besides the hourly price, a PVPC bill has a fixed part that does not depend on when you use power. These are the amounts the calculator uses, all from the BOE:</p>
${h.table(['Item', 'Amount', 'Source'], [
  ['Peak-standard power toll (P1)', `${h.num(P.peajes.potencia_eur_kw_ano.P1, 6)} €/kW·year`, 'CNMC Resolution 18/12/2025'],
  ['Peak-standard power charge (P1)', `${h.num(P.cargos.potencia_eur_kw_ano.P1, 6)} €/kW·year`, 'Order TED/1524/2025'],
  ['PVPC retail margin', `${h.num(P.comercializacion.margen_fijo_eur_kw_ano, 3)} €/kW·year`, 'Order ETU/1948/2016'],
  ['Off-peak power toll + charge (P2)', `${h.num(P.peajes.potencia_eur_kw_ano.P2 + P.cargos.potencia_eur_kw_ano.P2, 6)} €/kW·year`, 'CNMC and Order TED/1524/2025'],
  ['Social-discount funding', `${h.num(P.bono_social_financiacion.eur_cups_ano, 6)} €/year`, 'Order TED/634/2026 (from 26/06/2026)'],
  ['Smart meter rental', `${h.num(P.contador.alquiler_eur_mes, 2)} €/month`, 'Order ITC/3860/2007'],
  ['Electricity tax', pct(h, v.imp.iee, 8), 'Act 38/1992'],
  ['VAT (mainland and Balearics)', pct(h, v.imp.iva, 0), 'Act 37/1992'],
  ['IGIC (Canaries, homes up to 10 kW)', '0%', 'Canary Islands Legislative Decree 1/2025'],
  ['IPSI (Ceuta and Melilla, instead of VAT)', '1%', 'IPSI tax bylaws of Ceuta (art. 33.4) and Melilla (annex 1)'],
], undefined, ['l', 'r', 'l'])}
<p>With 4.6 kW contracted, power alone costs ${h.eur(v.pot)} a year before tax. That is why checking your ${h.a('potencia', 'contracted power')} often saves more than chasing the cheap hour.</p>

<h2>Worked examples with today’s prices</h2>
<p>One use of each appliance at the best and at the worst start time on ${h.dia(v.hoy.fecha)}, with taxes. Energy use follows the EU energy label method, at the top of the class shown:</p>
${(() => {
  const precios = v.hoy.horas.map((x) => x.ttc);
  const A = P.aparatos;
  const filas: Array<[string, number, number]> = [
    ['Washing machine 8 kg, class C, eco 40-60', h.M.kwhLavadora(A.lavadora.capacidad_kg, A.lavadora.clase), A.lavadora.duracion_min / 60],
    ['Dishwasher, 13 place settings, class D, eco', h.M.kwhLavavajillas(A.lavavajillas.servicios, A.lavavajillas.clase), A.lavavajillas.duracion_min / 60],
    ['Oven 65 litres, class A, one cycle', h.M.kwhHorno(A.horno.volumen_l, A.horno.clase), A.horno.duracion_min / 60],
  ];
  return h.table(['Appliance', 'kWh', 'Best start', 'Worst start'], filas.map(([n, k, d]) => { const m = h.M.mejorInicio(precios, d, k); return [n, h.num(k, 2), `${h.M.reloj(m.inicio)} · ${h.eur(m.coste, 2)}`, `${h.M.reloj(m.peorInicio)} · ${h.eur(m.peor, 2)}`]; }), `Worked out by the site’s engine on the PVPC for ${h.dia(v.hoy.fecha)}.`, ['l', 'r', 'r', 'r']);
})()}
<p>Per use the sums are small; the saving shows up over a year. Four washes a week for 52 weeks is over two hundred cycles, and the gap between the best and worst hour is multiplied by that. Each appliance has its own page: ${h.a('lavadora', 'washing machine')}, ${h.a('lavavajillas', 'dishwasher')}, ${h.a('horno', 'electric oven')} and ${h.a('coche', 'electric car')}.</p>

<h2>Paying less on the PVPC</h2>
<ol>
<li>Check the table before switching on anything power-hungry: oven, dryer, dishwasher, water heater or car. A green hour often costs less than half a red one.</li>
<li>Use the delay-start button. Most washing machines and dishwashers can hold off for several hours, and the calculator tells you when to aim for.</li>
<li>Use the weekend. On Saturdays and Sundays every hour pays off-peak tolls and charges; the ${h.a('finde', 'weekend guide')} works out what you gain by moving laundry to Saturday.</li>
<li>Match your contracted power to real use. Every spare kW is paid every day of the year.</li>
<li>Check whether you qualify for the ${h.a('bono', 'social discount (bono social)')}: in ${P.year} it takes off ${h.num(P.bono_social.descuento_vulnerable * 100, 1)}% or ${h.num(P.bono_social.descuento_severo * 100, 1)}%, and it only exists on the PVPC.</li>
<li>Before moving to a fixed price, run the numbers for your own use in the ${h.a('libre', 'PVPC versus fixed price comparison')}, with tax on both sides.</li>
</ol>

<h2>Tomorrow, the weekend and past months</h2>
<p>${h.a('manana', 'Tomorrow’s price')} arrives every evening and the second card on this page sums it up. If what you want is ${h.a('baratas', 'the cheapest hours')}, the dedicated page lets you choose how many hours in a row you need. ${v.mesAnt ? `For the trend, the ${h.a('historial', 'month-by-month history')} sets each month against the same month a year earlier: ${nombreMes(h, v.mes.mes)} is averaging ${h.kwh(v.mes.ttc)}, against ${h.kwh(v.mesAnt.ttc)} in ${nombreMes(h, v.mesAnt.mes)}.` : `The ${h.a('historial', 'month-by-month history')} gives each month’s average with its taxes.`} And if you are new to Spain’s regulated tariff, start with the ${h.a('pvpc', 'PVPC guide')}.</p>`;
    },
  },
};
