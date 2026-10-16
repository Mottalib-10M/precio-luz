/** Opciones del selector « Dónde vives », comunes a las calculadoras (orden de REGIONES en engine/pvpc). */
import { P } from '../../lib/engine/params';
import { formatNumber } from '../../lib/format';
import { T, type L } from './kit';

export function opcionesRegion(lang: L, conImpuesto = false) {
  const ipsi = (x: number) => `IPSI ${formatNumber(x * 100, 0, lang)}${lang === 'es' ? ' %' : '%'}`;
  const tag = (s: string) => (conImpuesto ? ` (${s})` : '');
  return [
    { value: '0', label: T(lang, `Península y Baleares${tag('IVA')}`, `Mainland and Balearics${tag('VAT')}`) },
    { value: '1', label: T(lang, `Canarias${tag('IGIC 0 %')}`, `Canary Islands${tag('0% IGIC')}`) },
    { value: '2', label: `Ceuta${tag(ipsi(P.impuestos.ipsi_ceuta))}` },
    { value: '3', label: `Melilla${tag(ipsi(P.impuestos.ipsi_melilla))}` },
  ];
}
