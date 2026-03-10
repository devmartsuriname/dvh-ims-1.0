# Terminology Update: "Bewijs van huidige woning" → "Bewijs van huidige woning adres (SWM, Telesur, Overeenkomst)"

## Scope

Single i18n text update in 2 files. Copy-only, zero logic impact.

## Changes

### `src/i18n/locales/nl.json`

- Line 290: `"docResidenceProof"`: `"Bewijs van huidige woning"` → `"Bewijs van huidige woning adres (SWM, EBS, Telesur, Overeenkomst)"`

### `src/i18n/locales/en.json`

- Line 107: `"doc3"`: `"Proof of current residence (required)"` → `"Proof of current residence address — SWM, Telesur, Agreement (required)"`
- Line 290: `"docResidenceProof"`: `"Proof of Current Residence"` → `"Proof of current residence address (SWM, Telesur, Agreement)"`

No component, config, or validation changes needed — the label is rendered via `t()`.