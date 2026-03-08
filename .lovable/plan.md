

# Remove Folder Icon from "Benodigde documenten" Heading

## Fix

Remove the `<IconifyIcon icon="mingcute:folder-line" />` from the `<h6>` heading in both:

1. `src/app/(public)/bouwsubsidie/apply/steps/Step0Introduction.tsx` (line 102)
2. `src/app/(public)/housing/register/steps/Step0Introduction.tsx` (same pattern)

The heading will remain as plain text without the folder icon prefix.

**1 line removed per file. No functional changes.**

