-- DEFECT-001: Fix gender constraint from ('M','V') to ('M','F')
ALTER TABLE public.subsidy_household_child
  DROP CONSTRAINT IF EXISTS subsidy_household_child_gender_check;

ALTER TABLE public.subsidy_household_child
  ADD CONSTRAINT subsidy_household_child_gender_check
  CHECK (gender IN ('M', 'F'));