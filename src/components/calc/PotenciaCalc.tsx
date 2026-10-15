/**
 * Potencia contratada: lo que cuesta al año cada kW en el PVPC (peajes, cargos, margen, impuesto
 * eléctrico e IVA) y lo que se ahorra bajando de escalón. Escalones = intensidad del interruptor
 * de control de potencia × 230 V.
 */
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { Frame, ResultPanel, T, eur, nr, useParams, type L } from './kit';
import { POT_P1_PVPC, POT_P2_PVPC } from '../../lib/engine/factura';
import { impuestosDelDia } from '../../lib/engine/pvpc';
import type { Bundle } from '../../lib/bundle';
import { P } from '../../lib/engine/params';

interface Props { lang: L; datos: Bundle; methodHref?: string }
/** Escalones habituales: amperios del ICP a 230 V. */
export const ESCALONES = [10, 15, 20, 25, 30, 35, 40, 45, 50].map((a) => ({ a, kw: Math.round(a * 230) / 1000 }));

export function costePotenciaAnual(kwP1: number, kwP2: number, fecha: string) {
  const imp = impuestosDelDia(fecha, Math.max(kwP1, kwP2));
  const base = kwP1 * POT_P1_PVPC + kwP2 * POT_P2_PVPC;
  return { base, total: base * (1 + imp.iee) * (1 + imp.iva), imp };
}

export default function PotenciaCalc({ lang, datos, methodHref }: Props) {
  const [v, set] = useParams({ act: 4.6, nueva: 3.45, p2: 0 });
  const p2act = v.p2 > 0 ? v.p2 : v.act;
  const p2new = v.p2 > 0 ? Math.min(v.p2, v.nueva) : v.nueva;
  const a = costePotenciaAnual(v.act, p2act, datos.hoy);
  const b = costePotenciaAnual(v.nueva, p2new, datos.hoy);
  const ahorro = a.total - b.total;
  const opts = ESCALONES.map((e) => ({ value: String(e.kw), label: T(lang, `${nr(e.kw, lang, 2)} kW (${e.a} A)`, `${nr(e.kw, lang, 2)} kW (${e.a} A)`) }));
  const rows = [
    { label: T(lang, `Con ${nr(v.act, lang, 2)} kW al año`, `With ${nr(v.act, lang, 2)} kW per year`), value: eur(a.total, lang) },
    { label: T(lang, `Con ${nr(v.nueva, lang, 2)} kW al año`, `With ${nr(v.nueva, lang, 2)} kW per year`), value: eur(b.total, lang) },
    { label: T(lang, 'Diferencia al mes', 'Difference per month'), value: eur(ahorro / 12, lang), strong: true },
    { label: T(lang, 'Cada kW en punta-llano cuesta al año', 'Each peak-standard kW costs per year'), value: eur(POT_P1_PVPC * (1 + a.imp.iee) * (1 + a.imp.iva), lang), note: true },
    { label: T(lang, 'Cada kW en valle cuesta al año', 'Each off-peak kW costs per year'), value: eur(POT_P2_PVPC * (1 + a.imp.iee) * (1 + a.imp.iva), lang), note: true },
  ];
  return (
    <Frame
      form={<>
        <div className="grid grid-cols-2 gap-x-4">
          <NumberField id="po-act" label={T(lang, 'Potencia actual', 'Current power')} value={v.act} onChange={set('act')} unit="kW" min={0.5} max={15} decimals={2} lang={lang} help={T(lang, 'En la factura: «potencia contratada».', 'On the bill: “potencia contratada”.')} />
          <SelectField id="po-nueva" label={T(lang, 'Potencia que valoras', 'Power you are considering')} value={String(v.nueva)} onChange={(x) => set('nueva')(Number(x))} options={opts} />
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <NumberField id="po-p2" label={T(lang, 'Potencia en valle (si es distinta)', 'Off-peak power (if different)')} value={v.p2} onChange={set('p2')} unit="kW" min={0} max={15} decimals={2} lang={lang} help={T(lang, 'Vacío: la misma en los dos periodos.', 'Empty: the same in both periods.')} />
        </div>
        <p className="text-sm text-navy-700">{T(lang, 'La potencia se paga cada día, consumas o no. Si saltan los plomos al encender a la vez horno y lavadora, la potencia se queda corta; si nunca se acerca, sobra.', 'Power is paid every day, whether you use electricity or not. If the switch trips when the oven and washing machine run together, the power is too low; if you never get close, it is too high.')}</p>
      </>}
      result={<ResultPanel lang={lang} head={ahorro >= 0 ? T(lang, 'Ahorro al año bajando de potencia', 'Yearly saving from lowering power') : T(lang, 'Coste extra al año subiendo de potencia', 'Extra yearly cost from raising power')} value={eur(Math.abs(ahorro), lang)} rows={rows} methodHref={methodHref}
        hyp={T(lang, `Término de potencia del PVPC ${P.year}: peajes de la CNMC, cargos de la Orden TED/1524/2025 y margen de comercialización de la Orden ETU/1948/2016, más impuesto eléctrico e IVA de hoy. Cambiar de potencia puede tener coste de la distribuidora (derechos de enganche o de extensión).`, `PVPC power term ${P.year}: CNMC tolls, Order TED/1524/2025 charges and Order ETU/1948/2016 retail margin, plus today’s electricity tax and VAT. Changing power may carry a distributor fee (connection rights).`)}
        copyText={`${T(lang, 'Ahorro potencia', 'Power saving')}: ${eur(ahorro, lang)}`} />}
    />
  );
}
