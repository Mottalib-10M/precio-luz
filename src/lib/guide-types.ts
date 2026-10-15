/**
 * Un guide (ou une page outil) = UN fichier de données dans `src/content/guides/` (ou `outils/`).
 * Ce fichier porte tout : les deux langues, le texte, la FAQ, les sources, le mini-simulateur,
 * les liens. Le cœur du site (routes, menus, pied de page, sitemap, hreflang, schémas, maillage)
 * le lit seul. Notice : CONTRIBUTING-GUIDES.md à la racine du dépôt.
 */
import type { SourceKey } from './engine/params';
import type { Params } from './engine/params';

export type Lang = 'es' | 'en';
export type Group = 'precio' | 'factura' | 'aparato' | 'guia';
export interface FAQ { q: string; a: string }

/** Outils fournis pour écrire le corps : liens internes, nombres au format de la langue. */
export interface Helpers {
  lang: Lang;
  /** Lien interne vers une autre page du site, par son identifiant. */
  a: (id: string, text: string) => string;
  /** Importe en euros, sin decimales por defecto (« 1259 € » / « €1,259 »). */
  eur: (n: number, decimals?: number) => string;
  /** Nombre au format de la langue. */
  num: (n: number, decimals?: number) => string;
  /** Precio en € por kWh, tres decimales por defecto (« 0,258 €/kWh »). */
  kwh: (n: number, decimals?: number) => string;
  /** Pourcentage depuis une fraction (0,776 → « 77,6 % »). */
  pct: (x: number, decimals?: number) => string;
  /** Date ISO écrite en toutes lettres dans la langue. */
  date: (iso: string) => string;
  /** Tableau de style journal. */
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  /** Lien vers une source du fichier de paramètres (texte officiel). */
  src: (key: SourceKey, text?: string) => string;
  /** Paramètres 2026 : toute valeur réglementaire se lit ici, jamais en dur. */
  P: Params;
  /** Moteur de calcul, pour les exemples chiffrés du texte (jamais un chiffre recopié à la main). */
  M: typeof import('./engine/index');
  /** Datos del día y referencias calculadas en el build (Red Eléctrica): resumen de hoy y mañana, medias. */
  R: typeof import('./referencias');
  /** Fecha ISO en toutes lettres, sin año (« 15 de octubre »). */
  dia: (iso: string) => string;
  /** Tramo horario « 14:00–15:00 ». */
  tramo: (h: number) => string;
}

export interface PageText {
  /** Segment d'URL, sans barre : « vab-tak ». Ni année, ni nombre de 3 chiffres, ni chiffre en tête. */
  slug: string;
  /** Libellé court pour les menus et le fil d'Ariane. */
  nav: string;
  /** Une phrase pour les cartes « pages associées ». */
  card: string;
  /** 50 à 60 caractères, terme-clé en tête, année comprise (RECETTE §11). Un nombre écrit ici doit
   *  aussi figurer dans le texte rendu de la page (test de cohérence avec les paramètres). */
  title: string;
  /** 150 à 160 caractères, année comprise. */
  description: string;
  h1: string;
  /** Chapeau d'une phrase, sous le H1. */
  intro: string;
  /** Bloc citable : UN paragraphe d'au moins 120 mots, avec les chiffres (RECETTE §21).
   *  Fonction de `h` pour que chaque montant vienne des paramètres (h.kr(h.P…)), jamais en dur. */
  resume: (h: Helpers) => string;
  /** 4 à 8 questions propres à la page, réponses de 40 à 90 mots (RECETTE §7). Mêmes règles. */
  faqs: (h: Helpers) => FAQ[];
  /** Corps HTML (h2, h3, p, ul, ol, table via h.table). `<!--mini:kind-->` insère un mini-simulateur de plus. */
  body: (h: Helpers) => string;
}

export interface PageDef {
  id: string;
  group: Group;
  /** Place dans les menus du groupe (petit = en haut). */
  order: number;
  /** Mini-simulateur placé après le bloc citable (un fichier `src/lib/minis/<kind>.ts`). Ignoré si `tool`. */
  mini?: string;
  /** Page vers laquelle renvoie le bouton du mini-simulateur (par défaut : l'outil du groupe). */
  miniHref?: string;
  /** Outil complet de la page (pages outils seulement). */
  tool?: 'precio' | 'aparato' | 'factura' | 'potencia' | 'bono' | 'historial' | 'cuartos';
  /** Réglages par défaut de l'outil propres à la page : zone, ville, réseau, appareil, mode. */
  toolProps?: Record<string, string | number>;
  /** Identifiants des pages liées en fin de page (3 à 6). */
  related: string[];
  /** Claves de `params-2026.json > sources` citées par la page (2 au moins). */
  sources: SourceKey[];
  es: PageText;
  en: PageText;
}

export const defineGuide = (g: PageDef): PageDef => g;
