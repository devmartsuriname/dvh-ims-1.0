# Phase 9E-b — Housing Registration Terminology Fix: "Handicap" → "Beperking"

## Scope

4 text updates across 2 files. Copy-only, zero logic impact.

## Changes

### `src/i18n/locales/nl.json`


| Line | Key                           | Old                                               | New                                                        |
| ---- | ----------------------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| 177  | `step7.disability`            | "Handicap of speciale medische behoeften"         | "Persoon met een beperking of speciale medische behoeften" |
| 178  | `step7.disabilityDescription` | "...heeft een handicap of medische aandoening..." | "...heeft een beperking of medische aandoening..."         |
| 214  | `step8.labelDisability`       | "Handicap"                                        | "Beperking"                                                |


### `src/i18n/locales/en.json`


| Line | Key                     | Old                                   | New                                                         |
| ---- | ----------------------- | ------------------------------------- | ----------------------------------------------------------- |
| 177  | `step7.disability`      | "Disability or Special Medical Needs" | "Person with a disability or special medical needs"         |
| 214  | `step8.labelDisability` | "Disability"                          | "Disability" (no change needed — EN is already appropriate) |


NOTE — Optional wording improvement (Dutch)

For formal government communication, the phrase

"Persoon met een beperking of speciale medische behoeften"

may be improved stylistically to:

"Persoon met een beperking of een speciale medische aandoening"

Reason:

The term "aandoening" aligns better with formal medical terminology

commonly used in official communication, while "behoeften" can sound

more social-care oriented.

This is a stylistic refinement only and has no impact on logic,

validation, database schema, or wizard workflow.

Implementation is optional and may be applied if preferred by the DVH team.  
  
No component, config, validation, schema, or Edge Function changes required. The step component (`Step7Urgency.tsx`) renders these via `t('housing.step7.disability')` — automatic pickup. The review step uses `t('housing.step8.labelDisability')` — also automatic.

Note: Other uses of "disability"/"beperking" in the codebase (child disability fields at lines 405, 478) already use "beperking" and are unaffected.