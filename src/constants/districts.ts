/**
 * Suriname Districts
 * Used for dropdown selections in public wizards
 */
export const DISTRICTS = [
  { code: 'PAR', name: 'Paramaribo' },
  { code: 'WAA', name: 'Wanica' },
  { code: 'NIC', name: 'Nickerie' },
  { code: 'COR', name: 'Coronie' },
  { code: 'SAR', name: 'Saramacca' },
  { code: 'COM', name: 'Commewijne' },
  { code: 'MAR', name: 'Marowijne' },
  { code: 'PAB', name: 'Para' },
  { code: 'BRO', name: 'Brokopondo' },
  { code: 'SIP', name: 'Sipaliwini' },
] as const

export type DistrictCode = typeof DISTRICTS[number]['code']
