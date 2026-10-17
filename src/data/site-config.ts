/** Configuration centrale du site (générée par new-site.py). */
export const SITE_URL = "https://precioluzreal.es";
export const SITE_NAMES: Record<string, string> = {"es": "Precio Luz Real", "en": "Precio Luz Real"};
export const LANG_TAGS: Record<string, string> = {"es": "es-ES", "en": "en-ES"};
export const OG_LOCALES: Record<string, string> = {"es": "es_ES", "en": "en_GB"};
export const LOCALE_TAG = 'es-ES';
/** Formato de los números por idioma de la página (RECETTE §4 : una locale por idioma). */
export const LOCALE_BY_LANG: Record<string, string> = { es: 'es-ES', en: 'en-GB' };
export const CURRENCY = 'EUR';
export const YEAR = 2026;
/** Année de création du site — signal d'ancienneté (RECETTE §8.0). */
export const SITE_FOUNDED = '2026';
export const LAST_UPDATED = '2026-10-15';
export const AUTHOR_NAME = 'Radif Partners';
export const AUTHOR_ROLE: Record<string, string> = {"es": "Editor de calculadoras y guías prácticas · Energía doméstica en España", "en": "Publisher of calculators and practical guides · Household energy in Spain"};
export const AUTHOR_DESC: Record<string, string> = {"es": "Radif Partners publica calculadoras y guías sobre el precio de la electricidad en España, con datos oficiales de Red Eléctrica, la CNMC y el BOE citados en cada página.", "en": "Radif Partners publishes calculators and guides on electricity prices in Spain, with official data from Red Eléctrica, the CNMC and the BOE cited on every page."};
/** Sujets sur lesquels l'editeur est competent (schema.org knowsAbout). Ce sont les
 *  themes reellement traites par le site, pas une liste de mots-cles : un sujet
 *  declare ici sans page qui le couvre est une declaration fausse. */
export const KNOWS_ABOUT: Record<string, string[]> = {"es": ["PVPC", "Precio de la electricidad", "Peajes y cargos", "Bono social eléctrico", "Potencia contratada"], "en": ["PVPC regulated tariff", "Electricity prices in Spain", "Network tolls and charges", "Social electricity discount", "Contracted power"]};
export const CONTACT_EMAIL = "contacto@precioluzreal.es";
export const THEME_COLOR = '#AA151B';
export const LOGO_SYMBOL = 'eclair';
export const BING_VERIFY_CODE = '';
export const GOOGLE_VERIFY_CODE = '';
/** Régime : 'none' pour tous les sites (RECETTE §15.6, décision de l'éditeur du 2026-10-06) :
 *  aucun bandeau, aucun cookie, Clarity chargé en mode sans cookie (consentv2 denied).
 *  'opt-in' / 'notice' ne servent plus qu'aux sites anciens qui les portent encore. */
export const CONSENT_MODE: 'opt-in' | 'notice' | 'none' = 'none';
export const GA4_ID = '';
/** Projet Microsoft Clarity (compte amradif), chargé sans cookie. Vide = aucune mesure. */
export const CLARITY_ID = '';
export const INDEXNOW_KEY = 'c4e81a7b2d9f4e6a8b1c3d5e7f9a0b2c';

/* ------------------------------------------------------------------------- *
 * IDENTITÉ LÉGALE — À COMPLÉTER AVANT LA MISE EN LIGNE
 * Ces champs alimentent la mention légale du pays, la politique de confidentialité,
 * la page contact et le schema Organization. Un champ vide s'affiche en jaune
 * sur le site. Contrôle : `npm run check:legal`.
 * ------------------------------------------------------------------------- */
export interface LegalHosting { name: string; address: string; phone: string; url: string }
export interface LegalIdentity {
  entityName: string; legalForm: string; street: string; postalCode: string; city: string;
  country: string; phone: string; registerLabel: string; registerNumber: string;
  vatLabel: string; vatNumber: string; jurisdiction: string;
  supervisoryAuthority: string; supervisoryAuthorityUrl: string; hosting: LegalHosting;
}
export const LEGAL: LegalIdentity = {
  entityName: 'Radif Partners',  // editor de todos los sitios del portafolio (RECETTE §8)
  legalForm: '',             // ex. entreprise individuelle, SASU, GmbH, eenmanszaak
  street: '49 rue du Ressort',
  postalCode: '63000',
  city: 'Clermont-Ferrand',
  country: "France",
  phone: '',                 // ligne de contact publiée
  registerLabel: "SIREN",
  registerNumber: '',
  vatLabel: "TVA",
  vatNumber: '',             // laisser vide si non assujetti
  jurisdiction: "France",
  supervisoryAuthority: "Commission nationale de l'informatique et des libertés (CNIL)",
  supervisoryAuthorityUrl: "https://www.cnil.fr",
  hosting: { name: 'GitHub, Inc. (GitHub Pages)', address: '88 Colin P Kelly Jr Street, San Francisco, CA 94107, United States', phone: '', url: 'https://pages.github.com' },
};

/** Champs sans lesquels le site ne doit pas être mis en ligne. */
export const LEGAL_REQUIRED: Array<keyof LegalIdentity> = ['entityName', 'street', 'postalCode', 'city'];

/** Profils publics de l'auteur (schema.org sameAs). Laisser vide si aucun. */
export const AUTHOR_SAME_AS: string[] = [];

/** Rythme de revue éditoriale annoncé sur le site, en mois. */
export const REVIEW_CYCLE_MONTHS = 12;
