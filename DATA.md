# Data

Spot the Implant scores a checklist against 26 catalog entries. Schematics are drawn from those entries. They are not radiographs, and they are not manufacturer photography.

Nothing in this file was taken from a paywalled instructions-for-use PDF. If a feature is a teaching inference rather than a sentence in the linked document, the library marks that source `interpretation`.

Accessed 5 October 2026. MegaGen ST and the Vetronix alias were added 6 October 2026.

## Company versus line

The rank is the company a dentist would write on a lab slip. `identityOf` in `lib/systems.ts` is that name. The table below still lists catalog lines.

| Company call | Lines | Manufacturer, when it is not the same words |
| --- | --- | --- |
| Astra Tech | OsseoSpeed TX, OsseoSpeed EV | Dentsply Sirona. TX versus EV is not called. |
| Ankylos | C/X | Dentsply Sirona. Not rolled into Astra Tech. |
| Zimmer Biomet | Tapered Screw-Vent | ZimVie, the current company. |
| Biomet 3i | Certain | ZimVie. |
| Neodent | Helix GM | Straumann Group. Not reported as Straumann. |
| Osstem and Hiossen | TS III and ET III | Kept as two names. A tie refuses the company. |

## Feature schema

Each system accepts one or more values per feature. The first value is the canonical one used by the unit test.

| Feature | Values you can mark | What it means on a film |
| --- | --- | --- |
| `collar` | `bone-level`, `machined-band`, `microthread`, `tulip`, `hyperbolic` | Neck: none, short smooth band, fine neck threads, flare above bone, or a neck that narrows toward the crown |
| `connection` | `external-hex`, `internal-unspecified`, `internal-hex`, `internal-conical`, `internal-octagon`, `tube-in-tube`, `subcrestal-conical` | Only mark a specific seat when you can defend it. “Internal, type unclear” is a weak match, not a contradiction |
| `body` | `parallel`, `mild-taper`, `strong-taper` | Outer form. Angulation can fake a taper |
| `thread` | `fine`, `standard`, `buttress`, `coarse`, `knife`, `progressive` | Pitch and flank. Knife means thin deep blades. Progressive means depth grows toward the apex |
| `apex` | `flat`, `rounded`, `pointed`, `cutting` | Tip shape. Cutting flutes are not inferred from the image measurement |
| `platformSwitch` | `yes`, `no` | Prosthetic seat visibly narrower than the shoulder |
| `lead` | `single`, `double`, `triple`, `variable` | Thread starts, or a pitch that changes along the body |

`unknown` is stored when you leave a row on **Not sure**. Unknowns add no points and no penalty.

`microgap` is `supracrestal`, `crestal`, or `subcrestal`: where the implant–abutment line sits relative to the crest, and only when that line is visible. `geometry` is not a catalog field. It is `orthogonal`, `angled`, or `unknown`, and an angled film caps the company call.

## Academic sources for the periapical rules

These are the papers the score and the “per the literature” notes cite. Abstracts and the open review were used. Paywalled full texts were not copied.

| Cite | What this bench took from it | Link |
| --- | --- | --- |
| Sahiwal IG, Woody RD, Benson BW, Guillen GE. Radiographic identification of threaded endosseous dental implants. J Prosthet Dent. 2002;87(5):563–577. | Coronal, midbody, and apical features. Readable within about ±10° vertical angulation; unrecognizable near 20°. | https://doi.org/10.1067/mpr.2002.124430 |
| Sahiwal IG, Woody RD, Benson BW, Guillen GE. Macro design morphology of endosseous dental implants. J Prosthet Dent. 2002;87(5):543–551. | Same thirds: flange and interface, thread form and taper, apex. | https://doi.org/10.1067/mpr.2002.124432 |
| Sewerin I. Estimation of angulation of Brånemark titanium fixtures from radiographic thread images. Clin Oral Implants Res. 1991;2(1):20–23. | Thread images move with the beam. No millimeter measurement from one periapical. | https://doi.org/10.1034/j.1600-0501.1991.020102.x |
| Michelinakis G, Sharrock A, Barclay CW. Identification of dental implants through the use of Implant Recognition Software (IRS). Int Dent J. 2006;56(4):203–208. | A question-led differential. Surface, diameter, and length are excluded here because a periapical does not show them. | https://research.manchester.ac.uk/en/publications/identification-of-dental-implants-through-the-use-of-implant-reco/ |
| Saghiri MA, Freag P, Fakhrzadeh A, Saghiri AM, Eid J. Current technology for identifying dental implants: a narrative review. Bull Natl Res Cent. 2021;45:7. | Open review of IRS, the Sahiwal tables, whatimplantisthat, and OSSEOsource. A 2D film does not carry the 3D seat. | https://doi.org/10.1186/s42269-020-00471-0 |

Manufacturer brochures below still supply the catalog shape of each line. The papers supply the reading method. A brochure is not a sensitivity study.

## Systems

| id | Brand | System | Neck | Seat | Body | Thread | The cue that actually separates it |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `straumann-tl` | Straumann | Tissue Level | tulip | synOcta octagon (some necks are CrossFit) | parallel or mild | standard | Flared machined collar. Standard neck 2.8 mm, Standard Plus 1.8 mm |
| `straumann-bl` | Straumann | Bone Level / BLT | bone level | CrossFit cone | parallel (BL) or mild (BLT) | standard | Often ties NobelParallel CC |
| `straumann-blx` | Straumann | BLX | bone level | TorcFit cone | strong taper | coarse, variable pitch | Variable pitch versus a double lead |
| `nobel-branemark` | Nobel Biocare | Brånemark | machined band | external hex | parallel or mild | fine or standard | Fine parallel hex, not a coarse Southern thread |
| `nobel-active` | Nobel Biocare | NobelActive | bone level | internal cone | strong taper | coarse, double lead | Pointed apex on a double-lead taper |
| `nobel-parallel` | Nobel Biocare | NobelParallel CC | bone level | internal cone, described as 12° in an open paper | parallel | standard | Ties Straumann Bone Level |
| `astra-tx` | Dentsply Sirona | OsseoSpeed TX | MicroThread | Conical Seal Design | mild or parallel | standard | Twin of EV |
| `astra-ev` | Dentsply Sirona | OsseoSpeed EV | MicroThread | Conical Seal Design | mild or strong | standard | Twin of TX. Taper is only a soft split |
| `ankylos` | Dentsply Sirona | Ankylos C/X | bone level | TissueCare subcrestal cone | mild | progressive | Thread depth increases apically; seat sinks into the body |
| `zimmer-tsv` | ZimVie | Tapered Screw-Vent | machined, textured, or microgroove | friction-fit internal hex, 1.5 mm deep | mild taper | triple lead | Triple lead. Collar version varies (K133339) |
| `biohorizons-ti` | BioHorizons | Tapered Internal | bone level or Laser-Lok band | 1.5 mm internal hex / 45° lead-in | mild or strong | buttress | Buttress flank. Laser-Lok is not visible proof |
| `osstem-tsiii` | Osstem | TS III | bone level | internal cone | mild taper | standard, double lead | Twin of Hiossen ET III |
| `hiossen-etiii` | Hiossen | ET III | bone level | internal cone | mild taper | standard, double lead | Twin of Osstem TS III. Do not split them on one film |
| `megagen-anyridge` | MegaGen | AnyRidge | bone level | internal cone | tapered core | KnifeThread | Thin, deep blades. Same company as ST until a lead is visible |
| `megagen-st` | MegaGen | ST (chair-side alias Vetronix) | bone level | 11° internal hex | mild or strong taper | KnifeThread added to a double thread | Company is MegaGen when the blades are knife-deep. The line settles on ST only when a double lead is marked. Vetronix is an interpretation |
| `mis-seven` | MIS | SEVEN | bone level | internal hex | mild taper | standard, double lead | Hex, not the C1 cone |
| `mis-c1` | MIS | C1 | bone level | internal cone | mild taper | standard, double lead | Generic cone unless the record already says MIS |
| `dentium-implantium` | Dentium | Implantium | microthread | internal hex | mild taper | standard, double lead | Microthread on a hex, not Astra’s cone |
| `dentium-superline` | Dentium | SuperLine II | bone level | one conical connection plus hex index | strong taper | double, deeper thread | Twin of Helix GM on a periapical |
| `neodent-helix` | Neodent | Helix GM | bone level | Grand Morse 16° plus Grand Morse Exact hex | strong taper | coarse, double lead | Same short list as SuperLine. Drive and Titamax share the connection |
| `camlog-progressive` | Camlog | Progressive-Line | bone level or short machined | Tube-in-Tube | mild or strong | standard or coarse | Only rises when tube-in-tube is marked on purpose |
| `anthogyr-axiom` | Anthogyr | Axiom BL | bone level | internal cone | mild taper | standard | Twin of the Semados bucket |
| `southern-external` | Southern Implants | External hex, coarse thread | bone level | external hex | mild or strong | coarse | Coarse hex versus Brånemark. Not Deep Conical |
| `bego-semados` | BEGO | Semados RSX | bone level | internal cone | mild taper | standard | Partial catalog bucket. Ties Axiom |
| `prama` | Sweden & Martina | Prama | hyperbolic neck, 0.80 mm cylinder + 2.00 mm hyperbola, UTM | Collex internal hex, 3.40 mm seat | parallel or mild | standard or buttress | Neck narrows toward the crown |
| `biomet-3i-certain` | Biomet 3i | Certain | machined or bone level | internal hex | parallel or mild | standard, single lead | Not the older 3i external hex, and not TSV’s triple lead |

Body, lead, and apex values for Osstem, Hiossen, MIS C1, Implantium, Southern, BEGO, Anthogyr, and the Helix *body* (as opposed to the Grand Morse connection) are checklist interpretations for short-listing. The connection geometry that is quoted from a manual is listed in Sources.

## Sources

### Brochures and manuals

- Straumann Tissue Level product information. https://www.straumann.com/content/dam/media-center/straumann/en/documents/brochure/product-information/490.269-en_low.pdf
- Straumann Bone Level prosthetic procedures (CrossFit). https://www.straumann.com/content/dam/media-center/straumann/en/documents/brochure/technical-information/702061-en_low.pdf
- Straumann BLX implant system (TorcFit, fully tapered). The same brochure lists thread pitch from 1.7 mm to 3.1 mm by diameter. https://www.straumann.com/content/dam/media-center/straumann/en/documents/brochure/technical-information/702115-en_low.pdf
- Astra Tech Implant System product catalog (MicroThread, Conical Seal Design, internal double hex). https://assets.dentsplysirona.com/flagship/en/explore/implantology/implant-systems/astra-tech-implant-system/documents/IMP-Product-catalog-Astra-Tech-Implant-System-32671191-USX-1904.pdf
- Astra Tech Implant System EV, evolution through science (keeps MicroThread and Conical Seal Design). https://www.dentsplysirona.com/content/dam/master/education/documents/upload/3/32670142-USX-1610%20Evolution%20through%20science%20_%20Astra%20Tech%20Implant%20System%20EV_LR.pdf
- Ankylos surgical manual (progressive thread, TissueCare connection). https://www.dentsplysirona.com/content/dam/master/product-procedure-brand-categories/implant-dentistry/collateral-marketing-product/ankylos/document/brochure/32671086-ankylos-surgical-manual/IMP-Brochure-Ankylos-Surgical-Manual_32671086-USX-2206_LR.pdf
- Neodent Grand Morse prosthetics manual (16° internal taper, Grand Morse Exact hex, shared by Helix, Drive, Titamax). https://www.straumann.com/content/dam/media-center/neodent/en/documents/manual/10129_neodent_gm_manual_en_eU_lr-prosthetics.pdf
- ZimVie Tapered Screw-Vent (friction-fit internal hex, 1.5 mm deep, lead-in bevel). https://www.zimvie.com/en/dental/dental-implant-systems/tapered-screw-vent-implant.html
- FDA K133339 (TSV external triple-lead thread; machined collar or texturing to the top). https://www.accessdata.fda.gov/cdrh_docs/pdf13/K133339.pdf
- BioHorizons Tapered Internal (buttress thread, Laser-Lok, 1.5 mm internal hex, 45° lead-in). https://www.biohorizons.com/Products/Tapered
- MegaGen AnyRidge KnifeThread. https://imegagen.com/product/1292/
- MegaGen ST: 11° internal hex, KnifeThread integrated into a double thread. https://imegagen.com/product/22045/ and the ST brochure https://www.imegagen.es/wp-content/uploads/2024/10/ST_ENG_REV.03-V2-1.pdf
- Camlog Tube-in-Tube and Progressive-Line. https://www.camlog.com/en/products/implant-systems/camlog
- MIS SEVEN catalog (internal hex). https://www.mis-implants.com/upload/PDF/Products/Implants/MIS_SEVEN_Catalog.pdf
- Dentium SuperLine II (double thread, one conical connection, hex index). https://www.dentiumusa.com/products/implant-systems/superline-2
- Sweden & Martina Prama morphology. https://prama.sweden-martina.com/en/morphology
- Prama brochure (hyperbolic neck dimensions, UTM, Collex internal hex, 3.40 mm connection). https://www.sweden-martina.com/articms/admin/reserved_area_file/177/d-imp-beprama-e_rev.12-17_v.01_LR.pdf

### Open paper

- Pozzi, Tallarico, et al. Materials 2022. Describes NobelParallel as a 12° conical connection and restates the Prama neck as a 2.00 mm hyperbolic portion plus a 0.80 mm cylinder. https://www.mdpi.com/1996-1944/15/2/511

### Manufacturer homes used where a stable brochure URL was not the citation

- Nobel Biocare Brånemark and NobelActive product pages. https://www.nobelbiocare.com/en-int/branemark and https://www.nobelbiocare.com/en-int/nobelactive
- Osstem. https://en.osstem.com/
- Hiossen. https://hiossen.com/
- MIS. https://www.mis-implants.com/
- Anthogyr. https://www.anthogyr.com/
- Southern Implants. https://www.southernimplants.com/
- BEGO implantology. https://www.bego.com/implantology-solutions/
- ZimVie dental implant systems (Certain / 3i family). https://www.zimvie.com/en/dental/dental-implant-systems.html

### Secondary design summary

- Implant Atlas, NobelActive versus Straumann BLX (double lead, expanding taper, and reverse-cutting apex on NobelActive; variable pitch on BLX). Used as a design summary of public brochures, not as a clinical atlas. https://nobel-implants.com/compare/nobelactive-vs-straumann-blx/

## Labeled miss, 6 Oct 2026

Ahmed labeled a periapical, photographed off a Sopix screen in Cairo, as Vetronix or ST MegaGen. The build then in production marked only “mild taper,” ignored the thread measurement, and returned Ankylos at 21% with four later cards at 34%. MegaGen was not on the short list.

That ranking is treated as a logic failure, not as a new ground truth for Ankylos. Mild taper is generic. Deep knife threads are the MegaGen family sign. The line between ST and AnyRidge stays open unless a double lead is confirmed. Vetronix is stored as an alias of `megagen-st` with source kind `interpretation`: it is the name used in that chair. A public MegaGen page equating the two trade names was not found, and a similarly spelled Italian brand was not used as evidence.

The radiograph itself is not in this repository.

## What was deliberately left out

- No radiograph atlas plates. Sahiwal and later identification series exist in the Journal of Prosthetic Dentistry; their figures are not copied here.
- No claim that Hiossen ET III and Osstem TS III are the same SKU. They are a radiographic pair in this checklist.
- No Southern Deep Conical entry. The external-hex coarse-thread line is the one that separates from Brånemark on a film.
- No 3i external-hex entry. Certain is the internal-hex 3i line.
- Laser-Lok, SLA, TiUnite, OsseoSpeed, and Xpeed are surfaces. They are named in the text and not treated as something you can see on a periapical.
