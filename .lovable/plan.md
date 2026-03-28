

# Plan: Create Wizard Field Contract Documentation

## Objective
Create `public/wizard-field-contract.md` — a read-only documentation file extracting all wizard step and field data from both wizards.

## Source Data (Verified)
All data extracted from:
- `src/i18n/locales/nl.json` (exact NL labels)
- Step components for both wizards (field types, validation, structure)
- `src/config/documentRequirements.ts` (document lists)
- `src/constants/districts.ts` (10 Suriname districts)
- Constants files for both wizards (select options)

## File to Create
**`public/wizard-field-contract.md`**

Single markdown file containing:

### BOUWSUBSIDIE WIZARD — 9 stappen
1. **Stap 0 — Introductie**: Full mededeling text (including policy exclusion notice), 4 requirements, 3 documents with note, acknowledgement checkbox text
2. **Stap 1 — Gegevens**: 5 fields (ID-nummer, Voornaam, Achternaam, Geboortedatum, Geslacht) with validation rules
3. **Stap 2 — Contact**: 2 fields (Telefoonnummer, E-mailadres) with validation
4. **Stap 3 — Gezin**: 2 main fields (Gezinsgrootte, Afhankelijken) + dynamic children table (Leeftijd, Geslacht, Beperking)
5. **Stap 4 — Adres**: 3 fields (Straatnaam, District [10 options], Ressort [optional])
6. **Stap 5 — Aanvraag**: 3 fields (Reden [5 options], Geschat bedrag, Calamiteit checkbox) + conditional warning
7. **Stap 6 — Documenten**: 14 document slots (2 mandatory, 4 income-group-mandatory, 8 optional) + 3-item checklist
8. **Stap 7 — Controleren**: Review sections + declaration checkbox with full text
9. **Stap 8 — Receipt**: Reference number, security token, submission details, 3 next steps

### WONINGREGISTRATIE WIZARD — 11 stappen
1. **Stap 0 — Introductie**: About text, 4 requirements, 3 documents with note, acknowledgement checkbox
2. **Stap 1 — Gegevens**: 5 fields (same pattern as Bouwsubsidie)
3. **Stap 2 — Contact**: 2 fields
4. **Stap 3 — Woonsituatie**: 5 fields (Adres, District, Type woning [5 options], Huur, Bewoners)
5. **Stap 4 — Voorkeur**: 2 fields (Type interesse [3 options], Voorkeurdistrict) + info note
6. **Stap 5 — Reden**: 1 field (radio group, 7 options)
7. **Stap 6 — Inkomen**: 3 fields (Inkomensbron [7 options], Uw inkomen, Partner inkomen) + info note
8. **Stap 7 — Urgentie**: 2 checkboxes + conditional textarea + info box
9. **Stap 8 — Documenten**: 6 document slots (3 mandatory, 3 optional)
10. **Stap 9 — Controleren**: Review sections + declaration checkbox with full text
11. **Stap 10 — Receipt**: Reference number, security token, 3 next steps

## Constraints
- Read-only task — no existing files modified
- All text extracted verbatim from nl.json translations
- All select options listed with exact NL labels
- All validation rules documented from yup schemas

