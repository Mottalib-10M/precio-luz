/**
 * Mercado diario al cuarto de hora (96 precios, Red Eléctrica REData) frente al PVPC horario que se
 * factura. Muestra que la factura PVPC sigue siendo horaria y cuánto se mueve el mayorista dentro de
 * cada hora. Los precios del mercado son mayoristas (€/MWh, sin peajes, cargos ni impuestos).
 */
import Toggle from '../ui/Toggle';
import { Frame, ResultPanel, T, nr, useParams, useAhora, type L } from './kit';
import { displayDate } from '../../lib/format';
import type { Bundle } from '../../lib/bundle';

interface Props { lang: L; datos: Bundle; methodHref?: string }
const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const hhmm = (q: number) => `${String(Math.floor(q / 4)).padStart(2, '0')}:${String((q % 4) * 15).padStart(2, '0')}`;

export default function CuartosCalc({ lang, datos, methodHref }: Props) {
  const [v, set] = useParams({ d: 0 });
  const ahora = useAhora();
  const base = ahora?.fecha ?? datos.hoy;
  // Último día disponible si el elegido aún no está publicado.
  const objetivo = addDays(base, v.d === 1 ? 1 : 0);
  const dispo = Object.keys(datos.cuartos ?? {}).sort();
  const fecha = datos.cuartos?.[objetivo] ? objetivo : dispo.filter((f) => f <= objetivo).pop() ?? dispo[dispo.length - 1];
  const q = datos.cuartos?.[fecha] ?? [];
  const pv = datos.dias[fecha]?.p ?? [];
  const tag = lang === 'es' ? 'es-ES' : 'en-GB';
  const minI = q.indexOf(Math.min(...q)), maxI = q.indexOf(Math.max(...q));
  // Mayor diferencia entre los cuartos de una misma hora.
  let saltoH = 0, salto = 0;
  for (let h = 0; h * 4 < q.length; h++) { const s = q.slice(h * 4, h * 4 + 4); const d = Math.max(...s) - Math.min(...s); if (d > salto) { salto = d; saltoH = h; } }
  const media = q.reduce((s, x) => s + x, 0) / (q.length || 1);
  const rows = [
    { label: T(lang, `Cuarto más barato (${hhmm(minI)})`, `Cheapest quarter (${hhmm(minI)})`), value: `${nr(q[minI] ?? 0, lang, 2)} €/MWh` },
    { label: T(lang, `Cuarto más caro (${hhmm(maxI)})`, `Most expensive quarter (${hhmm(maxI)})`), value: `${nr(q[maxI] ?? 0, lang, 2)} €/MWh` },
    { label: T(lang, `Mayor salto dentro de una hora (${String(saltoH).padStart(2, '0')}:00)`, `Biggest swing within one hour (${String(saltoH).padStart(2, '0')}:00)`), value: `${nr(salto, lang, 2)} €/MWh`, strong: true },
    { label: T(lang, 'Cuartos publicados', 'Quarters published'), value: nr(q.length, lang) },
  ];
  const W = 720, H = 200, izq = 44;
  const max = Math.max(...q, ...pv, 1) * 1.08, min = Math.min(0, ...q);
  const y = (x: number) => 10 + ((max - x) / (max - min)) * (H - 34);
  const bw = (W - izq) / Math.max(1, q.length);
  return (
    <Frame
      form={<>
        <Toggle id="cu-d" label={T(lang, 'Día', 'Day')} value={String(v.d)} onChange={(x) => set('d')(Number(x))} options={[{ value: '0', label: T(lang, 'Hoy', 'Today') }, { value: '1', label: T(lang, 'Mañana', 'Tomorrow') }]} />
        <p className="text-sm text-navy-700">{fecha !== objetivo
          ? T(lang, `El mercado de ese día aún no está publicado (suele salir a primera hora de la tarde): se muestra el ${displayDate(fecha, tag)}.`, `That day’s market is not published yet (it usually comes out in the early afternoon): showing ${displayDate(fecha, tag)}.`)
          : T(lang, `Precio del mercado diario español, cuarto a cuarto, del ${displayDate(fecha, tag)}. Es el precio mayorista: sin peajes, cargos, margen ni impuestos.`, `Spanish day-ahead market price, quarter by quarter, for ${displayDate(fecha, tag)}. This is the wholesale price: no tolls, charges, margin or taxes.`)}</p>
      </>}
      result={<ResultPanel lang={lang} head={T(lang, `Media del mercado, ${displayDate(fecha, tag)}`, `Market average, ${displayDate(fecha, tag)}`)} value={`${nr(media, lang, 2)} €/MWh`} sub={T(lang, `${nr(media / 1000, lang, 4)} €/kWh mayorista`, `${nr(media / 1000, lang, 4)} €/kWh wholesale`)} rows={rows} methodHref={methodHref}
        hyp={T(lang, 'Serie «Precio mercado spot» de REData (Red Eléctrica). El PVPC no se factura por cuartos: los contadores domésticos miden por horas y el término de energía del PVPC tiene 24 precios al día.', 'REData “Precio mercado spot” series (Red Eléctrica). The PVPC is not billed by quarter: household meters record hourly and the PVPC energy term has 24 prices a day.')}
        copyText={`${T(lang, 'Mercado', 'Market')} ${fecha}: ${nr(media, lang, 2)} €/MWh`} />}
      after={q.length ? (
        <figure className="mt-4">
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={T(lang, 'Mercado diario por cuartos de hora y PVPC horario', 'Day-ahead market by quarter hour and hourly PVPC')} className="h-auto w-full">
            {[min, (min + max) / 2, max].map((t, k) => <g key={k}><line x1={izq} x2={W} y1={y(t)} y2={y(t)} stroke="#e2e8f0" /><text x={izq - 6} y={y(t) + 4} fontSize="11" textAnchor="end" fill="#475569">{nr(t, lang, 0)}</text></g>)}
            {q.map((x, k) => <rect key={k} x={izq + k * bw} y={Math.min(y(x), y(0))} width={Math.max(1, bw - 1)} height={Math.max(1, Math.abs(y(0) - y(x)))} fill="#475569"><title>{`${hhmm(k)} · ${nr(x, lang, 2)} €/MWh`}</title></rect>)}
            {pv.length === 24 && <polyline fill="none" stroke="#AA151B" strokeWidth="2" points={pv.flatMap((p, h) => [`${izq + h * 4 * bw},${y(p)}`, `${izq + (h + 1) * 4 * bw},${y(p)}`]).join(' ')} />}
            {[0, 6, 12, 18].map((h) => <text key={h} x={izq + h * 4 * bw} y={H - 6} fontSize="11" fill="#334155">{`${h}h`}</text>)}
          </svg>
          <figcaption className="mt-1 text-xs text-navy-700">{T(lang, 'Barras grises: mercado diario cada 15 minutos (€/MWh). Línea roja: término de energía del PVPC de cada hora (€/MWh, sin impuestos, con peajes y cargos).', 'Grey bars: day-ahead market every 15 minutes (€/MWh). Red line: PVPC energy term for each hour (€/MWh, before taxes, including tolls and charges).')}</figcaption>
        </figure>
      ) : null}
    />
  );
}
