import type { Buyer } from '../types'
import type { Rng } from './random'
import { monthlyInstalment } from './risk'

/** Hand-written fictional names, banks, firms and project. No real people or companies. */

const MALAY_NAMES = [
  'Ahmad Farid',
  'Nurul Syafiqah',
  'Mohd Hafiz',
  'Siti Aminah',
  'Muhammad Danial',
  'Nur Aisyah',
  'Faiz Rahman',
  'Hidayat Osman',
  'Intan Suraya',
  'Kamal Ariffin',
  'Liyana Zainal',
  'Syafiq Hamid',
  'Nora Karim',
  'Azlan Musa',
  'Rina Yusof',
  'Hakim Jalil',
  'Salmah Idris',
  'Zulaikha Noor'
] as const

const CHINESE_NAMES = [
  'Lim Wei Lun',
  'Chan Kah Mun',
  'Ng Su Lin',
  'Teo Jia Wei',
  'Ooi Beng Huat',
  'Chong Mei Yee',
  'Lau Tze Kin',
  'Yeoh Pei Shan',
  'Goh Jun Jie',
  'Tan Su Ming',
  'Lee Kar Yan',
  'Wong Zhi Xuan',
  'Chin Wai Kit',
  'Loh Pui Yee',
  'Yap Soon Hin',
  'Chew Ai Ling',
  'Kok Jia Min',
  'Foong Mei Kuan'
] as const

const INDIAN_NAMES = [
  'Suresh Kumar',
  'Kavitha Rao',
  'Dinesh Pillai',
  'Priya Nair',
  'Rajesh Menon',
  'Anita Devi',
  'Vikram Singh',
  'Meena Krishnan',
  'Arun Prakash',
  'Shanti Raman',
  'Mohan Das',
  'Divya Subramaniam',
  'Kiran Naidu',
  'Lakshmi Venkat',
  'Ravi Chandran',
  'Nisha Govind'
] as const

const SALES_AGENTS = ['Farah Izzati', 'Kelvin Chow', 'Dinesh Rao', 'Mei Xuan', 'Hafiz Rahman', 'Jocelyn Ng'] as const

export const BANKS = [
  'Sri Muda Bank',
  'Perdana Mutual Bank',
  'Ria Nasional Bank',
  'Amanah Commerce Bank',
  'Cahaya Islamic Bank',
  'Selatan Savings Bank'
] as const

const BANKERS = [
  'Roslan Ahmad',
  'Vivian Tan',
  'Kumar Selvam',
  'Aishah Rahman',
  'Marcus Lee',
  'Devi Nair',
  'Farid Zainal',
  'Grace Ooi',
  'Hema Pillai',
  'Aziz Hamid',
  'Sharon Ng',
  'Rahim Osman'
] as const

export const LAW_FIRMS = [
  'Wong Rahman Chambers',
  'Devan & Partners',
  'Kuan & Teh Advocates',
  'Lim Yap & Associates'
] as const

const SOLICITORS = ['Audrey Lim', 'S. Devan', 'Rachel Kuan', 'Jason Teh', 'Priya Raman', 'Kelvin Yap'] as const

export const PROJECT_NAME = 'Residensi Cahaya Muda'

export function pickSalesAgent(rng: Rng): string {
  return rng.pick(SALES_AGENTS)
}

export function pickBank(rng: Rng): string {
  return rng.pick(BANKS)
}

export function pickBanker(rng: Rng): string {
  return rng.pick(BANKERS)
}

export function pickLawFirm(rng: Rng): string {
  return rng.pick(LAW_FIRMS)
}

export function pickSolicitor(rng: Rng): string {
  return rng.pick(SOLICITORS)
}

export function pickBuyerName(rng: Rng): string {
  const roll = rng.next()
  if (roll < 0.55) return rng.pick(MALAY_NAMES)
  if (roll < 0.85) return rng.pick(CHINESE_NAMES)
  return rng.pick(INDIAN_NAMES)
}

const round50 = (x: number) => Math.round(x / 50) * 50
const clamp = (lo: number, hi: number, x: number) => Math.min(hi, Math.max(lo, x))

function drawPropertiesOwned(rng: Rng, age: number): number {
  const roll = rng.next()
  if (age < 30) return roll < 0.92 ? 0 : 1
  if (age < 45) return roll < 0.7 ? 0 : roll < 0.9 ? 1 : roll < 0.98 ? 2 : 3
  return roll < 0.55 ? 0 : roll < 0.8 ? 1 : roll < 0.92 ? 2 : 3
}

/**
 * A buyer whose income roughly supports the loan, with a stressed tail so the
 * financing-risk flag carries signal. Identifiers are obviously fake by contract.
 */
export function drawBuyer(rng: Rng, seq: number, priceRm: number, value: (key: string) => number): Buyer {
  const name = pickBuyerName(rng)
  const age = 24 + Math.floor(rng.next() * rng.next() * 34) + rng.int(0, 4)
  const propertiesOwned = drawPropertiesOwned(rng, age)
  const margin = propertiesOwned >= 2 ? value('marginOfFinancingThirdHome') : value('marginOfFinancingCap')
  const loan = (priceRm * margin) / 100
  const years = Math.max(1, Math.min(value('maxTenureYears'), value('tenureAgeCap') - age))
  const instalment = monthlyInstalment(loan, value('interestRateAnnual'), years)
  const stressed = rng.chance(0.18)
  const instalmentShare = stressed ? 0.32 + rng.next() * 0.25 : Math.max(0.06, rng.gaussian(0.18, 0.06))
  const income = clamp(3000, 30000, round50(instalment / instalmentShare))
  const commitments = round50(income * (0.05 + rng.next() * 0.2))
  return {
    name,
    ic: `000000-00-${String(seq).padStart(4, '0')}`,
    phone: `+60 00-000 ${String(seq).padStart(4, '0')}`,
    age,
    grossMonthlyIncomeRm: income,
    monthlyCommitmentsRm: commitments,
    propertiesOwned
  }
}
