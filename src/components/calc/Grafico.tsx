/**
 * Barras del precio hora a hora (SVG, sin biblioteca). Una barra por hora; color por tercio de precio
 * del día (barata, media, cara) con leyenda escrita, para que la información no dependa solo del color.
 * La hora en curso lleva un contorno. Cada barra tiene su ficha al pasar el ratón (<title>).
 */
import type { Hora } from '../../lib/engine/pvpc';
import { formatNumber } from '../../lib/format';
import type { L } from './kit';

export const COLORES = { barata: '#15803d', media: '#b45309', cara: '#b91c1c' } as const;
export function tercio(horas: Hora[], x: Hora): keyof typeof COLORES {
  const orden = [...horas].sort((a, b) => a.ttc - b.ttc);
  const pos = orden.findIndex((o) => o.i === x.i);
  return pos < horas.length / 3 ? 'barata' : pos < (2 * horas.length) / 3 ? 'media' : 'cara';
}

interface Props { horas: Hora[]; lang: L; actual?: number; marca?: { inicio: number; n: number }; conImp?: boolean; aria: string }

export default function Grafico({ horas, lang, actual = -1, marca, conImp = true, aria }: Props) {
  if (!horas.length) return null;
  const val = (x: Hora) => (conImp ? x.ttc : x.sin);
  const W = 720, H = 220, izq = 44, abajo = 24, arriba = 10;
  const max = Math.max(...horas.map(val)) * 1.08 || 1;
  const bw = (W - izq) / horas.length;
  const y = (v: number) => arriba + (1 - v / max) * (H - abajo - arriba);
  const pasos = [0, max / 2, max].map((v) => Math.round(v * 1000) / 1000);
  const et = { barata: lang === 'es' ? 'Hora barata (tercio más bajo del día)' : 'Cheap hour (lowest third of the day)', media: lang === 'es' ? 'Hora media' : 'Mid-priced hour', cara: lang === 'es' ? 'Hora cara (tercio más alto)' : 'Expensive hour (top third)' };
  return (
    <figure className="mt-4" data-chrome>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="h-auto w-full">
        {pasos.map((v, k) => (
          <g key={k}>
            <line x1={izq} x2={W} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeWidth="1" />
            <text x={izq - 6} y={y(v) + 4} fontSize="11" textAnchor="end" fill="#475569">{formatNumber(v, 2, lang)}</text>
          </g>
        ))}
        {horas.map((x, k) => {
          const top = y(val(x)), h = Math.max(2, H - abajo - top);
          const enMarca = marca && k >= marca.inicio && k < marca.inicio + marca.n;
          const color = COLORES[tercio(horas, x)];
          return (
            <g key={k}>
              <rect x={izq + k * bw + 1} y={top} width={Math.max(2, bw - 2)} height={h} rx="3" fill={color} opacity={marca && !enMarca ? 0.45 : 1}>
                <title>{`${String(x.h).padStart(2, '0')}:00 · ${formatNumber(val(x), 3, lang)} €/kWh · ${x.periodo}`}</title>
              </rect>
              {k === actual && <rect x={izq + k * bw} y={arriba - 2} width={bw} height={H - abajo - arriba + 2} fill="none" stroke="#0f172a" strokeWidth="2" rx="3" />}
            </g>
          );
        })}
        {horas.map((x, k) => (x.h % 3 === 0 && (k === 0 || horas[k - 1].h !== x.h) ? <text key={`t${k}`} x={izq + k * bw + bw / 2} y={H - 6} fontSize="11" textAnchor="middle" fill="#334155">{`${x.h}h`}</text> : null))}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-700">
        {(Object.keys(COLORES) as Array<keyof typeof COLORES>).map((k) => <span key={k} className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: COLORES[k] }} aria-hidden="true" />{et[k]}</span>)}
        <span>{lang === 'es' ? `€/kWh ${conImp ? 'con impuestos' : 'sin impuestos'}; contorno negro: la hora en curso.` : `€/kWh ${conImp ? 'with taxes' : 'before taxes'}; black outline: the current hour.`}</span>
      </figcaption>
    </figure>
  );
}
