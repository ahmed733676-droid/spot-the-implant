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
