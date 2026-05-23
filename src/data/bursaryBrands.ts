/** Popular South African bursary / funding brands for the application marquee. */
export type BursaryBrand = {
  id: string
  name: string
  abbr: string
  color: string
  logo: string
}

export const BURSARY_BRANDS: BursaryBrand[] = [
  { id: 'nsfas', name: 'NSFAS', abbr: 'NS', color: '#c41e3a', logo: '/bursaries/nsfas.png' },
  { id: 'sasol', name: 'Sasol', abbr: 'Sa', color: '#0033a0', logo: '/bursaries/sasol.png' },
  { id: 'investec', name: 'Investec', abbr: 'In', color: '#1a1a1a', logo: '/bursaries/investec.svg' },
  { id: 'absa', name: 'Absa', abbr: 'Ab', color: '#af1685', logo: '/bursaries/absa.png' },
  { id: 'nedbank', name: 'Nedbank', abbr: 'Ne', color: '#007a4d', logo: '/bursaries/nedbank.jpg' },
  {
    id: 'standard-bank',
    name: 'Standard Bank',
    abbr: 'SB',
    color: '#0033a0',
    logo: '/bursaries/standard-bank.png',
  },
  { id: 'fnb', name: 'FNB', abbr: 'FN', color: '#009639', logo: '/bursaries/fnb.png' },
  { id: 'shoprite', name: 'Shoprite', abbr: 'Sh', color: '#e31837', logo: '/bursaries/shoprite.png' },
  { id: 'old-mutual', name: 'Old Mutual', abbr: 'OM', color: '#00a651', logo: '/bursaries/old-mutual.png' },
  { id: 'allan-gray', name: 'Allan Gray', abbr: 'AG', color: '#2d2d2d', logo: '/bursaries/allan-gray.png' },
  {
    id: 'funza-lushaka',
    name: 'Funza Lushaka',
    abbr: 'FL',
    color: '#5b21b6',
    logo: '/bursaries/funza-lushaka.png',
  },
  { id: 'nyda', name: 'NYDA', abbr: 'NY', color: '#ea580c', logo: '/bursaries/nyda.png' },
  { id: 'eskom', name: 'Eskom', abbr: 'Es', color: '#0ea5e9', logo: '/bursaries/eskom.png' },
  { id: 'transnet', name: 'Transnet', abbr: 'Tr', color: '#0369a1', logo: '/bursaries/transnet.png' },
  {
    id: 'thuthuka',
    name: 'Thuthuka (SAICA)',
    abbr: 'Th',
    color: '#7c3aed',
    logo: '/bursaries/thuthuka.png',
  },
]
