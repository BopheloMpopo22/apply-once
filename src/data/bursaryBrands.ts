/** Popular South African bursary / funding brands for the application marquee. */
export type BursaryBrand = {
  id: string
  name: string
  abbr: string
  color: string
}

export const BURSARY_BRANDS: BursaryBrand[] = [
  { id: 'nsfas', name: 'NSFAS', abbr: 'NS', color: '#c41e3a' },
  { id: 'sasol', name: 'Sasol', abbr: 'Sa', color: '#0033a0' },
  { id: 'investec', name: 'Investec', abbr: 'In', color: '#1a1a1a' },
  { id: 'absa', name: 'Absa', abbr: 'Ab', color: '#af1685' },
  { id: 'nedbank', name: 'Nedbank', abbr: 'Ne', color: '#007a4d' },
  { id: 'standard-bank', name: 'Standard Bank', abbr: 'SB', color: '#0033a0' },
  { id: 'fnb', name: 'FNB', abbr: 'FN', color: '#009639' },
  { id: 'shoprite', name: 'Shoprite', abbr: 'Sh', color: '#e31837' },
  { id: 'old-mutual', name: 'Old Mutual', abbr: 'OM', color: '#00a651' },
  { id: 'allan-gray', name: 'Allan Gray', abbr: 'AG', color: '#2d2d2d' },
  { id: 'funza-lushaka', name: 'Funza Lushaka', abbr: 'FL', color: '#5b21b6' },
  { id: 'nyda', name: 'NYDA', abbr: 'NY', color: '#ea580c' },
  { id: 'eskom', name: 'Eskom', abbr: 'Es', color: '#0ea5e9' },
  { id: 'transnet', name: 'Transnet', abbr: 'Tr', color: '#0369a1' },
  { id: 'thuthuka', name: 'Thuthuka (SAICA)', abbr: 'Th', color: '#7c3aed' },
]
