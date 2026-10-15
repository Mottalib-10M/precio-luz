import type { Locale } from './routes';
const es = {
  updatedOn: 'Actualizado el', editorialPolicy: 'Política editorial', contactLabel: 'Contacto', reviewedBy: 'Revisado por',
  skipToContent: 'Ir al contenido', mainNav: 'Menú principal', breadcrumbLabel: 'Ruta de navegación', breadcrumbHome: 'Inicio', menuOpen: 'Abrir el menú',
  faqTitle: 'Preguntas frecuentes', relatedCalculators: 'Páginas y calculadoras relacionadas', sourcesTitle: 'Fuentes', writtenBy: 'Escrito por',
  asOf: 'Peajes, cargos e impuestos', lastUpdated: 'revisados el', footerValidated: 'Fuentes: Red Eléctrica (e·sios, PVPC hora a hora), BOE (peajes CNMC, cargos, impuestos), INE', footerBrowser: 'Se calcula en tu navegador · no se envía ningún dato · gratis · sin teléfonos ni formularios',
  footerDisclaimer: 'Sitio independiente publicado por Radif Partners, sin relación con Red Eléctrica, la CNMC, el Ministerio ni ninguna comercializadora. Los precios PVPC proceden de Red Eléctrica y se citan con su fecha; los importes con impuestos y las facturas son estimaciones calculadas con los peajes, cargos e impuestos publicados en el BOE. Son una estimación orientativa que no sustituye a tu factura ni a un asesoramiento profesional. No vendemos contratos ni pedimos datos de contacto.', footerPopular: '', notFound: 'Esta página no existe.',
  readMore: 'Leer más',
};
const en: typeof es = {
  updatedOn: 'Updated', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Checked by',
  skipToContent: 'Skip to content', mainNav: 'Main menu', breadcrumbLabel: 'Breadcrumb', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'Frequently asked questions', relatedCalculators: 'Related pages and calculators', sourcesTitle: 'Sources', writtenBy: 'Written by',
  asOf: 'Tolls, charges and taxes', lastUpdated: 'checked on', footerValidated: 'Sources: Red Eléctrica (e·sios, hourly PVPC), BOE (CNMC tolls, charges, taxes), INE', footerBrowser: 'Calculated in your browser · no data sent · free · no phone numbers or forms',
  footerDisclaimer: 'Independent website published by Radif Partners, with no link to Red Eléctrica, the CNMC, the Ministry or any electricity retailer. PVPC prices come from Red Eléctrica and are quoted with their date; tax-inclusive amounts and bills are estimates built from the tolls, charges and taxes published in the BOE. They are an indicative estimate that does not replace your bill or professional advice. We sell no contracts and ask for no contact details.', footerPopular: '', notFound: 'This page does not exist.',
  readMore: 'Read more',
};
export function t(lang: Locale) { return lang === 'en' ? en : es; }
