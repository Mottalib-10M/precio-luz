# Étude : prix de l'électricité PVPC du jour (Espagne), 15 octobre 2026

Idée ES-LUZ de `reports/etude-niches-2026-10-15-B.md`. Volume mesuré au Keyword Planner (compte Objet Tech,
relevé du 2026-10-15) : environ 1,8 M recherches par mois. Les cinq requêtes de tête (« precio luz hoy »,
« precio de la luz », « precio de la luz hoy », « precio luz mañana », « tarifa luz hora ») sont chacune entre
100 k et 1 M. Enchère haute de 0,6 à 3,6 €.

## SERP relevé le 2026-10-15

Relevé fait avec WebSearch, qui est géolocalisé aux États-Unis : l'ordre exact de google.es reste à vérifier.
Chaque défaut ci-dessous a été lu sur la page elle-même (WebFetch), sauf articulo14.es et autosolar.es, qui
refusent la lecture (HTTP 403). Détail complet : fiches a–f par concurrent, citations à l'appui.

| Concurrent | Ce qu'il fait | Défaut constaté sur pièce | Ce qu'on fait mieux |
|---|---|---|---|
| selectra.es (courtier) | 24 prix horaires, page du jour + page demain | « PVPC sin impuestos », « No incluyen el IVA ni el impuesto eléctrico » ; « Te llamamos 91 076 66 35 » et trois autres numéros ; estimation figée « 4 kW, 270 kWh » ; offres partenaires sans mention publicité | Prix TTC (IVA + impôt électrique) à côté du HT, aucun téléphone, calcul sur sa propre facture et par appareil |
| tarifaluzhora.es (courtier) | 24 prix, page par jour | « Llama gratis · 91 198 33 63 », formulaire « estudio de factura » ; toutes les heures étiquetées « Ahora » ; HT/TTC non précisé ; demain sur une autre page | Aujourd'hui et demain sur la même page, heure en cours réellement marquée, TTC explicite |
| kelisto.es (courtier) | Article « por qué sube el precio de la luz » recyclé en page du jour | PVPC hors taxes comparé à des offres libres TTC sur la même page ; « LLÁMANOS 911 31 20 20 » ; pas de prix de demain | PVPC et marché libre comparés sur la même base, avec les mêmes impôts |
| endesa.com (fournisseur) | Article du jour, 24 créneaux « sin IVA » | Moyenne fausse dans l'intro (0,23861 €/kWh contre 0,20821) ; gabarits bruts « {{content.form.title}} » ; pas de demain ; site d'un fournisseur | Chiffres calculés par le moteur depuis le fichier officiel, site indépendant |
| papernest.es (courtier) | Page « mañana » | Tableau de demain vide, page éditée 8 jours avant le relevé ; « Tel: 919 014 228 » ; HT seulement | Demain rempli automatiquement après la publication de Red Eléctrica |
| rastreator.com (courtier) | Page « mañana » | « Sin datos disponibles », FAQ de mars, formulaire « Solicitar llamada » | Prix de demain dès sa publication, et avant 20h15 le marché au quart d'heure du lendemain |
| loentiendo.com | Tableau 24 h | Titre daté du 15/10/2026 sur des chiffres du 13 novembre 2025 | Date affichée = date des données, toujours |
| xatakahome.com, energias-renovables.com | Articles de 2021 et 2023 encore classés | Pages mortes, prix en €/MWh | URL stable mise à jour chaque jour, en €/kWh |
| articulo14.es, democrata.es, elindependiente.com (médias) | Un article par jour | Pas de demain (democrata), pas de simulateur, HT/TTC non dit | Page outil durable avec graphique, simulateurs et historique |
| tarifaluzhoy.es (le plus proche) | 24 prix, simulateur de facture, pas de téléphone | Prix non TTC explicites, horodatage resté sur « Actualizando… », pas de comparaison chiffrée avec le libre, pas de coût par appareil, pas d'anglais | Prix TTC, horodatage réel, PVPC contre libre chiffré, coût par appareil et meilleure heure, version anglaise |

Phrase de valeur ajoutée (RECETTE §6.6) : ce site fait mieux que le premier résultat parce qu'il affiche le prix
que l'on paie vraiment, taxes comprises, pour aujourd'hui et demain, calculé à partir du fichier officiel de
Red Eléctrica, avec le coût de chaque appareil selon l'heure et la comparaison PVPC contre prix fixe sur sa
propre facture, sans jamais demander un téléphone.

SERP imprenable ? Non : aucun site public (REE, CNMC) ne domine seul ; la tête est partagée entre courtiers
vivant du lead et médias à article quotidien. Concurrence forte (domaines anciens), à compenser par l'outil.

## Vérité sur le quart d'heure

Le marché journalier est au quart d'heure depuis le 1er octobre 2025, mais le PVPC facturé reste horaire :
le fichier officiel e·sios (archive 70) a 24 lignes par jour, la page PVPC de Red Eléctrica parle de « precios
horarios », et la CNMC écrit que « los contadores de los pequeños consumidores seguirán siendo horarios ». Le site
affiche donc 24 prix PVPC officiels (ce que paie le consommateur) et, à part, les 96 prix du marché au quart
d'heure (contexte, consommateurs à prix indexé). Il ne fabrique pas 96 prix PVPC.

## Données et licence

- PVPC : archive publique 70 d'e·sios, sans jeton. Marché au quart d'heure : API REData (apidatos.ree.es), sans
  jeton. IPC électricité : INE (API Tempus). Péages, charges, impôts, bono social : BOE (textes cités dans
  `src/data/params-2026.json`).
- Avis légal de Red Eléctrica (§5.1) : réutilisation permise en citant Red Eléctrica comme source, sans altérer
  les données, avec la date de mise à jour, sans logo, « con fines informativos y no con finalidad comercial ».
  Le site est monétisé (AdSense) : point à trancher par l'éditeur (les courtiers concurrents republient les
  mêmes prix). Le site cite la source et la date sur chaque page et n'utilise aucun logo.

## Passe qualité du 2026-10-16 (BRIEF-QUALITE-2026-10-16)

- **Ceuta et Melilla ajoutées** (avant : « no se calculan »). Prix : colonnes CYM et TEUCYM de l'archive e·sios 70
  (même fichier, 401 jours rechargés), qui suivent le calendrier propre aux deux villes (Circular 3/2020, art. 7.3 :
  punta 11-15 h et 19-23 h, llano 8-11, 15-19, 23-24 h). Impôts : pas d'IVA (Ley 37/1992, art. 3) ; IPSI 1 % sur le
  total facturé, lu dans le texte refondu de l'ordonnance de Ceuta (BOCCE extraordinaire du 30/01/2019, copie
  hacienda.gob.es, art. 26, 32.Dos, 33.Cuatro) et dans l'ordonnance de Melilla (Decreto 584 du 30/04/2021, BOME 5857,
  anexo 1, segundo ; base art. 11.2) ; impuesto eléctrico et ses rebajas identiques (Ley 38/1992, art. 91). Tests :
  TEUCYM recoupé heure par heure avec le calendrier CyM et les valeurs BOE sur toute l'année 2026.
- **bonosocial.gob.es** : le serveur n'envoie pas le certificat intermédiaire (FNMT « AC SERVIDORES SEGUROS TIPO2
  G2R ») et la racine « AC RAIZ FNMT-RCM SERVIDORES SEGUROS G2R » (déc. 2025) n'est pas dans le magasin macOS. Avec la
  chaîne téléchargée sur cert.fnmt.es, `openssl verify` = OK ; le site redirige (301) vers
  miteco.gob.es/es/energia/pobreza-energetica/pe-001.html. Source remplacée par la page MITECO « cómo solicitarlo »
  (liste des comercializadoras de referencia, dont Teramelcor à Melilla et Energía Ceuta XXI).
- **Financement du bono social** : 9,011295 €/CUPS·an depuis le 26/06/2026 (Orden TED/634/2026), 6,979247 avant ;
  le moteur prend la valeur du jour.
- **Règle de décembre** (RDL 25/2026, art. 19 et 21) : testée (IPC d'octobre à 15,0 → pas de rebaja, 15,1 → IVA 10 %
  et impuesto eléctrico 0,5 % ; ≤ 10 kW inclus ; > 10 kW sans IVA rebajado ; septembre ne joue pas ; tant que l'INE
  n'a pas publié, tipos generales marqués « pendiente »). Vulnérable sévère : IVA rebajado quelle que soit la potence.
- Règles des guides relues à la source (RD 216/2014 art. 5.3, 8.4, 9 ; RD 897/2017 art. 8-10 ; RD 1164/2001 art. 9.4 ;
  RD 244/2019 art. 14 ; Resolución DGT 17/10/2025) : 11 phrases corrigées, 6 sources ajoutées.
