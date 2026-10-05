# Competitors and published methods

Read in October 2026 from public pages and abstracts. This file is a design note, not a clinical head-to-head. Spot the Implant has no labeled radiograph set, so it does not claim a higher sensitivity than any of these.

The job we optimized for is narrower than most of them: name the **company** on a periapical, keep the line secondary, and refuse the call when the film cannot support it.

## What each one actually does

| Method | What it does well | Where it is weak for a company call on a periapical |
| --- | --- | --- |
| [Spotimplant](https://www.spotimplant.com/en/dental-implant-identification/) (Allisone) | Large catalog (their pages say 300+ brands and 3,500+ models). Asks for an orthogonal periapical of one fixture, head to apex. Returns features, dimensions, and a ranked list. A person reviews the report. | The film is uploaded. The report is quoted as arriving within 24 hours, not at the chair. The page calls the score a probability. The product is aimed at model and prosthetic parts, which a periapical often cannot settle. The feature path is not something the dentist edits before the number is shown. |
| [Implantif.AI](https://implantifai.com/) | Also starts from a parallel periapical, returns a match score, and says an unclear case goes to a person. It tells the user that a bad acquisition gives a bad result. | Same upload, same model-level promise, same opaque score. Coverage notes on the site are oriented to accessory contacts in Spain. |
| Implant Recognition Software, Michelinakis, Sharrock, and Barclay, Int Dent J 2006 | Nine design questions, so a partial answer still narrows the list. Trialed in practice and for forensic identification. 87 manufacturers and 231 designs at the time. | The open review in 2021 describes the dataset as frozen after 2004. Questions included surface, diameter, and length, which a periapical does not show. No living confidence cap. |
| Sahiwal, Woody, Benson, and Guillen, J Prosthet Dent 2002 | The method this bench copies: coronal, midbody, and apical tables, and an explicit angulation limit (about ±10° usable, about 20° not). | Paper tables of donated implants, not software. The 2021 review calls the lookup cumbersome and out of date. No company-versus-line split and no abstention rule beyond “unrecognizable.” |
| whatimplantisthat and OSSEOsource, as described by Saghiri et al., Bull Natl Res Cent 2021 | Photo search of radiographs. A case report used them when the record was missing. An app followed the website. | Matching a picture is not a differential. The review treats these banks as geographically and temporally limited. They do not score a hard-negative pair as “do not name the company.” |
| Morais et al., 2015, summarized in the same review | A research contour-plus-classifier. In one lab setup, 91% of 11 known models were recognized after the reference set was reduced. | Eleven models in a controlled set is not a brand accuracy on clinic periapicals. Not a product a dentist can run in the browser. |
| Overjet, Pearl, Diagnocat | Cleared tools for caries, bone level, periapical lesions, and CBCT viewing. Useful dentistry. | They do not identify implant manufacturer. Copying their clearance language would be false. |

## What we changed because of that

1. **Company before SKU.** Spotimplant and Implantif.AI are built to name a model and a part. A periapical is a better company test than a catalog-number test. Astra TX and EV stay one company. Osstem and Hiossen stay two names for one look, and the company is not called.
2. **The dentist confirms the features.** Their networks predict features and then a probability. Here the image code may suggest collar, taper, thread, and apex. Junction line and connection stay manual. Nothing enters the score until it is accepted.
3. **The film stays on the device.** Their services require an upload and a wait. This bench is a local checklist.
4. **Angulation is a switch, not a hope.** Sahiwal’s ±10° / ~20° finding and Sewerin’s thread-image finding are a control: mark the film angled and the company cap falls to 62%, with the paper named on the result.
5. **Hard negatives stay on the list.** A signature boost cannot erase a declared lookalike. The runner-up company is a hypothesis, with the 2021 review’s 2D limit written under it.
6. **No probability and no clearance.** Their pages say probability and, for the pathology products, FDA clearance. This percentage is feature agreement, capped at 92%, and the about page says the bench is not a device.

## What we still do not beat

- Catalog breadth. Twenty-five common systems is not 3,500 models. A rare or discontinued fixture should go to the library, a specialist, or a service with a larger bank.
- A reviewed report from someone who has seen thousands of films. We do not have that staff.
- A measured sensitivity. Until Ahmed’s labeled films exist, “more accurate than Spotimplant” is not a sentence this repository can say. The design is aimed at fewer over-calls on common companies, which is a different claim and still unmeasured.
