/**
 * Coste de usar un aparato según la hora de inicio, con el PVPC de hoy o de mañana (con impuestos),
 * frente a un precio fijo del mercado libre. Consumo por defecto: metodología de la etiqueta energética
 * de la UE (lib/engine/aparatos.ts), o batería y cargador para el coche eléctrico.
 */
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import Grafico from './Grafico';
import { Frame, ResultPanel, T, eur, kwh, nr, useParams, type L } from './kit';
import { useDia } from './useDia';
import { costeTramo, reloj, impuestosDelDia } from '../../lib/engine/pvpc';
import { libreConImpuestos } from '../../lib/engine/factura';
import { kwhLavadora, kwhLavavajillas, kwhHorno, recarga, CLASES_LAVADORA, CLASES_LAVAVAJILLAS, CLASES_HORNO } from '../../lib/engine/aparatos';
import { P } from '../../lib/engine/params';
import { displayDate } from '../../lib/format';
import type { Bundle } from '../../lib/bundle';

export type Aparato = 'lavadora' | 'lavavajillas' | 'horno' | 'coche' | 'generico';
interface Props { lang: L; aparato: Aparato; datos: Bundle; precioLibre: number; methodHref?: string; secundario?: boolean }

const A = P.aparatos;
const idx = (arr: string[], c: string) => Math.max(0, arr.indexOf(c));

export default function AparatoCalc({ lang, aparato, datos, precioLibre, methodHref, secundario }: Props) {
  const defs = {
    lavadora: { tam: A.lavadora.capacidad_kg, cls: idx(CLASES_LAVADORA, A.lavadora.clase), dur: A.lavadora.duracion_min / 60, usos: 4 },
    lavavajillas: { tam: A.lavavajillas.servicios, cls: idx(CLASES_LAVAVAJILLAS, A.lavavajillas.clase), dur: A.lavavajillas.duracion_min / 60, usos: 5 },
    horno: { tam: A.horno.volumen_l, cls: idx(CLASES_HORNO, A.horno.clase), dur: A.horno.duracion_min / 60, usos: 3 },
    coche: { tam: A.coche.bateria_kwh, cls: A.coche.potencias_tipicas_kw.indexOf(A.coche.potencia_kw), dur: 0, usos: 2 },
    generico: { tam: 2000, cls: 0, dur: 1, usos: 7 },
  }[aparato];
  const [v, set] = useParams({ d: 0, ini: 20, tam: defs.tam, cls: defs.cls, dur: defs.dur, desde: A.coche.desde_pct, hasta: A.coche.hasta_pct, usos: defs.usos, libre: Math.round(precioLibre * 10000) / 100 });
  const hoyD = useDia(datos, v.d === 1 ? 1 : 0, 4.6, 'peninsula');
  const sigD = useDia(datos, v.d === 1 ? 2 : 1, 4.6, 'peninsula');
  const precios = [...hoyD.horas.map((x) => x.ttc), ...sigD.horas.map((x) => x.ttc)];

  let consumo = 0, duracion = v.dur, detalle = '';
  if (aparato === 'lavadora') { const c = CLASES_LAVADORA[v.cls] ?? 'C'; consumo = kwhLavadora(v.tam, c); detalle = T(lang, `programa eco 40-60, ${nr(v.tam, lang)} kg, clase ${c}`, `eco 40-60 programme, ${nr(v.tam, lang)} kg, class ${c}`); }
  if (aparato === 'lavavajillas') { const c = CLASES_LAVAVAJILLAS[v.cls] ?? 'D'; consumo = kwhLavavajillas(v.tam, c); detalle = T(lang, `programa eco, ${nr(v.tam, lang)} servicios, clase ${c}`, `eco programme, ${nr(v.tam, lang)} place settings, class ${c}`); }
  if (aparato === 'horno') { const c = CLASES_HORNO[v.cls] ?? 'A'; consumo = kwhHorno(v.tam, c); detalle = T(lang, `ciclo normalizado, ${nr(v.tam, lang)} litros, clase ${c}`, `standard cycle, ${nr(v.tam, lang)} litres, class ${c}`); }
  if (aparato === 'coche') { const kw = A.coche.potencias_tipicas_kw[v.cls] ?? 2.3; const r = recarga(v.tam, v.desde, v.hasta, kw); consumo = r.kwh; duracion = r.horas; detalle = T(lang, `${nr(v.tam, lang)} kWh de batería, del ${nr(v.desde, lang)} al ${nr(v.hasta, lang)} %, a ${nr(kw, lang, 1)} kW`, `${nr(v.tam, lang)} kWh battery, ${nr(v.desde, lang)} to ${nr(v.hasta, lang)}%, at ${nr(kw, lang, 1)} kW`); }
  if (aparato === 'generico') { consumo = (v.tam / 1000) * v.dur; detalle = T(lang, `${nr(v.tam, lang)} W durante ${nr(v.dur, lang, 2)} h`, `${nr(v.tam, lang)} W for ${nr(v.dur, lang, 2)} h`); }
  duracion = Math.max(0.25, Math.min(24, duracion));
  const ini = Math.max(0, Math.min(23.75, v.ini));
  const coste = costeTramo(precios, ini, duracion, consumo);
  const ventana = Math.max(0.25, 24 - 1e-9);
  // Solo inicios dentro del día elegido (de 0:00 a 23:45).
  const best = (() => { let b = { inicio: 0, coste: Infinity }, w = { inicio: 0, coste: -Infinity }; for (let s = 0; s <= ventana; s += 0.25) { const c = costeTramo(precios, s, duracion, consumo); if (c < b.coste) b = { inicio: s, coste: c }; if (c > w.coste) w = { inicio: s, coste: c }; } return { b, w }; })();
  const imp = impuestosDelDia(hoyD.fecha, 4.6);
  const libre = consumo * libreConImpuestos(v.libre / 100, imp);
  const anual = (c: number) => c * v.usos * 52;
  const tag = lang === 'es' ? 'es-ES' : 'en-GB';
  const nombre = { lavadora: T(lang, 'la lavadora', 'the washing machine'), lavavajillas: T(lang, 'el lavavajillas', 'the dishwasher'), horno: T(lang, 'el horno', 'the oven'), coche: T(lang, 'la recarga', 'the charge'), generico: T(lang, 'el aparato', 'the appliance') }[aparato];
  const head = T(lang, `Poner ${nombre} a las ${reloj(ini)} (${displayDate(hoyD.fecha, tag)})`, `Running ${nombre} at ${reloj(ini)} (${displayDate(hoyD.fecha, tag)})`);
  const horasOpts = Array.from({ length: 48 }, (_, i) => ({ value: String(i / 2), label: reloj(i / 2) }));
  const clases = aparato === 'lavadora' ? CLASES_LAVADORA : aparato === 'lavavajillas' ? CLASES_LAVAVAJILLAS : CLASES_HORNO;
  const rows = [
    { label: T(lang, `Consumo (${detalle})`, `Energy (${detalle})`), value: `${nr(consumo, lang, 2)} kWh` },
    { label: T(lang, `Duración`, `Duration`), value: `${nr(duracion, lang, 2)} h` },
    { label: T(lang, `Mejor hora para empezar: ${reloj(best.b.inicio)}`, `Best start time: ${reloj(best.b.inicio)}`), value: eur(best.b.coste, lang), strong: true },
    { label: T(lang, `Peor hora: ${reloj(best.w.inicio)}`, `Worst start time: ${reloj(best.w.inicio)}`), value: eur(best.w.coste, lang) },
    { label: T(lang, `Con un precio fijo de ${kwh(v.libre / 100, lang)} sin impuestos`, `With a fixed price of ${kwh(v.libre / 100, lang)} before taxes`), value: eur(libre, lang) },
    { label: T(lang, `Al año, ${nr(v.usos, lang)} veces por semana a la hora elegida`, `Per year, ${nr(v.usos, lang)} times a week at your chosen time`), value: eur(anual(coste), lang) },
    { label: T(lang, 'Al año, siempre a la mejor hora', 'Per year, always at the best time'), value: eur(anual(best.b.coste), lang), note: true },
  ];
  const aviso = hoyD.estimado || sigD.estimado ? (
    <p className="mt-3 rounded-md border-l-4 border-amber-600 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="note">{T(lang, 'Parte de las horas usa el precio medio estimado (Red Eléctrica aún no ha publicado ese día): no es el precio exacto.', 'Some hours use the estimated average price (Red Eléctrica has not published that day yet): not the exact price.')}</p>
  ) : null;
  return (
    <div {...(secundario ? { 'data-simulateur-secondaire': '' } : {})}>
      <Frame
        form={<>
          <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
            <Toggle id={`ap-${aparato}-d`} label={T(lang, 'Día', 'Day')} value={String(v.d)} onChange={(x) => set('d')(Number(x))} options={[{ value: '0', label: T(lang, 'Hoy', 'Today') }, { value: '1', label: T(lang, 'Mañana', 'Tomorrow') }]} />
            <SelectField id={`ap-${aparato}-ini`} label={T(lang, 'Hora de inicio', 'Start time')} value={String(Math.round(ini * 2) / 2)} onChange={(x) => set('ini')(Number(x))} options={horasOpts} />
          </div>
          {aparato === 'coche' ? (<>
            <div className="grid grid-cols-2 gap-x-4">
              <NumberField id="ap-coche-bat" label={T(lang, 'Batería', 'Battery')} value={v.tam} onChange={set('tam')} unit="kWh" min={10} max={200} lang={lang} help={T(lang, 'Capacidad útil, en la ficha del coche.', 'Usable capacity, from the car’s spec sheet.')} />
              <SelectField id="ap-coche-kw" label={T(lang, 'Punto de carga', 'Charge point')} value={String(v.cls)} onChange={(x) => set('cls')(Number(x))} options={A.coche.potencias_tipicas_kw.map((k, i) => ({ value: String(i), label: i === 0 ? T(lang, `Enchufe doméstico ${nr(k, lang, 1)} kW (10 A)`, `Household socket ${nr(k, lang, 1)} kW (10 A)`) : i === 1 ? T(lang, `Enchufe reforzado ${nr(k, lang, 1)} kW (16 A)`, `Reinforced socket ${nr(k, lang, 1)} kW (16 A)`) : T(lang, `Wallbox ${nr(k, lang, 1)} kW (32 A)`, `Wallbox ${nr(k, lang, 1)} kW (32 A)`) }))} />
            </div>
            <div className="grid grid-cols-2 gap-x-4">
              <NumberField id="ap-coche-desde" label={T(lang, 'Carga actual', 'Current charge')} value={v.desde} onChange={set('desde')} unit="%" min={0} max={100} lang={lang} />
              <NumberField id="ap-coche-hasta" label={T(lang, 'Cargar hasta', 'Charge to')} value={v.hasta} onChange={set('hasta')} unit="%" min={0} max={100} lang={lang} />
            </div>
          </>) : aparato === 'generico' ? (
            <div className="grid grid-cols-2 gap-x-4">
              <NumberField id="ap-gen-w" label={T(lang, 'Potencia del aparato', 'Appliance power')} value={v.tam} onChange={set('tam')} unit="W" min={1} max={10000} lang={lang} help={T(lang, 'En la placa de características (W).', 'On the rating plate (W).')} />
              <NumberField id="ap-gen-dur" label={T(lang, 'Tiempo de uso', 'Time in use')} value={v.dur} onChange={set('dur')} unit="h" min={0.25} max={24} decimals={2} lang={lang} />
            </div>
          ) : (<>
            <div className="grid grid-cols-2 gap-x-4">
              <NumberField id={`ap-${aparato}-tam`} label={aparato === 'lavadora' ? T(lang, 'Capacidad', 'Capacity') : aparato === 'lavavajillas' ? T(lang, 'Servicios', 'Place settings') : T(lang, 'Volumen', 'Volume')} value={v.tam} onChange={set('tam')} unit={aparato === 'lavadora' ? 'kg' : aparato === 'lavavajillas' ? T(lang, 'serv.', 'sets') : 'l'} min={1} max={aparato === 'horno' ? 150 : 20} lang={lang} />
              <SelectField id={`ap-${aparato}-cls`} label={T(lang, 'Clase energética', 'Energy class')} value={String(v.cls)} onChange={(x) => set('cls')(Number(x))} options={clases.map((c, i) => ({ value: String(i), label: c }))} />
            </div>
            <div className="grid grid-cols-2 gap-x-4">
              <NumberField id={`ap-${aparato}-dur`} label={T(lang, 'Duración del programa', 'Programme duration')} value={v.dur} onChange={set('dur')} unit="h" min={0.25} max={12} decimals={2} lang={lang} help={T(lang, 'La etiqueta indica la duración del programa eco.', 'The label shows the eco programme duration.')} />
              <NumberField id={`ap-${aparato}-usos`} label={T(lang, 'Usos por semana', 'Uses per week')} value={v.usos} onChange={set('usos')} min={0} max={50} lang={lang} />
            </div>
          </>)}
          <div className="grid grid-cols-2 gap-x-4">
            <NumberField id={`ap-${aparato}-libre`} label={T(lang, 'Tu precio fijo (libre)', 'Your fixed price')} value={v.libre} onChange={set('libre')} unit="c€/kWh" min={0} max={200} decimals={2} lang={lang} help={T(lang, 'En céntimos, sin impuestos: 0,1299 €/kWh son 12,99. Por defecto, la media PVPC de 30 días.', 'In cents, before tax: 0.1299 €/kWh is 12.99. Default: the 30-day PVPC average.')} />
            {(aparato === 'coche' || aparato === 'generico') && <NumberField id={`ap-${aparato}-usos`} label={T(lang, 'Usos por semana', 'Uses per week')} value={v.usos} onChange={set('usos')} min={0} max={50} lang={lang} />}
          </div>
        </>}
        result={<ResultPanel lang={lang} head={head} value={eur(coste, lang)} sub={T(lang, `con impuestos · ${kwh(consumo > 0 ? coste / consumo : 0, lang)} de media`, `with taxes · ${kwh(consumo > 0 ? coste / consumo : 0, lang)} on average`)} rows={rows} methodHref={methodHref} badge={aviso}
          hyp={T(lang, 'Consumo repartido por igual durante el programa, precio PVPC de cada hora con impuesto eléctrico e IVA. Si el programa pasa de medianoche, se usa el precio del día siguiente. No incluye potencia ni contador, que se pagan igual uses o no el aparato.', 'Energy spread evenly over the programme, PVPC price of each hour with electricity tax and VAT. If the programme runs past midnight, the next day’s price is used. Power and meter are not included: you pay them whether or not you use the appliance.')}
          copyText={`${head}: ${eur(coste, lang)}`} />}
        after={<Grafico horas={hoyD.horas} lang={lang} actual={hoyD.actual} marca={{ inicio: Math.floor(best.b.inicio), n: Math.min(24 - Math.floor(best.b.inicio), Math.ceil(duracion)) }} aria={T(lang, 'Precio por horas y mejor franja para el aparato', 'Hourly price and best slot for the appliance')} />}
      />
    </div>
  );
}
