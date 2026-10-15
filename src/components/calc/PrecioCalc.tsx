/**
 * Precio de la luz PVPC de hoy o de mañana, hora a hora, con impuestos (herramienta principal).
 * Modos: 'hoy' (accueil), 'manana', 'baratas' (las N horas más baratas y el mejor bloque seguido).
 */
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import NumberField from '../ui/NumberField';
import Grafico, { tercio, COLORES } from './Grafico';
import { Frame, ResultPanel, T, kwh, useParams, type L } from './kit';
import { useDia } from './useDia';
import { resumen, masBaratas, mejorBloque, tramo, impuestosDelDia, type Region } from '../../lib/engine/pvpc';
import { displayDate, formatNumber } from '../../lib/format';
import type { Bundle } from '../../lib/bundle';

interface Props { lang: L; mode?: 'hoy' | 'manana' | 'baratas'; datos: Bundle; methodHref?: string }

export default function PrecioCalc({ lang, mode = 'hoy', datos, methodHref }: Props) {
  const [v, set] = useParams({ d: mode === 'manana' ? 1 : 0, r: 0, n: 3, imp: 1 });
  const region: Region = v.r === 1 ? 'canarias' : 'peninsula';
  const dia = useDia(datos, v.d === 1 ? 1 : 0, 4.6, region);
  const conImp = v.imp !== 0;
  const val = (x: { ttc: number; sin: number }) => (conImp ? x.ttc : x.sin);
  const r = resumen(dia.horas);
  const n = Math.max(1, Math.min(8, Math.round(v.n)));
  const bloque = mejorBloque(dia.horas, n);
  const baratas = masBaratas(dia.horas, n);
  const imp = impuestosDelDia(dia.fecha, 4.6, region);
  const tag = lang === 'es' ? 'es-ES' : 'en-GB';
  const fechaTxt = displayDate(dia.fecha, tag);
  const ahora = dia.actual >= 0 ? dia.horas[dia.actual] : null;
  const mediaSel = conImp ? r.media : r.mediaSin;
  const head = mode === 'baratas'
    ? T(lang, `Las ${n} horas seguidas más baratas, ${fechaTxt}`, `Cheapest ${n} hours in a row, ${fechaTxt}`)
    : T(lang, `Precio medio PVPC, ${fechaTxt}`, `Average PVPC price, ${fechaTxt}`);
  const value = mode === 'baratas' ? `${tramo(dia.horas[bloque.inicio].h).slice(0, 5)}–${tramo(dia.horas[bloque.inicio + n - 1].h).slice(6)}` : kwh(mediaSel, lang);
  const impTxt = imp.indirecto === 'IGIC'
    ? T(lang, `impuesto eléctrico ${formatNumber(imp.iee * 100, 2, lang)} % e IGIC 0 %`, `electricity tax ${formatNumber(imp.iee * 100, 2, lang)}% and 0% IGIC`)
    : T(lang, `impuesto eléctrico ${formatNumber(imp.iee * 100, 2, lang)} % e IVA ${formatNumber(imp.iva * 100, 0, lang)} %`, `electricity tax ${formatNumber(imp.iee * 100, 2, lang)}% and ${formatNumber(imp.iva * 100, 0, lang)}% VAT`);
  const rows = [
    ...(mode === 'baratas' ? [{ label: T(lang, `Media de esas ${n} horas`, `Average of those ${n} hours`), value: kwh(conImp ? bloque.media : dia.horas.slice(bloque.inicio, bloque.inicio + n).reduce((s, x) => s + x.sin, 0) / n, lang), strong: true }] : []),
    ...(ahora ? [{ label: T(lang, `Ahora (${tramo(ahora.h)})`, `Now (${tramo(ahora.h)})`), value: kwh(val(ahora), lang), strong: mode !== 'baratas' }] : []),
    { label: T(lang, `Hora más barata (${tramo(r.min.h)})`, `Cheapest hour (${tramo(r.min.h)})`), value: kwh(val(r.min), lang) },
    { label: T(lang, `Hora más cara (${tramo(r.max.h)})`, `Most expensive hour (${tramo(r.max.h)})`), value: kwh(val(r.max), lang) },
    ...(mode !== 'baratas' ? [{ label: T(lang, `Mejor bloque de ${n} horas`, `Best ${n}-hour block`), value: `${tramo(dia.horas[bloque.inicio].h).slice(0, 5)} · ${kwh(conImp ? bloque.media : dia.horas.slice(bloque.inicio, bloque.inicio + n).reduce((s, x) => s + x.sin, 0) / n, lang)}` }] : []),
    { label: conImp ? T(lang, 'Media sin impuestos', 'Average before taxes') : T(lang, 'Media con impuestos', 'Average with taxes'), value: kwh(conImp ? r.mediaSin : r.media, lang), note: true },
  ];
  const aviso = dia.estimado ? (
    <p className="mt-3 rounded-md border-l-4 border-amber-600 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="note">
      {v.d === 1
        ? T(lang, `Red Eléctrica aún no ha publicado el precio de mañana (suele hacerlo hacia las 20:15). Mientras tanto: precio medio estimado, no el precio exacto del día (media hora a hora de los ${dia.diasUsados} últimos días del mismo tipo).`, `Red Eléctrica has not yet published tomorrow’s price (usually around 8:15 pm). Meanwhile: estimated average price, not the exact price for the day (hour-by-hour average of the last ${dia.diasUsados} days of the same type).`)
        : T(lang, `Precio medio estimado, no el precio exacto del día: el dato oficial de este día no estaba disponible al generar la página (media hora a hora de los ${dia.diasUsados} últimos días del mismo tipo).`, `Estimated average price, not the exact price for the day: the official figure was not available when this page was built (hour-by-hour average of the last ${dia.diasUsados} days of the same type).`)}
    </p>
  ) : null;
  return (
    <Frame
      form={<>
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <Toggle id="pc-dia" label={T(lang, 'Día', 'Day')} value={String(v.d)} onChange={(x) => set('d')(Number(x))} options={[{ value: '0', label: T(lang, 'Hoy', 'Today') }, { value: '1', label: T(lang, 'Mañana', 'Tomorrow') }]} />
          <Toggle id="pc-imp" label={T(lang, 'Impuestos', 'Taxes')} value={String(v.imp)} onChange={(x) => set('imp')(Number(x))} options={[{ value: '1', label: T(lang, 'Incluidos', 'Included') }, { value: '0', label: T(lang, 'Excluidos', 'Excluded') }]} />
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <SelectField id="pc-region" label={T(lang, 'Dónde vives', 'Where you live')} value={String(v.r)} onChange={(x) => set('r')(Number(x))} options={[{ value: '0', label: T(lang, 'Península y Baleares', 'Mainland and Balearics') }, { value: '1', label: T(lang, 'Canarias', 'Canary Islands') }]} help={T(lang, 'Ceuta y Melilla tienen otro precio y su propio impuesto (IPSI): no se calculan aquí.', 'Ceuta and Melilla have their own price and tax (IPSI): not calculated here.')} />
          <NumberField id="pc-n" label={T(lang, 'Horas que necesitas', 'Hours you need')} value={n} onChange={set('n')} unit="h" min={1} max={8} lang={lang} />
        </div>
        <p className="text-sm text-navy-700">{T(lang, `Precio PVPC 2.0TD de Red Eléctrica para ${fechaTxt}, ${conImp ? `con ${impTxt}` : 'sin impuestos'}. Incluye energía, peajes y cargos; la potencia y el contador se pagan aparte (ver la factura).`, `Red Eléctrica PVPC 2.0TD price for ${fechaTxt}, ${conImp ? `with ${impTxt}` : 'before taxes'}. Includes energy, tolls and charges; power and meter are billed separately (see the bill).`)}</p>
        {mode === 'baratas' && (
          <div>
            <p className="text-sm font-medium text-navy-800">{T(lang, `Las ${n} horas más baratas (no seguidas)`, `The ${n} cheapest hours (not necessarily in a row)`)}</p>
            <ul className="mt-1 flex flex-wrap gap-2">{baratas.sort((a, b) => a.i - b.i).map((x) => <li key={x.i} className="tabular-nums rounded-md border border-navy-200 px-2 py-1 text-sm text-navy-800">{tramo(x.h)} · {kwh(val(x), lang)}</li>)}</ul>
          </div>
        )}
      </>}
      result={<ResultPanel lang={lang} head={head} value={value} rows={rows} methodHref={methodHref} badge={aviso}
        hyp={T(lang, 'Término de energía del PVPC (columna PCB del archivo de Red Eléctrica) multiplicado por (1 + impuesto eléctrico) y por (1 + IVA o IGIC) vigentes ese día. Hora de Madrid.', 'PVPC energy term (PCB column of the Red Eléctrica file) multiplied by (1 + electricity tax) and by (1 + VAT or IGIC) in force that day. Madrid time.')}
        copyText={`${head}: ${value}`} />}
      after={<>
        <Grafico horas={dia.horas} lang={lang} actual={dia.actual} marca={mode === 'baratas' ? { inicio: bloque.inicio, n } : undefined} conImp={conImp} aria={T(lang, `Precio de la luz hora a hora, ${fechaTxt}`, `Hourly electricity price, ${fechaTxt}`)} />
        <div className="mt-4 overflow-x-auto">
          <table className="journal w-full text-sm">
            <caption className="mb-2 text-left text-sm text-navy-700">{T(lang, `Las ${dia.horas.length} horas del ${fechaTxt} (hora peninsular)`, `All ${dia.horas.length} hours of ${fechaTxt} (mainland time)`)}</caption>
            <thead><tr><th scope="col" className="px-2 py-2 text-left">{T(lang, 'Hora', 'Hour')}</th><th scope="col" className="px-2 py-2 text-left">{T(lang, 'Periodo', 'Period')}</th><th scope="col" className="px-2 py-2 text-right">{T(lang, 'Sin impuestos', 'Before taxes')}</th><th scope="col" className="px-2 py-2 text-right">{T(lang, 'Con impuestos', 'With taxes')}</th><th scope="col" className="px-2 py-2 text-left">{T(lang, 'Nivel', 'Level')}</th></tr></thead>
            <tbody>{dia.horas.map((x, k) => {
              const t3 = tercio(dia.horas, x);
              return (
                <tr key={k} className={`border-b border-navy-100 ${k === dia.actual ? 'bg-accent-50 font-semibold' : ''}`}>
                  <td className="tabular-nums px-2 py-1.5">{tramo(x.h)}{k === dia.actual ? T(lang, ' · ahora', ' · now') : ''}</td>
                  <td className="px-2 py-1.5">{x.periodo === 'P1' ? T(lang, 'Punta', 'Peak') : x.periodo === 'P2' ? T(lang, 'Llano', 'Standard') : T(lang, 'Valle', 'Off-peak')}</td>
                  <td className="tabular-nums px-2 py-1.5 text-right">{formatNumber(x.sin, 4, lang)}</td>
                  <td className="tabular-nums px-2 py-1.5 text-right">{formatNumber(x.ttc, 4, lang)}</td>
                  <td className="px-2 py-1.5"><span className="inline-flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full" style={{ background: COLORES[t3] }} aria-hidden="true" />{t3 === 'barata' ? T(lang, 'barata', 'cheap') : t3 === 'media' ? T(lang, 'media', 'mid') : T(lang, 'cara', 'expensive')}</span></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-navy-600">{T(lang, `Fuente: Red Eléctrica (e·sios), término de facturación de energía activa del PVPC 2.0TD, en €/kWh. Datos descargados el ${displayDate(datos.generadoFecha, tag)} a las ${datos.generadoHora} (hora de Madrid).`, `Source: Red Eléctrica (e·sios), PVPC 2.0TD active energy billing term, in €/kWh. Data downloaded on ${displayDate(datos.generadoFecha, tag)} at ${datos.generadoHora} (Madrid time).`)}</p>
      </>}
    />
  );
}
