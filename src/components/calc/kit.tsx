/**
 * Piezas comunes de las calculadoras.
 * - `useParams`: estado numérico; primer render = valores por defecto del build (RECETTE §17.5), luego el
 *   enlace compartido se aplica en useEffect y la URL solo cambia tras una interacción (url-state.ts).
 * - `useHoy`: fecha de Madrid del navegador, leída después del montaje (nunca en el primer render).
 * - `ResultPanel`: la tarjeta de resultado (cifra principal, líneas, barra, hipótesis, copiar/compartir/imprimir).
 */
import { useEffect, useState, type ReactNode } from 'react';
import StackedBar from '../ui/StackedBar';
import { readParams, num, updateURL } from '../../lib/url-state';
import { formatMoney, formatPercent, formatNumber } from '../../lib/format';

export type L = 'es' | 'en';
export const T = <A,>(l: L, es: A, en: A) => (l === 'en' ? en : es);
/** Importe en euros: dos decimales por debajo de 100 € (el coste de un lavado se cuenta en céntimos). */
export const eur = (x: number, l: L, d?: number) => formatMoney(x, d ?? (Math.abs(x) < 100 ? 2 : 0), l);
export const pct = (x: number, l: L, d = 1) => formatPercent(x, d, l);
export const nr = (x: number, l: L, d = 0) => formatNumber(x, d, l);
/** Precio por kWh, tres decimales. */
export const kwh = (x: number, l: L, d = 3) => `${formatNumber(x, d, l)} €/kWh`;

export function useParams<K extends string>(defs: Record<K, number>): [Record<K, number>, (k: K) => (x: number) => void] {
  const [v, setV] = useState<Record<K, number>>(defs);
  useEffect(() => {
    const u = readParams(window.location.search);
    if (![...u.keys()].length) return;
    setV((o) => Object.fromEntries(Object.keys(o).map((k) => [k, num(u, k, (o as Record<string, number>)[k])])) as Record<K, number>);
  }, []);
  useEffect(() => { updateURL(v as Record<string, number>); }, [v]);
  const set = (k: K) => (x: number) => setV((o) => ({ ...o, [k]: x }));
  return [v, set];
}

/** Fecha (AAAA-MM-DD) y hora decimal de Madrid; null en el primer render (HTML del build). */
export function useAhora(): { fecha: string; hora: number } | null {
  const [a, setA] = useState<{ fecha: string; hora: number } | null>(null);
  useEffect(() => {
    const leer = () => {
      const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
      setA({ fecha: `${p.year}-${p.month}-${p.day}`, hora: Number(p.hour) + Number(p.minute) / 60 });
    };
    leer();
    const id = setInterval(leer, 60_000);
    return () => clearInterval(id);
  }, []);
  return a;
}

export interface Row { label: string; value: string; strong?: boolean; note?: boolean }
interface PanelProps {
  lang: L; head: string; value: string; sub?: string; rows: Row[]; notes?: ReactNode[];
  bar?: { segments: Array<{ label: string; value: number; color: string }>; total: number; aria: string };
  hyp?: string; methodHref?: string; copyText: string; children?: ReactNode; badge?: ReactNode;
}
export function ResultPanel({ lang, head, value, sub, rows, notes = [], bar, hyp, methodHref, copyText, children, badge }: PanelProps) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(`${copyText} · ${window.location.href}`).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); };
  const btn = 'rounded-lg border border-navy-300 bg-white px-3 py-2 font-medium text-navy-800 hover:bg-navy-50';
  return (
    <div aria-live="polite" data-resultat className="mt-6 rounded-xl border border-accent-200 bg-accent-50/60 p-4 sm:p-5 lg:sticky lg:top-20 lg:mt-0">
      <div className="filete-bandera mb-3" aria-hidden="true" />
      <p className="text-sm font-medium text-navy-700">{head}</p>
      <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{value}</p>
      {sub && <p className="tabular-nums mt-1 text-navy-700">{sub}</p>}
      {badge}
      {bar && <div className="mt-4"><StackedBar segments={bar.segments} total={bar.total} ariaPrefix={bar.aria} /></div>}
      <table className="mt-4 w-full text-sm"><tbody className="divide-y divide-navy-200">
        {rows.map((r, i) => <tr key={i} className={r.strong ? 'font-semibold' : ''}><td className={`py-1.5 pr-3 ${r.note ? 'text-navy-600' : 'text-navy-700'}`}>{r.label}</td><td className="tabular-nums py-1.5 text-right text-navy-900">{r.value}</td></tr>)}
      </tbody></table>
      {notes.length > 0 && <ul className="mt-3 space-y-1 text-sm text-navy-700">{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>}
      {children}
      {hyp && <details className="mt-3 text-sm text-navy-700"><summary className="cursor-pointer font-medium">{T(lang, 'Hipótesis del cálculo', 'Assumptions')}</summary><p className="mt-2">{hyp} {methodHref && <a href={methodHref} className="underline">{T(lang, 'Método y fuentes', 'Method and sources')}</a>}</p></details>}
      <div className="no-print mt-4 flex flex-wrap gap-2 text-sm">
        <button type="button" onClick={copy} className={btn}>{copied ? T(lang, 'Copiado', 'Copied') : T(lang, 'Copiar el resultado', 'Copy result')}</button>
        <button type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)} className={btn}>{T(lang, 'Enlace para compartir', 'Share link')}</button>
        <button type="button" onClick={() => window.print()} className={btn}>{T(lang, 'Imprimir', 'Print')}</button>
      </div>
    </div>
  );
}

/** Marco común: formulario a la izquierda, resultado a la derecha (apilados en móvil). */
export function Frame({ form, result, after }: { form: ReactNode; result: ReactNode; after?: ReactNode }) {
  return (
    <div className="rechner not-prose rounded-xl border border-navy-200 bg-white p-4 sm:p-6" data-chrome>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start lg:gap-6">
        <form onSubmit={(e) => e.preventDefault()} className="content-start space-y-5">{form}</form>
        {result}
      </div>
      {after}
    </div>
  );
}

/** Selector de botones (día, región…): opción elegida a toda el área (RECETTE §10.3). */
export function Botones<V extends string | number>({ id, label, value, options, onChange }: { id: string; label: string; value: V; options: Array<{ value: V; label: string }>; onChange: (v: V) => void }) {
  return (
    <div className="grid grid-rows-subgrid row-span-3">
      <span id={`${id}-label`} className="block text-sm font-medium text-navy-800">{label}</span>
      <div role="radiogroup" aria-labelledby={`${id}-label`} className="mt-1 grid h-12 grid-flow-col auto-cols-fr overflow-hidden rounded-lg border border-navy-300">
        {options.map((o) => (
          <button key={String(o.value)} type="button" role="radio" aria-checked={o.value === value} onClick={() => onChange(o.value)}
            className={`h-full px-2 text-sm font-medium ${o.value === value ? 'bg-accent-700 text-white' : 'bg-white text-navy-800 hover:bg-navy-50'}`}>{o.label}</button>
        ))}
      </div>
      <span />
    </div>
  );
}
