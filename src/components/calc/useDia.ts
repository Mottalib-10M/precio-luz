/**
 * Elige el día que se muestra (hoy o mañana en Madrid) entre los datos recibidos por props.
 * Primer render: el día del build (HTML idéntico al del servidor). Después del montaje: la fecha real.
 * Si Red Eléctrica no ha publicado ese día, precio medio estimado (perfilEstimado), marcado como tal.
 */
import { useMemo } from 'react';
import { diaConImpuestos, perfilEstimado, type Region, type Hora } from '../../lib/engine/pvpc';
import type { Bundle } from '../../lib/bundle';
import { useAhora } from './kit';

const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

export interface DiaVista { fecha: string; horas: Hora[]; estimado: boolean; diasUsados: number; actual: number; ahora: { fecha: string; hora: number } | null }

export function useDia(b: Bundle, offset: number, kw: number, region: Region): DiaVista {
  const ahora = useAhora();
  return useMemo(() => {
    const base = ahora?.fecha ?? b.hoy;
    const fecha = addDays(base, offset);
    const real = b.dias[fecha];
    let horas: Hora[], estimado = false, diasUsados = 0;
    if (real) horas = diaConImpuestos(fecha, real, kw, region);
    else {
      const e = perfilEstimado(fecha, b.dias);
      horas = diaConImpuestos(fecha, { p: e.p, t: e.t, ...(e.pcm ? { pcm: e.pcm, tcm: e.tcm } : {}) }, kw, region);
      estimado = true; diasUsados = e.dias.length;
    }
    const actual = ahora && ahora.fecha === fecha ? horas.findIndex((x) => x.h === Math.floor(ahora.hora)) : -1;
    return { fecha, horas, estimado, diasUsados, actual, ahora };
  }, [ahora?.fecha, ahora && Math.floor(ahora.hora), b, offset, kw, region]);
}
export { addDays };
