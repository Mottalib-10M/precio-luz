/**
 * Precio medio del PVPC mes a mes (con y sin impuestos), calculado en el build a partir de los
 * archivos diarios de Red Eléctrica. El visitante elige un mes y ve su media, mínimo y máximo.
 */
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { Frame, ResultPanel, T, kwh, nr, useParams, type L } from './kit';

export interface Mes { mes: string; sin: number; ttc: number; min: number; max: number; dias: number }
interface Props { lang: L; meses: Mes[]; methodHref?: string }

const nombreMes = (m: string, lang: L) => new Date(`${m}-15T12:00:00Z`).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export default function HistorialCalc({ lang, meses, methodHref }: Props) {
  const [v, set] = useParams({ m: meses.length - 1, imp: 1 });
  const i = Math.max(0, Math.min(meses.length - 1, Math.round(v.m)));
  const m = meses[i];
  const conImp = v.imp !== 0;
  const val = (x: Mes) => (conImp ? x.ttc : x.sin);
  const prevYear = meses.find((x) => x.mes === `${Number(m.mes.slice(0, 4)) - 1}${m.mes.slice(4)}`);
  const prev = meses[i - 1];
  const max = Math.max(...meses.map(val)) * 1.1;
  const W = 720, H = 200, izq = 44, bw = (W - izq) / meses.length;
  const rows = [
    { label: T(lang, 'Días con datos', 'Days with data'), value: nr(m.dias, lang) },
    { label: T(lang, 'Hora más barata del mes', 'Cheapest hour of the month'), value: kwh(m.min, lang) },
    { label: T(lang, 'Hora más cara del mes', 'Most expensive hour of the month'), value: kwh(m.max, lang) },
    ...(prev ? [{ label: T(lang, `Frente a ${nombreMes(prev.mes, lang)}`, `Versus ${nombreMes(prev.mes, lang)}`), value: `${val(m) >= val(prev) ? '+' : '−'}${nr(Math.abs(val(m) / val(prev) - 1) * 100, lang, 1)} %` }] : []),
    ...(prevYear ? [{ label: T(lang, `Frente a ${nombreMes(prevYear.mes, lang)}`, `Versus ${nombreMes(prevYear.mes, lang)}`), value: `${val(m) >= val(prevYear) ? '+' : '−'}${nr(Math.abs(val(m) / val(prevYear) - 1) * 100, lang, 1)} %` }] : []),
    { label: conImp ? T(lang, 'Media sin impuestos', 'Average before taxes') : T(lang, 'Media con impuestos', 'Average with taxes'), value: kwh(conImp ? m.sin : m.ttc, lang), note: true },
  ];
  return (
    <Frame
      form={<>
        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
          <SelectField id="hi-m" label={T(lang, 'Mes', 'Month')} value={String(i)} onChange={(x) => set('m')(Number(x))} options={meses.map((x, k) => ({ value: String(k), label: nombreMes(x.mes, lang) }))} />
          <Toggle id="hi-imp" label={T(lang, 'Impuestos', 'Taxes')} value={String(v.imp)} onChange={(x) => set('imp')(Number(x))} options={[{ value: '1', label: T(lang, 'Incluidos', 'Included') }, { value: '0', label: T(lang, 'Excluidos', 'Excluded') }]} />
        </div>
        <p className="text-sm text-navy-700">{T(lang, 'Media simple de todas las horas del mes del término de energía PVPC 2.0TD (Península), con los impuestos vigentes cada día. Un mes en curso solo cuenta los días ya publicados.', 'Simple average of every hour of the month of the PVPC 2.0TD energy term (mainland), with the taxes in force each day. A month in progress only counts the days already published.')}</p>
      </>}
      result={<ResultPanel lang={lang} head={T(lang, `Precio medio de ${nombreMes(m.mes, lang)}`, `Average price in ${nombreMes(m.mes, lang)}`)} value={kwh(val(m), lang)} rows={rows} methodHref={methodHref}
        copyText={`${nombreMes(m.mes, lang)}: ${kwh(val(m), lang)}`} />}
      after={
        <figure className="mt-4">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={T(lang, 'Precio medio mensual del PVPC', 'Monthly average PVPC price')} className="h-auto w-full">
            {[0, max / 2, max].map((t, k) => <g key={k}><line x1={izq} x2={W} y1={10 + (1 - t / max) * (H - 34)} y2={10 + (1 - t / max) * (H - 34)} stroke="#e2e8f0" /><text x={izq - 6} y={14 + (1 - t / max) * (H - 34)} fontSize="11" textAnchor="end" fill="#475569">{nr(t, lang, 2)}</text></g>)}
            {meses.map((x, k) => { const top = 10 + (1 - val(x) / max) * (H - 34); return <rect key={x.mes} x={izq + k * bw + 2} y={top} width={Math.max(2, bw - 4)} height={H - 24 - top} rx="3" fill={k === i ? '#AA151B' : '#94a3b8'}><title>{`${nombreMes(x.mes, lang)} · ${nr(val(x), lang, 3)} €/kWh`}</title></rect>; })}
            {meses.map((x, k) => (k % 2 === 0 ? <text key={`t${k}`} x={izq + k * bw + bw / 2} y={H - 6} fontSize="10" textAnchor="middle" fill="#334155">{x.mes.slice(5)}/{x.mes.slice(2, 4)}</text> : null))}
          </svg>
          <figcaption className="mt-1 text-xs text-navy-700">{T(lang, `€/kWh ${conImp ? 'con impuestos' : 'sin impuestos'}; en rojo, el mes elegido.`, `€/kWh ${conImp ? 'with taxes' : 'before taxes'}; in red, the selected month.`)}</figcaption>
        </figure>
      }
    />
  );
}
