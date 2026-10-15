/**
 * Bono social eléctrico: ¿me corresponde?, ¿vulnerable o severo?, ¿cuánto baja mi factura?
 * Reglas del Real Decreto 897/2017 (arts. 3 y 6) y descuentos del RDL 7/2026 (42,5 % y 57,5 % en 2026).
 */
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { Frame, ResultPanel, T, eur, nr, useParams, type L } from './kit';
import { categoria, descuento, limiteKwh, type Via } from '../../lib/engine/bono';
import { factura } from '../../lib/engine/factura';
import { energiaPeriodo } from './FacturaCalc';
import { P } from '../../lib/engine/params';
import type { Bundle } from '../../lib/bundle';

interface Props { lang: L; datos: Bundle; methodHref?: string }
const VIAS: Via[] = ['renta', 'numerosa', 'pensionista', 'imv'];
const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

export default function BonoCalc({ lang, datos, methodHref }: Props) {
  const [v, set] = useParams({ ad: 2, me: 1, renta: 15000, via: 0, esp: 0, kwh: 270, kw: 4.6 });
  const via = VIAS[v.via] ?? 'renta';
  const c = categoria({ adultos: Math.max(1, Math.round(v.ad)), menores: Math.round(v.me), renta: v.renta, especial: v.esp === 1, via });
  const d = descuento(c.cat);
  const personas = Math.max(1, Math.round(v.ad) + Math.round(v.me));
  const lim = limiteKwh(personas, Math.round(v.me), via);
  const hasta = datos.hoy, desde = addDays(hasta, -29);
  const e = energiaPeriodo(datos, desde, hasta, v.kwh);
  const sin = factura({ dias: e.dias, kwP1: v.kw, kwP2: v.kw, kwh: v.kwh, energia: e.energia, fecha: hasta });
  const con = factura({ dias: e.dias, kwP1: v.kw, kwP2: v.kw, kwh: v.kwh, energia: e.energia, fecha: hasta, bono: d, limiteAnualKwh: lim });
  const catTxt = c.cat === 'severo' ? T(lang, 'Vulnerable severo', 'Severely vulnerable') : c.cat === 'vulnerable' ? T(lang, 'Vulnerable', 'Vulnerable') : T(lang, 'Sin derecho por renta', 'Not eligible on income');
  const rows = [
    { label: T(lang, 'Categoría estimada', 'Estimated category'), value: catTxt, strong: true },
    { label: T(lang, 'Descuento en 2026', 'Discount in 2026'), value: `${nr(d * 100, lang, 1)} %` },
    { label: T(lang, 'Umbral de renta de tu hogar', 'Income threshold for your household'), value: eur(c.umbral, lang, 0) },
    { label: T(lang, 'Umbral para vulnerable severo', 'Threshold for severely vulnerable'), value: eur(c.umbralSevero, lang, 0) },
    { label: T(lang, 'kWh al año con descuento', 'Discounted kWh per year'), value: `${nr(lim, lang)} kWh` },
    { label: T(lang, 'Factura de 30 días sin bono', '30-day bill without the discount'), value: eur(sin.total, lang) },
    { label: T(lang, 'Con bono social', 'With the social discount'), value: eur(con.total, lang) },
  ];
  return (
    <Frame
      form={<>
        <div className="grid grid-cols-2 gap-x-4">
          <NumberField id="bs-ad" label={T(lang, 'Adultos en casa', 'Adults at home')} value={v.ad} onChange={set('ad')} min={1} max={12} lang={lang} />
          <NumberField id="bs-me" label={T(lang, 'Menores de edad', 'Under-18s')} value={v.me} onChange={set('me')} min={0} max={12} lang={lang} />
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <NumberField id="bs-renta" label={T(lang, 'Renta anual del hogar', 'Household yearly income')} value={v.renta} onChange={set('renta')} unit="€" min={0} max={500000} lang={lang} help={T(lang, 'Suma de las bases imponibles del IRPF de todos.', 'Sum of everyone’s taxable income (IRPF).')} />
          <SelectField id="bs-via" label={T(lang, 'Situación', 'Situation')} value={String(v.via)} onChange={(x) => set('via')(Number(x))} options={[{ value: '0', label: T(lang, 'Por renta', 'By income') }, { value: '1', label: T(lang, 'Familia numerosa', 'Large family') }, { value: '2', label: T(lang, 'Pensionistas con pensión mínima', 'Minimum-pension pensioners') }, { value: '3', label: T(lang, 'Ingreso Mínimo Vital', 'Minimum Living Income') }]} />
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <Toggle id="bs-esp" label={T(lang, 'Discapacidad ≥ 33 %, dependencia, violencia de género…', 'Disability ≥ 33%, dependency, gender violence…')} value={String(v.esp)} onChange={(x) => set('esp')(Number(x))} options={[{ value: '0', label: T(lang, 'No', 'No') }, { value: '1', label: T(lang, 'Sí', 'Yes') }]} />
          <NumberField id="bs-kwh" label={T(lang, 'Consumo en 30 días', 'Use over 30 days')} value={v.kwh} onChange={set('kwh')} unit="kWh" min={0} max={5000} lang={lang} />
        </div>
        <p className="text-sm text-navy-700">{T(lang, `El bono social solo existe con el PVPC y se pide a una comercializadora de referencia. IPREM de 14 pagas: ${eur(P.bono_social.iprem_14_pagas, lang, 0)}.`, `The social discount only exists with the PVPC and is requested from a reference retailer. 14-payment IPREM: ${eur(P.bono_social.iprem_14_pagas, lang, 0)}.`)}</p>
      </>}
      result={<ResultPanel lang={lang} head={T(lang, 'Ahorro estimado en 30 días', 'Estimated saving over 30 days')} value={eur(sin.total - con.total, lang)} rows={rows} methodHref={methodHref}
        hyp={T(lang, 'Orientación según el Real Decreto 897/2017: la comercializadora de referencia comprueba los datos con la Agencia Tributaria y los servicios sociales. El descuento se aplica a la potencia y a la energía hasta el límite de kWh, antes de impuestos.', 'Guidance under Royal Decree 897/2017: the reference retailer checks the data with the Tax Agency and social services. The discount applies to power and energy up to the kWh limit, before taxes.')}
        copyText={`${T(lang, 'Bono social', 'Social discount')}: ${catTxt}, ${eur(sin.total - con.total, lang)}`} />}
    />
  );
}
