# VolksHuisvesting IMS — Wizard Field Contract

**Extracted:** 2026-03-28  
**Source:** volkshuisvesting.sr  
**Version:** V1.8

---

## BOUWSUBSIDIE WIZARD — 9 stappen

**Route:** `/bouwsubsidie/apply`

---

### Stap 0 — Introductie

**Titel:** Welkom bij de Bouwsubsidie Aanvraag  
**Omschrijving:** Lees de volgende informatie aandachtig door voordat u verder gaat.

**Belangrijke mededeling:**

> Aanvragen via dit portaal zijn alleen voor registratiedoeleinden. Er wordt geen evaluatie of beslissing genomen aan het loket. Alle aanvragen worden beoordeeld door de betreffende afdeling en u wordt over de uitkomst geïnformeerd.
>
> Personen die reeds eerder een bouwsubsidie hebben ontvangen, komen niet in aanmerking voor een nieuwe aanvraag.
>
> Werkloze aanvragers die een aanvraag willen indienen, dienen zich persoonlijk te melden bij de afdeling Volkshuisvesting.

**Aanvraagproces:**

1. **Aanvraag indienen** — Vul dit formulier in met uw gegevens
2. **Beoordelingsproces** — Uw aanvraag wordt beoordeeld door medewerkers
3. **Melding ontvangen** — U wordt over de uitkomst geïnformeerd

**Wat u nodig heeft:**

- Geldig ID-nummer
- Contactgegevens (telefoonnummer verplicht)
- Huidige adresgegevens
- Vereiste documenten (moeten worden geüpload)

**Benodigde documenten:**

- Kopie ID-kaart (verplicht)
- Nationaliteitverklaring (verplicht)
- Minimaal 1 inkomensbewijs: loonstrook, AOV-verklaring, pensioenverklaring of werkgeversverklaring

**Opmerking:** Overige documenten (eigendom, juridisch) kunnen optioneel worden toegevoegd

**Bevestigingscheckbox:** "Ik begrijp dat dit alleen een registratieportaal is en dat er geen evaluatie of beslissing wordt genomen aan het loket. Ik bevestig dat ik nauwkeurige informatie zal verstrekken."

---

### Stap 1 — Gegevens (Persoonsgegevens)

**Titel:** Persoonsgegevens  
**Omschrijving:** Vul uw persoonlijke gegevens in zoals vermeld op uw identiteitsbewijs.

| Veld | Type | Verplicht | Opties / Validatie |
|---|---|---|---|
| ID-nummer | text | ja | Min. 5 tekens. Foutmelding: "ID-nummer is verplicht" / "ID-nummer moet minimaal 5 tekens zijn" |
| Voornaam | text | ja | Min. 1 teken. Foutmelding: "Voornaam is verplicht" |
| Achternaam | text | ja | Min. 1 teken. Foutmelding: "Achternaam is verplicht" |
| Geboortedatum | date | ja | Foutmelding: "Geboortedatum is verplicht" |
| Geslacht | select | ja | Opties: Man, Vrouw, Anders. Waarden: `male`, `female`, `other`. Foutmelding: "Geslacht is verplicht" / "Selecteer een geldig geslacht" |

---

### Stap 2 — Contact (Contactgegevens)

**Titel:** Contactgegevens  
**Omschrijving:** Hoe kunnen wij u bereiken over uw aanvraag?

| Veld | Type | Verplicht | Opties / Validatie |
|---|---|---|---|
| Telefoonnummer | text | ja | Min. 7 tekens. Foutmelding: "Telefoonnummer is verplicht" / "Telefoonnummer moet minimaal 7 cijfers zijn" |
| E-mailadres | email | ja | E-mail format validatie. Foutmelding: "E-mailadres is verplicht" / "Ongeldig e-mailadres" |

---

### Stap 3 — Gezin (Gezinsamenstelling)

**Titel:** Gezinsamenstelling  
**Omschrijving:** Vertel ons over uw gezinsamenstelling.

| Veld | Type | Verplicht | Opties / Validatie |
|---|---|---|---|
| Gezinsgrootte | number | ja | Min: 1, Max: 20. Helptekst: "Inclusief uzelf". Foutmelding: "Gezinsgrootte is verplicht" / "Gezinsgrootte moet minimaal 1 zijn" / "Gezinsgrootte mag maximaal 20 zijn" |
| Aantal afhankelijken | number | nee | Min: 0, Max: 20. Helptekst: "Kinderen of anderen die financieel van u afhankelijk zijn (optioneel)" |

**Kinderen in het gezin** (dynamische tabel, knop "Kind toevoegen"):

| Kolom | Type | Opties |
|---|---|---|
| # | auto-increment | — |
| Leeftijd | number | Min: 0, Max: 17 |
| Geslacht | select | Man (`M`), Vrouw (`F`) |
| Beperking | checkbox | — |
| (verwijderen) | button | Verwijdert rij |

**Leeg-tekst:** "Geen kinderen toegevoegd. Gebruik de knop hierboven om kinderen aan het huishouden toe te voegen."

---

### Stap 4 — Adres (Huidig adres)

**Titel:** Huidig adres  
**Omschrijving:** Waar woont u momenteel?

| Veld | Type | Verplicht | Opties / Validatie |
|---|---|---|---|
| Straatnaam en huisnummer | text | ja | Min. 5 tekens. Foutmelding: "Adres is verplicht" / "Adres moet minimaal 5 tekens zijn" |
| District | select | ja | Opties: Paramaribo (`PAR`), Wanica (`WAA`), Nickerie (`NIC`), Coronie (`COR`), Saramacca (`SAR`), Commewijne (`COM`), Marowijne (`MAR`), Para (`PAB`), Brokopondo (`BRO`), Sipaliwini (`SIP`). Foutmelding: "District is verplicht" |
| Ressort | text | nee | Helptekst: "Optioneel" |

---

### Stap 5 — Aanvraag (Aanvraaggegevens)

**Titel:** Aanvraaggegevens  
**Omschrijving:** Vertel ons meer over uw bouwsubsidie-aanvraag.

| Veld | Type | Verplicht | Opties / Validatie |
|---|---|---|---|
| Reden voor aanvraag | select | ja | Opties: Afbouw woning (`new_construction`), Woningrenovatie (`renovation`), Woninguitbreiding (`extension`), Structurele reparaties (`repair`), Rampenherstel (`disaster_recovery`). Foutmelding: "Selecteer een reden voor uw aanvraag" |
| Geschat bedrag (SRD) | text | nee | Placeholder: "bijv. 50000". Helptekst: "Optioneel - geschatte bouwkosten" |
| Calamiteit/Noodaanvraag | checkbox | nee | Beschrijving: "Vink dit vakje aan als uw aanvraag het gevolg is van een natuurramp, brand of andere noodsituatie" |

**Conditionele waarschuwing** (getoond als Calamiteit is aangevinkt):

> **Noodaanvraag**  
> Noodaanvragen komen mogelijk in aanmerking voor versnelde verwerking. Zorg ervoor dat u documentatie van de noodsituatie beschikbaar heeft voor verificatie.

---

### Stap 6 — Documenten (Documenten uploaden)

**Titel:** Documenten uploaden  
**Omschrijving:** Upload de vereiste documenten om door te gaan met uw aanvraag.

**Info-box:**

> **Documentvereisten**  
> Alle verplichte documenten moeten worden geüpload voordat u uw aanvraag kunt indienen. Ondersteunde bestandstypen: PDF, JPG, PNG. Maximale bestandsgrootte: 10MB per document.
>
> Let op: indien foto's of scans van documenten onduidelijk zijn, wordt de aanvraag niet verder in behandeling genomen.
>
> Alle documenten moeten op naam van de aanvrager staan (bijv. grondbewijs, eigendomsbewijs).

**14 documentslots:**

| Document | Code | Categorie | Verplicht | Groep |
|---|---|---|---|---|
| Kopie ID-kaart (voor- en achterkant) | `ID_COPY` | identity | ja | — |
| Nationaliteitverklaring | `NATIONALITY_DECLARATION` | identity | ja | — |
| Loonstrook | `PAYSLIP` | income | nee* | `income_proof` |
| AOV-verklaring | `AOV_STATEMENT` | income | nee* | `income_proof` |
| Pensioenverklaring | `PENSION_STATEMENT` | income | nee* | `income_proof` |
| Werkgeversverklaring | `EMPLOYER_DECLARATION` | income | nee* | `income_proof` |
| Grondbewijs / eigendomsbewijs | `PROPERTY_DEED` | property | nee | — |
| GLIS-uittreksel | `GLIS_EXTRACT` | property | nee | — |
| Perceelkaart | `PARCEL_MAP` | property | nee | — |
| Notariële akte | `NOTARIAL_DEED` | legal | nee | — |
| Koopovereenkomst | `PURCHASE_AGREEMENT` | legal | nee | — |
| Boedelgrondverklaring | `ESTATE_PERMISSION` | special | nee | — |
| Hypotheekuittreksel | `MORTGAGE_EXTRACT` | special | nee | — |
| Verklaring dorpshoofd | `VILLAGE_AUTHORITY` | special | nee | — |

*\*Groep-verplicht: minimaal 1 van de 4 `income_proof` documenten moet worden geüpload.*

**Upload-beperkingen:**

- Max. bestandsgrootte: 10MB
- Toegestane types: PDF, JPG, PNG
- Foutmeldingen: "Bestand te groot. Maximum is 10MB." / "Ongeldig bestandstype. Gebruik PDF, JPG of PNG."

**Checklist (3 items, controleert of doorgang is toegestaan):**

- ☐ Kopie ID-kaart geüpload
- ☐ Nationaliteitverklaring geüpload
- ☐ Minimaal één inkomensbewijs geüpload

**Succes-tekst:** "Alle vereiste documenten zijn geüpload. U kunt doorgaan."  
**Blokkeer-tekst:** "Upload alle verplichte documenten om door te gaan" / "Upload minimaal één inkomensbewijs om door te gaan."

---

### Stap 7 — Controleren (Controleer uw aanvraag)

**Titel:** Controleer uw aanvraag  
**Omschrijving:** Controleer alle informatie voordat u indient.

**Review-secties:**

1. **Persoonlijke gegevens** — ID-nummer, Voornaam, Achternaam, Geboortedatum, Geslacht
2. **Contactgegevens** — Telefoonnummer, E-mailadres
3. **Gezinsamenstelling** — Gezinsgrootte, Afhankelijken
4. **Kinderen in het gezin** — Per kind: "Kind {nummer} — {leeftijd} jaar, {geslacht}" + badge "beperking" indien van toepassing. Leeg: "Geen kinderen geregistreerd in dit gezin."
5. **Huidig adres** — Straatnaam en huisnummer, District, Ressort
6. **Aanvraaggegevens** — Reden voor aanvraag, Geschat bedrag (SRD), Noodaanvraag (Ja/Nee badge)
7. **Geüploade documenten** — Aantal geüpload / totaal, per document: ✓/✗ icoon + naam + bestandsnaam

**Waarheidsverklaring (checkbox, verplicht om in te dienen):**

> **Waarheidsverklaring**  
> Ik verklaar hierbij dat alle informatie in deze aanvraag naar waarheid en naar mijn beste weten is verstrekt. Ik begrijp dat het verstrekken van onjuiste informatie kan leiden tot afwijzing van mijn aanvraag en mogelijke juridische consequenties.

**Knop:** "Aanvraag indienen" (uitgeschakeld totdat verklaring is geaccepteerd)

---

### Stap 8 — Receipt (Ontvangstbewijs)

**Titel:** Aanvraag succesvol ingediend  
**Omschrijving:** Uw bouwsubsidie-aanvraag is geregistreerd. Bewaar de onderstaande informatie.

**Weergegeven informatie:**

| Element | Beschrijving |
|---|---|
| Referentienummer | Formaat: BS-JJJJ-NNNNNN. Met kopieerknop. Helptekst: "Gebruik dit nummer om de status van uw aanvraag te volgen" |
| Beveiligingstoken | Wordt eenmaal getoond. Met kopieerknop. Waarschuwing: "Bewaar dit token veilig. U heeft zowel het referentienummer als dit token nodig om online de status van uw aanvraag te controleren. Dit token wordt slechts één keer getoond." |
| Ingediend op | Datum (lokale notatie) |
| Tijd | Tijdstip (lokale notatie) |

**Wat gebeurt er nu? (3 stappen):**

1. **Beoordeling aanvraag** — Uw aanvraag wordt beoordeeld door de afdeling Volkshuisvesting.
2. **Documentverificatie** — Uw geüploade documenten worden gecontroleerd.
3. **Beslissingsmelding** — U wordt telefonisch geïnformeerd over de uitkomst van uw aanvraag.

**Actieknoppen:** Afdrukken, Status controleren, Terug naar home

---
---

## WONINGREGISTRATIE WIZARD — 11 stappen

**Route:** `/housing/register`

---

### Stap 0 — Introductie

**Titel:** Welkom bij de Woningregistratie  
**Omschrijving:** Registreer voor de officiële wachtlijst voor huisvesting in Suriname.

**Over de wachtlijst voor huisvesting:**

> Deze registratie plaatst u op de officiële wachtlijst voor huisvesting beheerd door het Ministerie van Sociale Zaken en Volkshuisvesting. Registratie garandeert geen directe toewijzing van huisvesting. Toewijzing is gebaseerd op beschikbaarheid, urgentie en wachtlijstpositie.

**Registratieproces:**

1. **Registreren** — Vul dit registratieformulier in
2. **Wachten op beoordeling** — Uw registratie wordt geverifieerd
3. **Toewijzing** — Huisvesting wordt toegewezen wanneer beschikbaar

**Wat u nodig heeft:**

- Geldig ID-nummer
- Contactgegevens (telefoonnummer verplicht)
- Informatie over uw huidige woonsituatie
- Inkomensgegevens (indien van toepassing)

**Benodigde documenten:**

- Kopie ID-kaart (verplicht)
- Inkomensbewijs (verplicht)
- Bewijs van woonadres (verplicht)

**Opmerking:** Optioneel: gezinssamenstelling, medische verklaring, noodbewijs

**Bevestigingscheckbox:** "Ik begrijp dat dit een registratie voor de wachtlijst voor huisvesting is en dat plaatsing geen directe huisvesting garandeert. Ik bevestig dat ik nauwkeurige informatie zal verstrekken."

---

### Stap 1 — Gegevens (Persoonsgegevens)

**Titel:** Persoonsgegevens  
**Omschrijving:** Vul uw persoonlijke gegevens in zoals vermeld op uw identiteitsbewijs.

| Veld | Type | Verplicht | Opties / Validatie |
|---|---|---|---|
| ID-nummer | text | ja | Min. 5 tekens. Foutmelding: "ID-nummer is verplicht" / "ID-nummer moet minimaal 5 tekens zijn" |
| Voornaam | text | ja | Foutmelding: "Voornaam is verplicht" |
| Achternaam | text | ja | Foutmelding: "Achternaam is verplicht" |
| Geboortedatum | date | ja | Foutmelding: "Geboortedatum is verplicht" |
| Geslacht | select | ja | Opties: Man, Vrouw, Anders. Waarden: `male`, `female`, `other`. Foutmelding: "Geslacht is verplicht" |

---

### Stap 2 — Contact (Contactgegevens)

**Titel:** Contactgegevens  
**Omschrijving:** Hoe kunnen wij u bereiken over uw registratie?

| Veld | Type | Verplicht | Opties / Validatie |
|---|---|---|---|
| Telefoonnummer | text | ja | Min. 7 tekens. Foutmelding: "Telefoonnummer is verplicht" / "Telefoonnummer moet minimaal 7 cijfers zijn" |
| E-mailadres | email | ja | E-mail format validatie. Foutmelding: "E-mailadres is verplicht" / "Ongeldig e-mailadres" |

---

### Stap 3 — Woonsituatie (Huidige woonsituatie)

**Titel:** Huidige woonsituatie  
**Omschrijving:** Vertel ons over uw huidige woonsituatie.

| Veld | Type | Verplicht | Opties / Validatie |
|---|---|---|---|
| Huidig adres | text | ja | Min. 5 tekens. Foutmelding: "Adres is verplicht" / "Adres moet minimaal 5 tekens zijn" |
| District | select | ja | Opties: Paramaribo (`PAR`), Wanica (`WAA`), Nickerie (`NIC`), Coronie (`COR`), Saramacca (`SAR`), Commewijne (`COM`), Marowijne (`MAR`), Para (`PAB`), Brokopondo (`BRO`), Sipaliwini (`SIP`). Foutmelding: "District is verplicht" |
| Type woning | select | ja | Opties: Huis (`house`), Appartement (`apartment`), Kamer (`room`), Gedeelde woning (`shared`), Anders (`other`). Foutmelding: "Type woning is verplicht" |
| Maandelijkse huur (SRD) | text | nee | Helptekst: "Optioneel - indien u huurt" |
| Aantal bewoners | number | ja | Min: 1. Helptekst: "Inclusief uzelf". Foutmelding: "Aantal bewoners is verplicht" / "Er moet minimaal 1 bewoner zijn" |

---

### Stap 4 — Voorkeur (Woningvoorkeur)

**Titel:** Woningvoorkeur  
**Omschrijving:** In wat voor type woning bent u geïnteresseerd?

| Veld | Type | Verplicht | Opties / Validatie |
|---|---|---|---|
| Type interesse | select | ja | Opties: Huren (`rent`), Huurkoop (`rent_to_own`), Kopen (`purchase`). Foutmelding: "Selecteer uw type interesse" |
| Voorkeurdistrict | select | ja | Opties: Paramaribo (`PAR`), Wanica (`WAA`), Nickerie (`NIC`), Coronie (`COR`), Saramacca (`SAR`), Commewijne (`COM`), Marowijne (`MAR`), Para (`PAB`), Brokopondo (`BRO`), Sipaliwini (`SIP`). Foutmelding: "Selecteer uw voorkeurdistrict" |

**Info-tekst:** "Uw voorkeurdistrict wordt gebruikt voor toewijzingsprioriteit. Uiteindelijke toewijzing kan in een ander district zijn op basis van beschikbaarheid."

---

### Stap 5 — Reden (Reden voor aanvraag)

**Titel:** Reden voor aanvraag  
**Omschrijving:** Waarom vraagt u woningregistratie aan?

| Veld | Type | Verplicht | Opties / Validatie |
|---|---|---|---|
| Primaire reden | radio | ja | Opties: Momenteel zonder goede huisvesting (`no_housing`), Overbevolkte woonomstandigheden (`overcrowding`), Onveilige of ongezonde woning (`unsafe`), Getroffen door calamiteit/ramp (`calamity`), Dreigende uitzetting (`eviction`), Gezinsuitbreiding (`family_growth`), Andere reden (`other`). Foutmelding: "Selecteer een reden voor uw aanvraag" |

---

### Stap 6 — Inkomen (Inkomensgegevens)

**Titel:** Inkomensgegevens  
**Omschrijving:** Geef informatie over uw inkomen.

| Veld | Type | Verplicht | Opties / Validatie |
|---|---|---|---|
| Primaire inkomensbron | select | ja | Opties: In loondienst (`employment`), Zelfstandig ondernemer (`self_employed`), Pensioen (`pension`), Sociale bijstand (`social_assistance`), Werkloosheidsuitkering (`unemployment`), Anders (`other`), Geen inkomen (`none`). Foutmelding: "Selecteer uw inkomensbron" |
| Uw maandelijks inkomen (SRD) | text | nee | Helptekst: "Optioneel" |
| Maandelijks inkomen partner (SRD) | text | nee | Helptekst: "Optioneel - indien van toepassing" |

**Info-tekst:** "Inkomensgegevens worden gebruikt om geschiktheid voor verschillende huisvestingsprogramma's te bepalen. U kunt later worden gevraagd om inkomensbewijs te verstrekken."

---

### Stap 7 — Urgentie (Speciale behoeften & Urgentie)

**Titel:** Speciale behoeften & Urgentie  
**Omschrijving:** Heeft u speciale omstandigheden die dringende aandacht vereisen?

**Info-box:**

> Speciale omstandigheden kunnen uw positie op de wachtlijst beïnvloeden. Geef nauwkeurige informatie. Documentatie kan nodig zijn voor verificatie.

| Veld | Type | Verplicht | Opties / Validatie |
|---|---|---|---|
| Persoon met een beperking of speciale medische behoeften | checkbox | nee | Beschrijving: "U of een gezinslid heeft een beperking of medische aandoening die specifieke woningaanpassingen vereist." |
| Noodsituatie / Dringende situatie | checkbox | nee | Beschrijving: "U bevindt zich in een noodsituatie zoals dakloosheid, ontheemding door een ramp of dreigende uitzetting." |
| Geef details over uw situatie | textarea | nee* | *Conditioneel: verschijnt alleen als een van bovenstaande checkboxen is aangevinkt. Helptekst: "Deze informatie wordt beoordeeld om urgentieprioriteit te bepalen." |

---

### Stap 8 — Documenten (Documenten uploaden)

**Titel:** Documenten uploaden  
**Omschrijving:** Upload de vereiste documenten om door te gaan met uw registratie.

**Info-box:**

> **Documentvereisten**  
> Alle verplichte documenten moeten worden geüpload voordat u uw registratie kunt indienen. Ondersteunde bestandstypen: PDF, JPG, PNG. Maximale bestandsgrootte: 10MB per document.

**6 documentslots:**

| Document | Code | Verplicht |
|---|---|---|
| Kopie ID-bewijs | `ID_COPY` | ja |
| Bewijs van inkomen | `INCOME_PROOF` | ja |
| Bewijs van huidige woning adres (SWM, EBS, Telesur, Overeenkomst) | `RESIDENCE_PROOF` | ja |
| Gezinssamenstelling | `FAMILY_COMPOSITION` | nee |
| Medische verklaring | `MEDICAL_CERT` | nee |
| Bewijs noodsituatie | `EMERGENCY_PROOF` | nee |

**Upload-beperkingen:**

- Max. bestandsgrootte: 10MB
- Toegestane types: PDF, JPG, PNG
- Foutmeldingen: "Bestand te groot. Maximum is 10MB." / "Ongeldig bestandstype. Gebruik PDF, JPG of PNG."

**Blokkeer-tekst:** "Upload alle verplichte documenten om door te gaan"

---

### Stap 9 — Controleren (Controleer uw registratie)

**Titel:** Controleer uw registratie  
**Omschrijving:** Controleer alle informatie voordat u indient.

**Review-secties:**

1. **Persoonsgegevens** — ID-nummer, Voornaam, Achternaam, Geboortedatum, Geslacht
2. **Contactgegevens** — Telefoonnummer, E-mailadres
3. **Huidige woonsituatie** — Adres, District, Type woning, Maandelijkse huur, Bewoners
4. **Woningvoorkeur** — Type interesse, Voorkeurdistrict
5. **Aanvraaggegevens** — Reden, Inkomensbron, Uw inkomen, Inkomen partner
6. **Speciale behoeften & Urgentie** — Beperking (Ja/Nee), Noodsituatie (Ja/Nee), Details

**Waarheidsverklaring (checkbox, verplicht om in te dienen):**

> **Waarheidsverklaring**  
> Ik verklaar hierbij dat alle informatie in deze registratie naar waarheid en naar mijn beste weten is verstrekt. Ik begrijp dat het verstrekken van onjuiste informatie kan leiden tot verwijdering van de wachtlijst en mogelijke juridische consequenties.

**Knop:** "Registratie indienen" (uitgeschakeld totdat verklaring is geaccepteerd)

---

### Stap 10 — Receipt (Ontvangstbewijs)

**Titel:** Registratie succesvol ingediend  
**Omschrijving:** Uw woningregistratie is ingediend. Bewaar de onderstaande informatie.

**Weergegeven informatie:**

| Element | Beschrijving |
|---|---|
| Referentienummer | Formaat: WR-JJJJ-NNNNNN. Met kopieerknop. Helptekst: "Gebruik dit nummer om de status van uw registratie te volgen" |
| Beveiligingstoken | Wordt eenmaal getoond. Met kopieerknop. Waarschuwing: "Bewaar dit token veilig. U heeft zowel het referentienummer als dit token nodig om online de status van uw registratie te controleren. Dit token wordt slechts één keer getoond." |
| Ingediend op | Datum (lokale notatie) |
| Tijd | Tijdstip (lokale notatie) |

**Wat gebeurt er nu? (3 stappen):**

1. **Beoordeling registratie** — Uw registratie wordt geverifieerd door de afdeling huisvesting.
2. **Plaatsing op wachtlijst** — Na verificatie wordt u op de officiële wachtlijst geplaatst.
3. **Toewijzingsmelding** — U wordt gecontacteerd wanneer er huisvesting voor u beschikbaar komt.

**Actieknoppen:** Afdrukken, Status controleren, Terug naar home

---

## BIJLAGE: Gedeelde constanten

### Suriname Districten (10)

| Code | Naam |
|---|---|
| PAR | Paramaribo |
| WAA | Wanica |
| NIC | Nickerie |
| COR | Coronie |
| SAR | Saramacca |
| COM | Commewijne |
| MAR | Marowijne |
| PAB | Para |
| BRO | Brokopondo |
| SIP | Sipaliwini |

### Validatie foutmeldingen (gedeeld)

| Sleutel | Tekst |
|---|---|
| required | Dit veld is verplicht |
| invalidEmail | Ongeldig e-mailadres |
| invalidDate | Ongeldige datum |
| nationalIdRequired | ID-nummer is verplicht |
| nationalIdMinLength | ID-nummer moet minimaal 5 tekens zijn |
| firstNameRequired | Voornaam is verplicht |
| lastNameRequired | Achternaam is verplicht |
| dateOfBirthRequired | Geboortedatum is verplicht |
| genderRequired | Geslacht is verplicht |
| genderInvalid | Selecteer een geldig geslacht |
| phoneRequired | Telefoonnummer is verplicht |
| phoneMinLength | Telefoonnummer moet minimaal 7 cijfers zijn |
| emailRequired | E-mailadres is verplicht |
| addressRequired | Adres is verplicht |
| addressMinLength | Adres moet minimaal 5 tekens zijn |
| districtRequired | District is verplicht |
| householdSizeRequired | Gezinsgrootte is verplicht |
| householdSizeMin | Gezinsgrootte moet minimaal 1 zijn |
| householdSizeMax | Gezinsgrootte mag maximaal 20 zijn |
| applicationReasonRequired | Selecteer een reden voor uw aanvraag |
| housingTypeRequired | Type woning is verplicht |
| residentsRequired | Aantal bewoners is verplicht |
| residentsMin | Er moet minimaal 1 bewoner zijn |
| interestTypeRequired | Selecteer uw type interesse |
| preferredDistrictRequired | Selecteer uw voorkeurdistrict |
| incomeSourceRequired | Selecteer uw inkomensbron |
