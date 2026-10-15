/**
 * Factura de la luz con el PVPC real de los últimos 30 días ('factura'), comparada con un precio fijo
 * del mercado libre ('comparar'). El consumo se reparte hora a hora con el perfil oficial 2.0TD de
 * Red Eléctrica (COF2TD) y cada hora se paga a su precio PVPC.
 */
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { Frame, ResultPanel, T, eur, kwh, nr, useParams, type L } from './kit';
import { factura, repartoPerfil, POT_P1_PVPC, POT_P2_PVPC } from '../../lib/engine/factura';
import { limiteKwh } from '../../lib/engine/bono';
import { P } from '../../lib/engine/params';
import { displayDate } from '../../lib/format';
import type { Bundle } from '../../lib/bundle';

interface Props { lang: L; mode?: 'factura' | 'comparar'; datos: Bundle; precioLibre: number; methodHref?: string; bono?: boolean }

/** Energía (€ sin impuestos) de `kwh` repartidos con el perfil COF2TD sobre los días del periodo. */
export function energiaPeriodo(datos: Bundle, desde: string, hasta: string, kwhTotal: number) {
  const dias = Object.keys(datos.dias).filter((f) => f >= desde && f <= hasta).sort();
  const precios: number[] = [], perfil: number[] = [];
  for (const f of dias) { const d = datos.dias[f]; d.p.forEach((p, i) => { precios.push(p / 1000); perfil.push(d.c?.[i] ?? 1); }); }
  const reparto = repartoPerfil(kwhTotal, perfil);
  const energia = reparto.reduce((s, k, i) => s + k * precios[i], 0);
  return { energia, dias: dias.length, desde: dias[0], hasta: dias[dias.length - 1], precioMedio: kwhTotal > 0 ? energia / kwhTotal : 0 };
}

const addDays = (iso: string, n: number) => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

export default function FacturaCalc({ lang, mode = 'factura', datos, precioLibre, methodHref, bono = false }: Props) {
  const potLibreDef = Math.round(((POT_P1_PVPC + POT_P2_PVPC) / 365) * 10000) / 100; // céntimos por kW y día
  const [v, set] = useParams({ kw: 4.6, kwh: 270, r: 0, b: bono ? 1 : 0, per: 2, lib: Math.round(precioLibre * 10000) / 100, plib: potLibreDef });
  const hasta = datos.hoy, desde = addDays(hasta, -29);
  const e = energiaPeriodo(datos, desde, hasta, v.kwh);
  const region = v.r === 1 ? 'canarias' as const : 'peninsula' as const;
  const desc = v.b === 2 ? P.bono_social.descuento_severo : v.b === 1 ? P.bono_social.descuento_vulnerable : 0;
  const lim = limiteKwh(Math.round(v.per), 0, 'renta');
  const f = factura({ dias: e.dias, kwP1: v.kw, kwP2: v.kw, kwh: v.kwh, energia: e.energia, fecha: hasta, region, bono: desc, limiteAnualKwh: lim });
  const libre = factura({ dias: e.dias, kwP1: v.kw, kwP2: v.kw, kwh: v.kwh, energia: v.kwh * (v.lib / 100), potenciaLibreKwDia: v.plib / 100, fecha: hasta, region });
  const pvpcSinBono = desc > 0 ? factura({ dias: e.dias, kwP1: v.kw, kwP2: v.kw, kwh: v.kwh, energia: e.energia, fecha: hasta, region }) : f;
  const tag = lang === 'es' ? 'es-ES' : 'en-GB';
  const periodo = `${displayDate(e.desde, tag)} – ${displayDate(e.hasta, tag)}`;
  const ind = f.imp.indirecto;
  const rows = [
    { label: T(lang, `Potencia (${nr(v.kw, lang, 2)} kW × ${e.dias} días)`, `Power (${nr(v.kw, lang, 2)} kW × ${e.dias} days)`), value: eur(f.potencia, lang) },
    { label: T(lang, `Energía (${nr(v.kwh, lang)} kWh a ${kwh(e.precioMedio, lang)} de media)`, `Energy (${nr(v.kwh, lang)} kWh at ${kwh(e.precioMedio, lang)} on average)`), value: eur(f.energia, lang) },
    { label: T(lang, 'Financiación del bono social', 'Social discount funding'), value: eur(f.financiacionBono, lang) },
    ...(f.descuentoBono > 0 ? [{ label: T(lang, `Descuento bono social (${nr(desc * 100, lang, 1)} %, ${nr(f.kwhConDescuento, lang)} kWh con descuento)`, `Social discount (${nr(desc * 100, lang, 1)}%, ${nr(f.kwhConDescuento, lang)} kWh discounted)`), value: `−${eur(f.descuentoBono, lang)}` }] : []),
    { label: T(lang, `Impuesto eléctrico (${nr(f.imp.iee * 100, lang, 2)} %)`, `Electricity tax (${nr(f.imp.iee * 100, lang, 2)}%)`), value: eur(f.iee, lang) },
    { label: T(lang, 'Alquiler del contador', 'Meter rental'), value: eur(f.contador, lang) },
    { label: `${ind} (${nr(f.imp.iva * 100, lang, 0)} %)`, value: eur(f.indirecto, lang) },
    ...(mode === 'comparar' ? [
      { label: T(lang, `Con tu precio fijo (${kwh(v.lib / 100, lang)} y ${nr(v.plib / 100, lang, 4)} €/kW·día)`, `With your fixed price (${kwh(v.lib / 100, lang)} and ${nr(v.plib / 100, lang, 4)} €/kW·day)`), value: eur(libre.total, lang), strong: true },
      { label: libre.total > f.total ? T(lang, 'El PVPC te ahorraría', 'PVPC would save you') : T(lang, 'El precio fijo te ahorraría', 'The fixed price would save you'), value: eur(Math.abs(libre.total - f.total), lang) },
    ] : []),
    ...(desc > 0 ? [{ label: T(lang, 'La misma factura sin bono social', 'The same bill without the social discount'), value: eur(pvpcSinBono.total, lang), note: true }] : []),
  ];
  const segs = f.descuentoBono > 0 ? [
    { label: T(lang, 'Potencia y energía, con el descuento', 'Power and energy, after the discount'), value: f.potencia + f.energia - f.descuentoBono, color: '#AA151B' },
    { label: T(lang, 'Impuestos', 'Taxes'), value: f.iee + f.indirecto, color: '#334155' },
    { label: T(lang, 'Contador y financiación del bono', 'Meter and discount funding'), value: f.contador + f.financiacionBono, color: '#94a3b8' },
  ] : [
    { label: T(lang, 'Potencia', 'Power'), value: f.potencia, color: '#AA151B' },
    { label: T(lang, 'Energía', 'Energy'), value: f.energia, color: '#b45309' },
    { label: T(lang, 'Impuestos', 'Taxes'), value: f.iee + f.indirecto, color: '#334155' },
    { label: T(lang, 'Contador y financiación del bono', 'Meter and discount funding'), value: f.contador + f.financiacionBono, color: '#94a3b8' },
  ];
  return (
    <Frame
      form={<>
        <div className="grid grid-cols-2 gap-x-4">
          <NumberField id="fc-kwh" label={T(lang, 'Consumo en 30 días', 'Use over 30 days')} value={v.kwh} onChange={set('kwh')} unit="kWh" min={0} max={5000} lang={lang} help={T(lang, 'En tu factura: «consumo» o «energía consumida».', 'On your bill: “consumo” (energy used).')} />
          <NumberField id="fc-kw" label={T(lang, 'Potencia contratada', 'Contracted power')} value={v.kw} onChange={set('kw')} unit="kW" min={0.5} max={15} decimals={2} lang={lang} />
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <SelectField id="fc-r" label={T(lang, 'Dónde vives', 'Where you live')} value={String(v.r)} onChange={(x) => set('r')(Number(x))} options={[{ value: '0', label: T(lang, 'Península y Baleares (IVA)', 'Mainland and Balearics (VAT)') }, { value: '1', label: T(lang, 'Canarias (IGIC 0 %)', 'Canary Islands (0% IGIC)') }]} />
          <SelectField id="fc-b" label={T(lang, 'Bono social', 'Social discount')} value={String(v.b)} onChange={(x) => set('b')(Number(x))} options={[{ value: '0', label: T(lang, 'No', 'No') }, { value: '1', label: T(lang, `Vulnerable (${nr(P.bono_social.descuento_vulnerable * 100, lang, 1)} %)`, `Vulnerable (${nr(P.bono_social.descuento_vulnerable * 100, lang, 1)}%)`) }, { value: '2', label: T(lang, `Vulnerable severo (${nr(P.bono_social.descuento_severo * 100, lang, 1)} %)`, `Severely vulnerable (${nr(P.bono_social.descuento_severo * 100, lang, 1)}%)`) }]} />
        </div>
        {v.b > 0 && <div className="grid grid-cols-2 gap-x-4"><NumberField id="fc-per" label={T(lang, 'Personas en casa', 'People at home')} value={v.per} onChange={set('per')} min={1} max={12} lang={lang} help={T(lang, `Límite con descuento: ${nr(lim, lang)} kWh al año.`, `Discount limit: ${nr(lim, lang)} kWh a year.`)} /></div>}
        {mode === 'comparar' && (
          <div className="grid grid-cols-2 gap-x-4">
            <NumberField id="fc-lib" label={T(lang, 'Precio fijo de la energía', 'Fixed energy price')} value={v.lib} onChange={set('lib')} unit="c€/kWh" min={0} max={200} decimals={2} lang={lang} help={T(lang, 'En céntimos y sin impuestos: 0,1299 €/kWh son 12,99.', 'In cents, before tax: 0.1299 €/kWh is 12.99.')} />
            <NumberField id="fc-plib" label={T(lang, 'Precio de la potencia', 'Power price')} value={v.plib} onChange={set('plib')} unit="c€/kW·día" min={0} max={200} decimals={2} lang={lang} help={T(lang, 'En céntimos: 0,0864 €/kW·día son 8,64.', 'In cents: 0.0864 €/kW·day is 8.64.')} />
          </div>
        )}
        <p className="text-sm text-navy-700">{T(lang, `Precios PVPC reales de ${periodo}, hora a hora, con el reparto de consumo tipo que publica Red Eléctrica. Peajes, cargos e impuestos de ${P.year} del BOE.`, `Actual hourly PVPC prices for ${periodo}, with Red Eléctrica’s standard consumption profile. ${P.year} tolls, charges and taxes from the BOE.`)}</p>
      </>}
      result={<ResultPanel lang={lang} head={mode === 'comparar' ? T(lang, 'Factura PVPC de 30 días', '30-day PVPC bill') : T(lang, 'Tu factura PVPC de 30 días', 'Your 30-day PVPC bill')} value={eur(f.total, lang)} sub={T(lang, `${eur(f.total / Math.max(1, v.kwh), lang, 3)} por kWh, todo incluido`, `${eur(f.total / Math.max(1, v.kwh), lang, 3)} per kWh, all included`)} rows={rows} methodHref={methodHref}
        bar={{ segments: segs, total: segs.reduce((s, x) => s + x.value, 0), aria: T(lang, 'Reparto de la factura', 'Bill breakdown') }}
        hyp={T(lang, `Potencia con peajes, cargos y margen de comercialización del PVPC (${nr(POT_P1_PVPC, lang, 3)} y ${nr(POT_P2_PVPC, lang, 3)} €/kW·año en punta-llano y valle), misma potencia en los dos periodos, contador monofásico, impuestos del día de hoy.`, `Power with PVPC tolls, charges and retail margin (${nr(POT_P1_PVPC, lang, 3)} and ${nr(POT_P2_PVPC, lang, 3)} €/kW·year for peak-standard and off-peak), same power in both periods, single-phase meter, today’s taxes.`)}
        copyText={`${T(lang, 'Factura PVPC 30 días', '30-day PVPC bill')}: ${eur(f.total, lang)}`} />}
    />
  );
}
