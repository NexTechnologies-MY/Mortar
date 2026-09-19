import type { Assumption, Booking, FinancingRisk } from '../types'
import { assumptionValue, DEFAULT_ASSUMPTIONS } from './assumptions'

/** Monthly instalment by annuity at `annualRatePct` over `years`. */
export function monthlyInstalment(loanRm: number, annualRatePct: number, years: number): number {
  const r = annualRatePct / 1200
  const n = Math.max(1, Math.round(years * 12))
  if (r === 0) return loanRm / n
  return (loanRm * r) / (1 - Math.pow(1 + r, -n))
}

export interface RiskInputs {
  priceRm: number
  age: number
  grossMonthlyIncomeRm: number
  monthlyCommitmentsRm: number
  propertiesOwned: number
}

/**
 * Debt service ratio against the 40% cap. `value` reads assumption values so
 * the generator (option overrides) and the case summary (panel list) share it.
 */
export function computeFinancingRisk(input: RiskInputs, value: (key: string) => number): FinancingRisk {
  const thirdHome = input.propertiesOwned >= 2
  const margin = thirdHome ? value('marginOfFinancingThirdHome') : value('marginOfFinancingCap')
  const loanRm = Math.round((input.priceRm * margin) / 100)
  const years = Math.max(1, Math.min(value('maxTenureYears'), value('tenureAgeCap') - input.age))
  const instalmentRm = Math.round(monthlyInstalment(loanRm, value('interestRateAnnual'), years))
  const income = input.grossMonthlyIncomeRm
  const debtServiceRatio = income > 0 ? (input.monthlyCommitmentsRm + instalmentRm) / income : Number.POSITIVE_INFINITY
  const cap = value('dsrCap') / 100
  const band = value('dsrMediumBand') / 100
  const level = debtServiceRatio > cap ? 'high' : debtServiceRatio > cap - band ? 'medium' : 'low'
  const pct = Math.round(debtServiceRatio * 100)
  const capPct = Math.round(cap * 100)
  const reasons: string[] = []
  if (level === 'high') reasons.push(`Debt Service Ratio ${pct}% Exceeds ${capPct}% Cap`)
  else if (level === 'medium') reasons.push(`Debt Service Ratio ${pct}% Within ${Math.round(band * 100)} Points Of Cap`)
  else reasons.push(`Debt Service Ratio ${pct}% Within Cap`)
  if (thirdHome) reasons.push(`Margin Capped At ${Math.round(margin)}% From Third Home`)
  if (years < value('maxTenureYears')) reasons.push(`Tenure Shortened To ${years} Years At Age ${input.age}`)
  return {
    level,
    loanRm,
    instalmentRm,
    debtServiceRatio,
    marginOfFinancing: margin / 100,
    reasons
  }
}

export function financingRiskFor(booking: Booking, assumptions: Assumption[] = DEFAULT_ASSUMPTIONS): FinancingRisk {
  const value = (key: string) => assumptionValue(assumptions, key)
  return computeFinancingRisk(
    {
      priceRm: booking.priceRm,
      age: booking.buyer.age,
      grossMonthlyIncomeRm: booking.buyer.grossMonthlyIncomeRm,
      monthlyCommitmentsRm: booking.buyer.monthlyCommitmentsRm,
      propertiesOwned: booking.buyer.propertiesOwned
    },
    value
  )
}
