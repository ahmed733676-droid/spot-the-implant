import type { ImplantSystem } from "@/lib/types";

const straumannTlPdf =
  "https://www.straumann.com/content/dam/media-center/straumann/en/documents/brochure/product-information/490.269-en_low.pdf";
const straumannBlPdf =
  "https://www.straumann.com/content/dam/media-center/straumann/en/documents/brochure/technical-information/702061-en_low.pdf";
const straumannBlxPdf =
  "https://www.straumann.com/content/dam/media-center/straumann/en/documents/brochure/technical-information/702115-en_low.pdf";
const astraCatalog =
  "https://assets.dentsplysirona.com/flagship/en/explore/implantology/implant-systems/astra-tech-implant-system/documents/IMP-Product-catalog-Astra-Tech-Implant-System-32671191-USX-1904.pdf";
const astraEvPdf =
  "https://www.dentsplysirona.com/content/dam/master/education/documents/upload/3/32670142-USX-1610%20Evolution%20through%20science%20_%20Astra%20Tech%20Implant%20System%20EV_LR.pdf";
const ankylosPdf =
  "https://www.dentsplysirona.com/content/dam/master/product-procedure-brand-categories/implant-dentistry/collateral-marketing-product/ankylos/document/brochure/32671086-ankylos-surgical-manual/IMP-Brochure-Ankylos-Surgical-Manual_32671086-USX-2206_LR.pdf";
const neodentGm =
  "https://www.straumann.com/content/dam/media-center/neodent/en/documents/manual/10129_neodent_gm_manual_en_eU_lr-prosthetics.pdf";
const nobelParallelPaper = "https://www.mdpi.com/1996-1944/15/2/511";

export const SYSTEMS: ImplantSystem[] = [
  {
    id: "straumann-tl",
    brand: "Straumann",
    system: "Tissue Level",
    aliases: ["Standard", "Standard Plus", "synOcta", "TL", "ITI"],
    summary:
      "Tissue-level fixture with an integrated tulip-shaped machined collar. Standard necks are 2.8 mm; Standard Plus necks are 1.8 mm. The usual prosthetic seat is synOcta.",
    lookFor: [
      "Flared machined collar sitting above the bone, wider toward the crown.",
      "Threads begin at the base of that collar, not at the top of the fixture.",
      "A 45° machined shoulder is described in the tissue-level brochure.",
    ],
    pitfalls: [
      "Do not call a wide healing abutment a tulip. The flare has to be part of the fixture.",
      "Narrow Neck CrossFit tissue-level implants use a different internal seat and are not separated here.",
    ],
    accepts: {
      collar: ["tulip"],
      connection: ["internal-octagon", "internal-conical"],
      body: ["parallel", "mild-taper"],
      thread: ["standard"],
      apex: ["rounded"],
      platformSwitch: ["no"],
      lead: ["single"],
      microgap: ["supracrestal"],
    },
    signatures: [
      {
        all: [{ feature: "collar", value: "tulip" }],
        boost: 2.4,
        note: "A true tulip flare is the tissue-level Straumann sign in this library.",
      },
    ],
    twins: [],
    confusers: [
      {
        id: "prama",
        note: "Prama narrows toward the crown. Tissue Level flares toward the crown. Direction of the neck decides it.",
      },
    ],
    schematic: {
      collar: "tulip",
      body: "parallel",
      thread: "standard",
      apex: "round",
      connection: "octagon",
      platformSwitch: false,
    },
    sources: [
      { title: "Straumann Tissue Level product information", url: straumannTlPdf, kind: "brochure" },
    ],
  },
  {
    id: "straumann-bl",
    brand: "Straumann",
    system: "Bone Level / BLT",
    aliases: ["BL", "BLT", "CrossFit", "Bone Level Tapered"],
    summary:
      "Bone-level Roxolid fixture with the CrossFit internal conical connection. BLT adds an apical taper; the parallel Bone Level body is the same prosthetic family.",
    lookFor: [
      "No transmucosal collar. The platform is at bone level.",
      "CrossFit is a deep internal cone with a flat-to-flat index, not an external hex.",
      "Body is parallel on BL and more tapered on BLT, so body shape alone does not name the line.",
    ],
    pitfalls: [
      "A periapical rarely separates Bone Level from NobelParallel CC when both look like a parallel internal cone.",
    ],
    accepts: {
      collar: ["bone-level"],
      connection: ["internal-conical"],
      body: ["parallel", "mild-taper"],
      thread: ["standard"],
      apex: ["rounded"],
      platformSwitch: ["yes"],
      lead: ["single"],
      microgap: ["crestal"],
    },
    signatures: [],
    twins: ["nobel-parallel"],
    confusers: [
      {
        id: "nobel-parallel",
        note: "NobelParallel CC is also a bone-level internal cone with a parallel body. CrossFit versus the 12° Nobel cone is not a reliable periapical call.",
      },
    ],
    schematic: {
      collar: "none",
      body: "parallel",
      thread: "standard",
      apex: "round",
      connection: "cone",
      platformSwitch: true,
    },
    sources: [
      { title: "Straumann Bone Level prosthetic procedures", url: straumannBlPdf, kind: "brochure" },
    ],
  },
  {
    id: "straumann-blx",
    brand: "Straumann",
    system: "BLX",
    aliases: ["TorcFit", "Roxolid BLX"],
    summary:
      "Fully tapered bone-level implant, Roxolid, SLA or SLActive, with one TorcFit internal connection across diameters. Published pitch runs about 1.7–3.1 mm.",
    lookFor: [
      "Strong full-body taper rather than a parallel midsection.",
      "Variable, relatively wide thread pitch and a self-cutting apex.",
      "TorcFit is an internal cone, not an external hex and not the older CrossFit of Bone Level.",
    ],
    pitfalls: [
      "NobelActive and Neodent Helix GM share the aggressive tapered look. Pitch change versus a double lead is the split, and it is easy to miss.",
    ],
    accepts: {
      collar: ["bone-level"],
      connection: ["internal-conical"],
      body: ["strong-taper"],
      thread: ["coarse", "progressive"],
      apex: ["cutting"],
      platformSwitch: ["yes"],
      lead: ["variable"],
      microgap: ["crestal"],
    },
    signatures: [
      {
        all: [{ feature: "lead", value: "variable" }],
        boost: 1.35,
        note: "A pitch that changes along the body is the BLX clue against double-lead tapers.",
      },
    ],
    twins: [],
    confusers: [
      {
        id: "nobel-active",
        note: "NobelActive is strongly tapered with a double lead and a pointed apex. BLX pitch varies and the apex is cutting rather than simply pointed.",
      },
      {
        id: "neodent-helix",
        note: "Helix GM is a deep 16° cone with a double lead. BLX uses TorcFit and a variable pitch.",
      },
    ],
    schematic: {
      collar: "none",
      body: "strong",
      thread: "coarse",
      apex: "vent",
      connection: "cone",
      platformSwitch: true,
    },
    sources: [{ title: "Straumann BLX implant system", url: straumannBlxPdf, kind: "brochure" }],
  },
  {
    id: "nobel-branemark",
    brand: "Nobel Biocare",
    system: "Brånemark",
    aliases: ["Mk III", "Mk IV", "external hex", "Branemark"],
    summary:
      "The classic external-hex fixture. Mk III is essentially parallel; Mk IV adds a slight apical taper. A machined coronal band is the familiar older radiographic neck.",
    lookFor: [
      "External hex chimney on the platform.",
      "Parallel or only mildly tapered body with fine-to-standard threads.",
      "Short machined collar on the traditional machined-neck versions.",
    ],
    pitfalls: [
      "Southern external-hex fixtures are coarser and usually more tapered. A fine parallel body points back to Brånemark rather than Southern.",
    ],
    accepts: {
      collar: ["machined-band"],
      connection: ["external-hex"],
      body: ["parallel", "mild-taper"],
      thread: ["fine", "standard"],
      apex: ["flat", "rounded"],
      platformSwitch: ["no"],
      lead: ["single"],
      microgap: ["supracrestal", "crestal"],
    },
    signatures: [],
    twins: [],
    confusers: [
      {
        id: "southern-external",
        note: "Southern’s external-hex line is read here as coarse and more tapered. A fine, parallel, machined-neck hex is the Brånemark pattern in this library.",
      },
    ],
    schematic: {
      collar: "machined",
      body: "parallel",
      thread: "fine",
      apex: "flat",
      connection: "ext-hex",
      platformSwitch: false,
    },
    sources: [
      {
        title: "Nobel Biocare Brånemark system overview",
        url: "https://www.nobelbiocare.com/en-int/branemark",
        kind: "brochure",
      },
    ],
  },
  {
    id: "nobel-active",
    brand: "Nobel Biocare",
    system: "NobelActive",
    aliases: ["Nobel Active", "TiUnite tapered"],
    summary:
      "Bone-level, strongly tapered implant with a double lead, reverse-cutting threads, and an internal conical connection. Built as a gripping design for soft bone and sockets.",
    lookFor: [
      "Strong taper and widely spaced aggressive threads.",
      "Apex comes to a point rather than a broad dome.",
      "Internal cone with a reduced seat. There is no external hex.",
    ],
    pitfalls: [
      "BLX and Helix GM are the usual aggressive-taper differentials. Count the lead and look at the tip before ordering a connection.",
    ],
    accepts: {
      collar: ["bone-level"],
      connection: ["internal-conical"],
      body: ["strong-taper"],
      thread: ["coarse"],
      apex: ["pointed"],
      platformSwitch: ["yes"],
      lead: ["double"],
      microgap: ["crestal"],
    },
    signatures: [
      {
        all: [{ feature: "apex", value: "pointed" }],
        boost: 1.15,
        note: "A pointed apex on a strong taper favors NobelActive over cutting-tip cones in this set.",
      },
    ],
    twins: [],
    confusers: [
      {
        id: "straumann-blx",
        note: "BLX is fully tapered with a variable pitch and a cutting apex, on TorcFit rather than the Nobel cone.",
      },
      {
        id: "neodent-helix",
        note: "Helix GM shares the double lead and the taper. Its published connection is the 16° Grand Morse, and the apex is scored here as cutting.",
      },
    ],
    schematic: {
      collar: "none",
      body: "strong",
      thread: "coarse",
      apex: "point",
      connection: "cone",
      platformSwitch: true,
    },
    sources: [
      {
        title: "NobelActive product page",
        url: "https://www.nobelbiocare.com/en-int/nobelactive",
        kind: "brochure",
      },
      {
        title: "Implant Atlas comparison of NobelActive and BLX design features",
        url: "https://nobel-implants.com/compare/nobelactive-vs-straumann-blx/",
        kind: "interpretation",
      },
    ],
  },
  {
    id: "nobel-parallel",
    brand: "Nobel Biocare",
    system: "NobelParallel CC",
    aliases: ["Nobel Parallel", "conical connection", "CC"],
    summary:
      "Bone-level parallel-walled implant with Nobel’s internal conical connection. A clinical paper describes that connection as 12° and notes built-in platform shift.",
    lookFor: [
      "Parallel body, not a root-form taper.",
      "Internal cone. No external hex and no tulip neck.",
      "Connection seated inside the shoulder.",
    ],
    pitfalls: [
      "Straumann Bone Level with CrossFit is the look-alike. Do not treat a tie as a parts order.",
    ],
    accepts: {
      collar: ["bone-level"],
      connection: ["internal-conical"],
      body: ["parallel"],
      thread: ["standard"],
      apex: ["rounded"],
      platformSwitch: ["yes"],
      lead: ["single"],
      microgap: ["crestal"],
    },
    signatures: [],
    twins: ["straumann-bl"],
    confusers: [
      {
        id: "straumann-bl",
        note: "Straumann Bone Level is the other common parallel internal cone. The film will often support both.",
      },
    ],
    schematic: {
      collar: "none",
      body: "parallel",
      thread: "standard",
      apex: "round",
      connection: "cone",
      platformSwitch: true,
    },
    sources: [
      {
        title: "Materials (2022): NobelParallel described with a 12° conical connection",
        url: nobelParallelPaper,
        kind: "paper",
      },
    ],
  },
  {
    id: "astra-tx",
    brand: "Dentsply Sirona",
    system: "Astra Tech OsseoSpeed TX",
    aliases: ["OsseoSpeed", "MicroThread", "TX", "Astra"],
    summary:
      "OsseoSpeed TX with a MicroThread neck, Conical Seal Design, and an internal double hex. The catalog lists that combination across the TX diameters.",
    lookFor: [
      "A band of minute threads at the neck, finer than the body thread.",
      "Internal conical seal rather than an external hex.",
      "Body is straight on some diameters and only mildly tapered on others.",
    ],
    pitfalls: [
      "OsseoSpeed EV keeps MicroThread and the conical seal. TX versus EV is a poor periapical bet.",
      "Laser-Lok and other micro-bands can imitate MicroThread.",
    ],
    accepts: {
      collar: ["microthread"],
      connection: ["internal-conical"],
      body: ["mild-taper", "parallel"],
      thread: ["standard"],
      apex: ["rounded"],
      platformSwitch: ["yes"],
      lead: ["single"],
      microgap: ["crestal"],
    },
    signatures: [
      {
        all: [{ feature: "collar", value: "microthread" }],
        boost: 0.75,
        note: "MicroThread plus a cone is the Astra pattern, shared by TX and EV.",
      },
    ],
    twins: ["astra-ev"],
    confusers: [
      {
        id: "astra-ev",
        note: "EV was designed to keep MicroThread and Conical Seal Design. Neck texture will not split TX from EV.",
      },
      {
        id: "dentium-implantium",
        note: "Implantium also has a microthread neck, but the seat scored here is an internal hex rather than Astra’s cone.",
      },
    ],
    schematic: {
      collar: "micro",
      body: "mild",
      thread: "standard",
      apex: "round",
      connection: "cone",
      platformSwitch: true,
    },
    sources: [
      { title: "Astra Tech Implant System product catalog", url: astraCatalog, kind: "brochure" },
    ],
  },
  {
    id: "astra-ev",
    brand: "Dentsply Sirona",
    system: "Astra Tech EV",
    aliases: ["OsseoSpeed EV", "EV"],
    summary:
      "EV keeps the Astra BioManagement features: OsseoSpeed, MicroThread, and Conical Seal Design. The body is read as more apically tapered than classic TX.",
    lookFor: [
      "MicroThread neck, same teaching sign as TX.",
      "Internal conical seal.",
      "A clearer apical taper than the straighter TX diameters.",
    ],
    pitfalls: [
      "If the body taper is ambiguous, leave TX and EV as a pair.",
    ],
    accepts: {
      collar: ["microthread"],
      connection: ["internal-conical"],
      body: ["mild-taper", "strong-taper"],
      thread: ["standard"],
      apex: ["rounded"],
      platformSwitch: ["yes"],
      lead: ["single"],
      microgap: ["crestal"],
    },
    signatures: [
      {
        all: [{ feature: "collar", value: "microthread" }],
        boost: 0.75,
        note: "MicroThread plus a cone is the Astra pattern, shared by TX and EV.",
      },
    ],
    twins: ["astra-tx"],
    confusers: [
      {
        id: "astra-tx",
        note: "TX uses the same MicroThread and conical seal. Taper, if obvious, is the only soft split in this app.",
      },
    ],
    schematic: {
      collar: "micro",
      body: "mild",
      thread: "standard",
      apex: "round",
      connection: "cone",
      platformSwitch: true,
    },
    sources: [
      { title: "Astra Tech Implant System EV — evolution through science", url: astraEvPdf, kind: "brochure" },
    ],
  },
  {
    id: "ankylos",
    brand: "Dentsply Sirona",
    system: "Ankylos C/X",
    aliases: ["TissueCare", "Ankylos"],
    summary:
      "Progressive thread that deepens toward the apex, and the TissueCare friction-locked conical connection. The connection is meant to sit at or slightly below the crest.",
    lookFor: [
      "Thread depth grows toward the apex instead of staying even.",
      "No polished transmucosal collar.",
      "Prosthetic seat disappears into the body rather than sitting on a flat hex.",
    ],
    pitfalls: [
      "The indexed hex used by the placement driver is not the radiographic connection. Do not call Ankylos an external hex.",
    ],
    accepts: {
      collar: ["bone-level"],
      connection: ["subcrestal-conical"],
      body: ["mild-taper"],
      thread: ["progressive"],
      apex: ["rounded"],
      platformSwitch: ["yes"],
      lead: ["single"],
      microgap: ["subcrestal"],
    },
    signatures: [
      {
        all: [{ feature: "connection", value: "subcrestal-conical" }],
        boost: 1.7,
        note: "A prosthetic seat that sinks into the fixture is the Ankylos reading in this library.",
      },
      {
        all: [{ feature: "thread", value: "progressive" }],
        boost: 1.35,
        note: "Progressive thread depth is the Ankylos body sign described in the surgical manual.",
      },
    ],
    twins: [],
    confusers: [
      {
        id: "straumann-blx",
        note: "BLX can look progressive because the pitch changes, but its connection is TorcFit at bone level, not a sunk TissueCare seat.",
      },
    ],
    schematic: {
      collar: "none",
      body: "mild",
      thread: "progressive",
      apex: "round",
      connection: "subcrestal",
      platformSwitch: true,
    },
    sources: [{ title: "Ankylos surgical manual", url: ankylosPdf, kind: "manual" }],
  },
  {
    id: "zimmer-tsv",
    brand: "ZimVie",
    system: "Tapered Screw-Vent",
    aliases: ["TSV", "Zimmer", "Screw-Vent", "Zimmer Biomet"],
    summary:
      "Tapered screw implant with a friction-fit internal hex. ZimVie describes a 1.5 mm deep hex and a lead-in bevel. FDA filing K133339 documents an external triple-lead thread and both machined-collar and textured-to-the-top versions.",
    lookFor: [
      "Internal hex, not an external chimney.",
      "Apical taper with a broader coronal body.",
      "Triple lead when the starts can actually be counted. Collar may be machined or textured.",
    ],
    pitfalls: [
      "BioHorizons Tapered Internal is the other common internal-hex taper. Buttress thread versus triple lead is the split, and neither is always visible.",
    ],
    accepts: {
      collar: ["machined-band", "bone-level", "microthread"],
      connection: ["internal-hex"],
      body: ["mild-taper"],
      thread: ["standard"],
      apex: ["cutting"],
      platformSwitch: ["no", "yes"],
      lead: ["triple"],
      microgap: ["crestal"],
    },
    signatures: [
      {
        all: [{ feature: "lead", value: "triple" }],
        boost: 1.4,
        note: "A countable triple lead is the Tapered Screw-Vent clue in this library.",
      },
    ],
    twins: [],
    confusers: [
      {
        id: "biohorizons-ti",
        note: "BioHorizons Tapered Internal is also an internal hex on a taper, with buttress threads and Laser-Lok. Triple lead points to TSV; a buttress flank points to BioHorizons.",
      },
    ],
    schematic: {
      collar: "machined",
      body: "mild",
      thread: "standard",
      apex: "vent",
      connection: "int-hex",
      platformSwitch: false,
    },
    sources: [
      {
        title: "ZimVie Tapered Screw-Vent",
        url: "https://www.zimvie.com/en/dental/dental-implant-systems/tapered-screw-vent-implant.html",
        kind: "brochure",
      },
      {
        title: "FDA K133339 Tapered Screw-Vent triple-lead description",
        url: "https://www.accessdata.fda.gov/cdrh_docs/pdf13/K133339.pdf",
        kind: "manual",
      },
    ],
  },
  {
    id: "biohorizons-ti",
    brand: "BioHorizons",
    system: "Tapered Internal",
    aliases: ["Laser-Lok", "Tapered Plus", "Tapered Pro"],
    summary:
      "Tapered body, reverse buttress threads, and a 1.5 mm internal hex with a lead-in bevel that BioHorizons also describes as a 45° conical internal hex. Laser-Lok is a collar microchannel surface.",
    lookFor: [
      "Internal hex on a tapered body.",
      "Buttress thread: a flatter crestal flank than a simple V.",
      "Laser-Lok may look like a short micro-band or like texture to the top. It is not proof by itself.",
    ],
    pitfalls: [
      "Laser-Lok is a histologic surface. A periapical cannot certify it.",
    ],
    accepts: {
      collar: ["bone-level", "microthread"],
      connection: ["internal-hex"],
      body: ["mild-taper", "strong-taper"],
      thread: ["buttress"],
      apex: ["cutting", "rounded"],
      platformSwitch: ["no"],
      lead: ["single"],
      microgap: ["crestal"],
    },
    signatures: [
      {
        all: [{ feature: "thread", value: "buttress" }],
        boost: 1.15,
        note: "A buttress flank is the BioHorizons thread clue against a generic internal hex.",
      },
    ],
    twins: [],
    confusers: [
      {
        id: "zimmer-tsv",
        note: "Tapered Screw-Vent shares the internal hex and the taper. Its documented thread is a triple lead, not a buttress.",
      },
    ],
    schematic: {
      collar: "none",
      body: "mild",
      thread: "buttress",
      apex: "vent",
      connection: "int-hex",
      platformSwitch: false,
    },
    sources: [
      {
        title: "BioHorizons Tapered Internal",
        url: "https://www.biohorizons.com/Products/Tapered",
        kind: "brochure",
      },
    ],
  },
  {
    id: "osstem-tsiii",
    brand: "Osstem",
    system: "TS III",
    aliases: ["TSIII", "TS III SA", "Osstem SA"],
    summary:
      "Tapered bone-level fixture widely catalogued with an internal conical connection and a sandblasted, acid-etched surface. Scored here as radiographically paired with Hiossen ET III.",
    lookFor: [
      "Mild-to-moderate taper, bone-level platform, no tulip.",
      "Internal cone. The hex-versus-cone detail is often not readable.",
      "Double lead on many TS III fixtures, when the starts can be counted.",
    ],
    pitfalls: [
      "Hiossen ET III is treated as the same radiographic family. The app will not pretend to split them.",
    ],
    accepts: {
      collar: ["bone-level"],
      connection: ["internal-conical"],
      body: ["mild-taper"],
      thread: ["standard"],
      apex: ["cutting"],
      platformSwitch: ["yes"],
      lead: ["double"],
      microgap: ["crestal"],
    },
    signatures: [],
    twins: ["hiossen-etiii"],
    confusers: [
      {
        id: "hiossen-etiii",
        note: "ET III is the Hiossen catalog name in the same design family. Keep both if the cues match, and confirm with the record.",
      },
    ],
    schematic: {
      collar: "none",
      body: "mild",
      thread: "standard",
      apex: "vent",
      connection: "cone",
      platformSwitch: true,
    },
    sources: [
      {
        title: "Osstem implant systems",
        url: "https://en.osstem.com/",
        kind: "brochure",
      },
      {
        title: "Pairing with Hiossen ET III is a radiographic interpretation, not a claim that the SKUs are identical.",
        url: "https://hiossen.com/",
        kind: "interpretation",
      },
    ],
  },
  {
    id: "hiossen-etiii",
    brand: "Hiossen",
    system: "ET III",
    aliases: ["ETIII", "ET III NH", "Hiossen SA"],
    summary:
      "US-catalog tapered implant with an internal conical connection. In this library it is the radiographic twin of Osstem TS III, not a fixture you should split from TS III on one periapical.",
    lookFor: [
      "Same short list as TS III: mild taper, bone-level, internal cone, cutting apex.",
      "No external hex and no transmucosal tulip.",
    ],
    pitfalls: [
      "A confident choice between Hiossen and Osstem from a film alone is not supported.",
    ],
    accepts: {
      collar: ["bone-level"],
      connection: ["internal-conical"],
      body: ["mild-taper"],
      thread: ["standard"],
      apex: ["cutting"],
      platformSwitch: ["yes"],
      lead: ["double"],
      microgap: ["crestal"],
    },
    signatures: [],
    twins: ["osstem-tsiii"],
    confusers: [
      {
        id: "osstem-tsiii",
        note: "TS III carries the same cues in this library. Report the pair, not a single brand.",
      },
    ],
    schematic: {
      collar: "none",
      body: "mild",
      thread: "standard",
      apex: "vent",
      connection: "cone",
      platformSwitch: true,
    },
    sources: [
      { title: "Hiossen", url: "https://hiossen.com/", kind: "brochure" },
      {
        title: "Twin status versus Osstem TS III is an interpretation for radiographic short-listing.",
        url: "https://en.osstem.com/",
        kind: "interpretation",
      },
    ],
  },
  {
    id: "megagen-anyridge",
    brand: "MegaGen",
    system: "AnyRidge",
    aliases: ["KnifeThread", "Xpeed", "Any Ridge"],
    summary:
      "MegaGen’s KnifeThread design: a comparatively narrow core with deep knife-shaped threads, so thread depth changes with the chosen implant while the core stays similar.",
    lookFor: [
      "Thin, deep thread blades and a narrow core.",
      "The outer envelope looks aggressive even when the core is slim.",
      "Bone-level internal connection. The knife thread is the sign, not the hex.",
    ],
    pitfalls: [
      "A coarse V-thread is not a knife thread. The blades should look thin relative to the gaps.",
    ],
    accepts: {
      collar: ["bone-level"],
      connection: ["internal-conical"],
      body: ["strong-taper", "mild-taper"],
      thread: ["knife"],
      apex: ["rounded"],
      platformSwitch: ["yes"],
      lead: ["single"],
      microgap: ["crestal"],
    },
    signatures: [
      {
        all: [{ feature: "thread", value: "knife" }],
        boost: 2.8,
        note: "Knife-thin deep threads are the AnyRidge sign in this library.",
      },
    ],
    twins: [],
    confusers: [
      {
        id: "southern-external",
        note: "Southern’s coarse external-hex thread is deep but not a knife blade, and the hex is external.",
      },
    ],
    schematic: {
      collar: "none",
      body: "strong",
      thread: "knife",
      apex: "round",
      connection: "cone",
      platformSwitch: true,
    },
    sources: [
      {
        title: "MegaGen AnyRidge — KnifeThread",
        url: "https://imegagen.com/product/1292/",
        kind: "brochure",
      },
    ],
  },
  {
    id: "mis-seven",
    brand: "MIS",
    system: "SEVEN",
    aliases: ["MIS Seven", "Seven internal hex"],
    summary:
      "MIS SEVEN, catalogued on an internal hex. Scored as a mildly tapered bone-level body with a double lead and a domed apex.",
    lookFor: [
      "Internal hex.",
      "Mild taper and a rounded apex.",
      "No microthread collar and no external hex.",
    ],
    pitfalls: [
      "MIS C1 uses a conical seat. If you cannot see hex versus cone, leave the connection unmarked.",
    ],
    accepts: {
      collar: ["bone-level"],
      connection: ["internal-hex"],
      body: ["mild-taper"],
      thread: ["standard"],
      apex: ["rounded"],
      platformSwitch: ["no"],
      lead: ["double"],
      microgap: ["crestal"],
    },
    signatures: [],
    twins: [],
    confusers: [
      {
        id: "mis-c1",
        note: "C1 is the conical MIS seat. SEVEN is the internal-hex seat. The bodies can look alike.",
      },
    ],
    schematic: {
      collar: "none",
      body: "mild",
      thread: "standard",
      apex: "round",
      connection: "int-hex",
      platformSwitch: false,
    },
    sources: [
      {
        title: "MIS SEVEN catalog (internal hex tools and implant line)",
        url: "https://www.mis-implants.com/upload/PDF/Products/Implants/MIS_SEVEN_Catalog.pdf",
        kind: "brochure",
      },
    ],
  },
  {
    id: "mis-c1",
    brand: "MIS",
    system: "C1",
    aliases: ["MIS C1", "conical MIS"],
    summary:
      "MIS conical-connection implant, read here as bone-level with platform shift, a mild taper, and a double lead. The connection angle is not inferred from the film.",
    lookFor: [
      "Internal cone with the seat inside the shoulder.",
      "Mild taper, rounded apex, no tulip.",
    ],
    pitfalls: [
      "This pattern overlaps other platform-switched cones. C1 should stay in a short list unless the record already says MIS.",
    ],
    accepts: {
      collar: ["bone-level"],
      connection: ["internal-conical"],
      body: ["mild-taper"],
      thread: ["standard"],
      apex: ["rounded"],
      platformSwitch: ["yes"],
      lead: ["double"],
      microgap: ["crestal"],
    },
    signatures: [],
    twins: [],
    confusers: [
      {
        id: "mis-seven",
        note: "SEVEN is the internal-hex sibling. Mark hex only when you can see it.",
      },
    ],
    schematic: {
      collar: "none",
      body: "mild",
      thread: "standard",
      apex: "round",
      connection: "cone",
      platformSwitch: true,
    },
    sources: [
      {
        title: "MIS implant systems",
        url: "https://www.mis-implants.com/",
        kind: "brochure",
      },
      {
        title: "C1 body and lead details are a catalog interpretation for short-listing, not a measured radiograph atlas.",
        url: "https://www.mis-implants.com/",
        kind: "interpretation",
      },
    ],
  },
  {
    id: "dentium-implantium",
    brand: "Dentium",
    system: "Implantium",
    aliases: ["Implantium", "Dentium microthread"],
    summary:
      "Dentium’s microthread-neck fixture on an internal hex, with a tapered body. The microthread is the neck sign; the hex separates it from Astra’s cone.",
    lookFor: [
      "Fine thread band at the neck.",
      "Internal hex rather than a long cone.",
      "Double lead when it can be counted.",
    ],
    pitfalls: [
      "Astra MicroThread plus a cone is the main differential. Do not upgrade a microthread into an Astra call without the seat.",
    ],
    accepts: {
      collar: ["microthread"],
      connection: ["internal-hex"],
      body: ["mild-taper"],
      thread: ["standard"],
      apex: ["rounded"],
      platformSwitch: ["no"],
      lead: ["double"],
      microgap: ["crestal"],
    },
    signatures: [],
    twins: [],
    confusers: [
      {
        id: "astra-tx",
        note: "Astra’s MicroThread sits on Conical Seal Design. Implantium is scored on an internal hex.",
      },
    ],
    schematic: {
      collar: "micro",
      body: "mild",
      thread: "standard",
      apex: "round",
      connection: "int-hex",
      platformSwitch: false,
    },
    sources: [
      {
        title: "Dentium USA implant systems",
        url: "https://www.dentiumusa.com/products/implant-systems/superline-2",
        kind: "brochure",
      },
      {
        title: "Implantium neck and hex are a catalog interpretation used for the checklist.",
        url: "https://www.dentiumusa.com/",
        kind: "interpretation",
      },
    ],
  },
  {
    id: "dentium-superline",
    brand: "Dentium",
    system: "SuperLine",
    aliases: ["SuperLine II", "Superline"],
    summary:
      "Dentium describes SuperLine II as a double-threaded tapered body with one conical connection and an internal hex for indexation across diameters.",
    lookFor: [
      "Taper plus a double thread and a cutting apex.",
      "Conical connection. No microthread collar, unlike Implantium.",
    ],
    pitfalls: [
      "Neodent Helix GM is the aggressive tapered cone that shares this silhouette. Keep both when the cues match.",
    ],
    accepts: {
      collar: ["bone-level"],
      connection: ["internal-conical"],
      body: ["strong-taper"],
      thread: ["coarse"],
      apex: ["cutting"],
      platformSwitch: ["yes"],
      lead: ["double"],
      microgap: ["crestal"],
    },
    signatures: [],
    twins: ["neodent-helix"],
    confusers: [
      {
        id: "neodent-helix",
        note: "Helix GM publishes a 16° Grand Morse connection and a similarly aggressive tapered body. This film will often support both.",
      },
    ],
    schematic: {
      collar: "none",
      body: "strong",
      thread: "coarse",
      apex: "vent",
      connection: "cone",
      platformSwitch: true,
    },
    sources: [
      {
        title: "Dentium SuperLine II",
        url: "https://www.dentiumusa.com/products/implant-systems/superline-2",
        kind: "brochure",
      },
    ],
  },
  {
    id: "neodent-helix",
    brand: "Neodent",
    system: "Helix GM",
    aliases: ["Grand Morse", "GM Helix", "Helix"],
    summary:
      "Grand Morse connection: a deep internal taper of 16° plus an indexed hex called Grand Morse Exact, shared across Helix, Drive, and Titamax diameters. Helix is the tapered, aggressive-thread body in that family.",
    lookFor: [
      "Strong taper, coarse thread, cutting apex.",
      "Internal cone. The 16° angle itself is not visible.",
      "One prosthetic connection size across diameters.",
    ],
    pitfalls: [
      "Drive GM and Titamax GM share the connection and are not separate entries. A Helix guess does not exclude those bodies.",
      "SuperLine is the closest outside look-alike.",
    ],
    accepts: {
      collar: ["bone-level"],
      connection: ["internal-conical"],
      body: ["strong-taper"],
      thread: ["coarse"],
      apex: ["cutting"],
      platformSwitch: ["yes"],
      lead: ["double"],
      microgap: ["crestal"],
    },
    signatures: [],
    twins: ["dentium-superline"],
    confusers: [
      {
        id: "dentium-superline",
        note: "SuperLine II is also a double-thread tapered cone. Grand Morse versus Dentium’s cone is a record check, not a film check.",
      },
      {
        id: "nobel-active",
        note: "NobelActive’s apex is pointed and its connection is the Nobel cone. Helix is scored with a cutting apex.",
      },
    ],
    schematic: {
      collar: "none",
      body: "strong",
      thread: "coarse",
      apex: "vent",
      connection: "cone",
      platformSwitch: true,
    },
    sources: [{ title: "Neodent Grand Morse prosthetics manual", url: neodentGm, kind: "manual" }],
  },
  {
    id: "camlog-progressive",
    brand: "Camlog",
    system: "Progressive-Line",
    aliases: ["Tube-in-Tube", "Screw-Line", "Promote"],
    summary:
      "Camlog’s Tube-in-Tube connection with three cams, shared by Screw-Line and Progressive-Line. Progressive-Line adds an apically conical body and threads that run toward the apex.",
    lookFor: [
      "Tube-in-Tube only if that geometry is already known. The cams are seldom obvious.",
      "Apical taper with thread carried toward the tip.",
      "No external hex.",
    ],
    pitfalls: [
      "If you leave the connection as a generic internal seat, Camlog sinks into the cone cluster on purpose.",
    ],
    accepts: {
      collar: ["bone-level", "machined-band"],
      connection: ["tube-in-tube"],
      body: ["strong-taper", "mild-taper"],
      thread: ["coarse", "standard"],
      apex: ["rounded"],
      platformSwitch: ["no"],
      lead: ["single"],
      microgap: ["crestal"],
    },
    signatures: [
      {
        all: [{ feature: "connection", value: "tube-in-tube" }],
        boost: 2.2,
        note: "Tube-in-Tube is treated as a Camlog-family sign when you can actually defend it.",
      },
    ],
    twins: [],
    confusers: [
      {
        id: "anthogyr-axiom",
        note: "Without a visible tube-in-tube seat, Progressive-Line looks like any other tapered internal implant.",
      },
    ],
    schematic: {
      collar: "none",
      body: "strong",
      thread: "coarse",
      apex: "round",
      connection: "tube",
      platformSwitch: false,
    },
    sources: [
      {
        title: "Camlog Tube-in-Tube and Progressive-Line",
        url: "https://www.camlog.com/en/products/implant-systems/camlog",
        kind: "brochure",
      },
    ],
  },
  {
    id: "anthogyr-axiom",
    brand: "Anthogyr",
    system: "Axiom BL",
    aliases: ["Axiom", "Axiom REG", "Axiom PX"],
    summary:
      "Bone-level Anthogyr Axiom fixture scored as an internal conical, platform-switched, mildly tapered implant. It lives in the generic cone cluster unless other records intervene.",
    lookFor: [
      "Bone-level internal cone.",
      "Mild taper and a standard thread.",
      "No pathognomonic neck.",
    ],
    pitfalls: [
      "BEGO Semados RSX is scored with the same silhouette. A tie is the honest output.",
    ],
    accepts: {
      collar: ["bone-level"],
      connection: ["internal-conical"],
      body: ["mild-taper"],
      thread: ["standard"],
      apex: ["rounded"],
      platformSwitch: ["yes"],
      lead: ["single"],
      microgap: ["crestal"],
    },
    signatures: [],
    twins: ["bego-semados"],
    confusers: [
      {
        id: "bego-semados",
        note: "Semados RSX is in the same mild internal-cone bucket. Do not order Anthogyr parts from that tie.",
      },
    ],
    schematic: {
      collar: "none",
      body: "mild",
      thread: "standard",
      apex: "round",
      connection: "cone",
      platformSwitch: true,
    },
    sources: [
      {
        title: "Anthogyr implant systems",
        url: "https://www.anthogyr.com/",
        kind: "brochure",
      },
      {
        title: "Axiom BL checklist values are a catalog interpretation for short-listing.",
        url: "https://www.anthogyr.com/",
        kind: "interpretation",
      },
    ],
  },
  {
    id: "southern-external",
    brand: "Southern Implants",
    system: "External hex, coarse thread",
    aliases: ["Southern", "Co-Axis", "MAX", "external hex Southern"],
    summary:
      "Southern’s external-hex range, scored for the coarse deep thread that separates it from a classic Brånemark film. Deep Conical Southern implants are a different connection and are not this entry.",
    lookFor: [
      "External hex plus visibly deep, widely spaced threads.",
      "Body often tapered rather than a long parallel wall.",
      "Roughness often runs close to the top.",
    ],
    pitfalls: [
      "Co-Axis angulation is a prosthetic feature and is easy to miss on a periapical.",
      "This entry is not Southern Deep Conical.",
    ],
    accepts: {
      collar: ["bone-level"],
      connection: ["external-hex"],
      body: ["strong-taper", "mild-taper"],
      thread: ["coarse"],
      apex: ["rounded"],
      platformSwitch: ["no"],
      lead: ["single"],
      microgap: ["supracrestal", "crestal"],
    },
    signatures: [
      {
        all: [
          { feature: "connection", value: "external-hex" },
          { feature: "thread", value: "coarse" },
        ],
        boost: 1.7,
        note: "External hex plus a coarse thread is the Southern pattern against Brånemark in this library.",
      },
    ],
    twins: [],
    confusers: [
      {
        id: "nobel-branemark",
        note: "Brånemark’s external hex is paired here with a machined neck and a finer parallel thread.",
      },
    ],
    schematic: {
      collar: "none",
      body: "strong",
      thread: "coarse",
      apex: "round",
      connection: "ext-hex",
      platformSwitch: false,
    },
    sources: [
      {
        title: "Southern Implants",
        url: "https://www.southernimplants.com/",
        kind: "brochure",
      },
      {
        title: "Coarse-thread external-hex reading is a teaching interpretation for this checklist.",
        url: "https://www.southernimplants.com/",
        kind: "interpretation",
      },
    ],
  },
  {
    id: "bego-semados",
    brand: "BEGO",
    system: "Semados RSX",
    aliases: ["Semados", "Bego", "RSX", "RS"],
    summary:
      "BEGO Semados RS/RSX scored as a bone-level, platform-switched internal cone with a mild taper. The entry is intentionally non-specific.",
    lookFor: [
      "Nothing pathognomonic. Mild taper, standard thread, internal cone.",
      "Use it as a member of the cone cluster, then confirm on the card or the record.",
    ],
    pitfalls: [
      "Several Semados generations differ. This one profile cannot cover S-Line microthreads and RSX equally well.",
    ],
    accepts: {
      collar: ["bone-level"],
      connection: ["internal-conical"],
      body: ["mild-taper"],
      thread: ["standard"],
      apex: ["rounded"],
      platformSwitch: ["yes"],
      lead: ["single"],
      microgap: ["crestal"],
    },
    signatures: [],
    twins: ["anthogyr-axiom"],
    confusers: [
      {
        id: "anthogyr-axiom",
        note: "Axiom BL shares this mild cone silhouette. Keep the pair together.",
      },
    ],
    schematic: {
      collar: "none",
      body: "mild",
      thread: "standard",
      apex: "round",
      connection: "cone",
      platformSwitch: true,
    },
    sources: [
      {
        title: "BEGO implantology",
        url: "https://www.bego.com/implantology-solutions/",
        kind: "brochure",
      },
      {
        title: "RSX feature bucket is a partial catalog interpretation.",
        url: "https://www.bego.com/",
        kind: "interpretation",
      },
    ],
  },
  {
    id: "prama",
    brand: "Sweden & Martina",
    system: "Prama",
    aliases: ["hyperbolic neck", "UTM", "Collex"],
    summary:
      "Transmucosal neck with a 0.80 mm cylindrical portion and a 2.00 mm hyperbolic portion, UTM microthread along the neck, and the Collex connection with an internal hex. Larger diameters share a 3.40 mm connection.",
    lookFor: [
      "Neck narrows toward the crown. It does not flare like a tulip.",
      "Microthread along that neck (UTM), which may be subtle.",
      "Internal hex. The hyperbolic outline is the sign you can actually see.",
    ],
    pitfalls: [
      "A narrow abutment on a bone-level fixture can fake a convergent neck. The neck has to be continuous with the fixture.",
    ],
    accepts: {
      collar: ["hyperbolic"],
      connection: ["internal-hex"],
      body: ["parallel", "mild-taper"],
      thread: ["standard", "buttress"],
      apex: ["rounded"],
      platformSwitch: ["yes", "no"],
      lead: ["single"],
      microgap: ["supracrestal"],
    },
    signatures: [
      {
        all: [{ feature: "collar", value: "hyperbolic" }],
        boost: 2.6,
        note: "A convergent hyperbolic neck is the Prama sign in this library.",
      },
    ],
    twins: [],
    confusers: [
      {
        id: "straumann-tl",
        note: "Tissue Level flares coronally. Prama converges coronally.",
      },
    ],
    schematic: {
      collar: "hyperbolic",
      body: "parallel",
      thread: "standard",
      apex: "round",
      connection: "int-hex",
      platformSwitch: true,
    },
    sources: [
      {
        title: "Sweden & Martina Prama morphology",
        url: "https://prama.sweden-martina.com/en/morphology",
        kind: "brochure",
      },
      {
        title: "Prama brochure: hyperbolic neck, UTM, Collex internal hex",
        url: "https://www.sweden-martina.com/articms/admin/reserved_area_file/177/d-imp-beprama-e_rev.12-17_v.01_LR.pdf",
        kind: "brochure",
      },
    ],
  },
  {
    id: "biomet-3i-certain",
    brand: "Biomet 3i",
    system: "Certain",
    aliases: ["3i", "OSSEOTITE", "Certain internal", "PREVAIL"],
    summary:
      "3i Certain internal-connection implant. Scored as an internal hex on a parallel or mildly tapered body, with or without a short machined band. PREVAIL’s medialized platform is allowed but not required.",
    lookFor: [
      "Internal connection, not the older 3i external hex (that external-hex line is not this entry).",
      "Standard thread and a rounded apex.",
      "Parallel body unless you are clearly on a tapered NT variant.",
    ],
    pitfalls: [
      "Certain versus Tapered Screw-Vent needs the lead count or the record. Both are internal hexes from the Zimmer Biomet / ZimVie family history.",
    ],
    accepts: {
      collar: ["machined-band", "bone-level"],
      connection: ["internal-hex"],
      body: ["parallel", "mild-taper"],
      thread: ["standard"],
      apex: ["rounded"],
      platformSwitch: ["yes", "no"],
      lead: ["single"],
      microgap: ["crestal"],
    },
    signatures: [],
    twins: [],
    confusers: [
      {
        id: "zimmer-tsv",
        note: "Tapered Screw-Vent is the triple-lead tapered hex. Certain is scored as a single-lead internal hex.",
      },
    ],
    schematic: {
      collar: "machined",
      body: "parallel",
      thread: "standard",
      apex: "round",
      connection: "int-hex",
      platformSwitch: true,
    },
    sources: [
      {
        title: "ZimVie / 3i Certain overview",
        url: "https://www.zimvie.com/en/dental/dental-implant-systems.html",
        kind: "brochure",
      },
      {
        title: "Certain versus external-hex OSSEOTITE is separated here on purpose; the external-hex 3i line is not scored.",
        url: "https://www.zimvie.com/",
        kind: "interpretation",
      },
    ],
  },
];

const byId = new Map(SYSTEMS.map((system) => [system.id, system]));

export function getSystem(id: string): ImplantSystem | undefined {
  return byId.get(id);
}

export function brands(): string[] {
  return [...new Set(SYSTEMS.map((system) => system.brand))].sort((a, b) => a.localeCompare(b));
}

export type CompanyIdentity = {
  company: string;
  manufacturer: string | null;
};

/** The name a dentist writes on the lab slip. Generation and SKU stay on `system`. */
export function identityOf(system: ImplantSystem): CompanyIdentity {
  switch (system.id) {
    case "astra-tx":
    case "astra-ev":
      return { company: "Astra Tech", manufacturer: "Dentsply Sirona" };
    case "ankylos":
      return { company: "Ankylos", manufacturer: "Dentsply Sirona" };
    case "zimmer-tsv":
      return { company: "Zimmer Biomet", manufacturer: "ZimVie" };
    case "biomet-3i-certain":
      return { company: "Biomet 3i", manufacturer: "ZimVie" };
    case "neodent-helix":
      return { company: "Neodent", manufacturer: "Straumann Group" };
    default:
      return { company: system.brand, manufacturer: null };
  }
}

export function companies(): string[] {
  return [...new Set(SYSTEMS.map((system) => identityOf(system).company))].sort((a, b) => a.localeCompare(b));
}
