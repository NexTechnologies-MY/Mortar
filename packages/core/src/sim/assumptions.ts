import type { Assumption, SourceTag } from '../types'

const a = (
  key: string,
  label: string,
  value: number,
  unit: string,
  tag: SourceTag,
  source: string,
  min: number,
  max: number,
  step: number
): Assumption => ({ key, label, value, unit, tag, source, min, max, step })

/** Every rate and threshold the generator, risk flag and stall rules use, with its source tag. */
export const DEFAULT_ASSUMPTIONS: Assumption[] = [
  // Loan pipeline
  a('submissionLagMaxDays', 'Submission After Booking', 1, 'days', 'assumption', 'Assumptions panel', 0, 10, 1),
  a(
    'approvalRate',
    'Approval Per Application',
    62,
    '%',
    'industry',
    'REHDA 2H2025 band 55–69%; BNM and ABM 2016–17 about 74% by number',
    40,
    85,
    1
  ),
  a(
    'approvalDsrStep',
    'Approval Penalty Per DSR Point',
    1.5,
    'pts',
    'assumption',
    'Assumptions panel; the forecast notes this is by construction',
    0,
    4,
    0.1
  ),
  a('missingDocumentRate', 'Submissions Missing A Document', 35, '%', 'assumption', 'Assumptions panel', 0, 80, 5),
  a('documentResponseMinDays', 'Document Turnaround, Fastest', 2, 'days', 'assumption', 'Assumptions panel', 1, 10, 1),
  a('documentResponseMaxDays', 'Document Turnaround, Slowest', 9, 'days', 'assumption', 'Assumptions panel', 3, 30, 1),
  a('slowDocumentRate', 'Document Loops Running Long', 25, '%', 'assumption', 'Assumptions panel', 0, 40, 1),
  a('decisionMinWorkDays', 'Bank Decision, Fastest', 2, 'working days', 'industry', 'ABM, Oct 2017', 1, 10, 1),
  a('decisionMaxWorkDays', 'Bank Decision, Slowest', 9, 'working days', 'industry', 'ABM, Oct 2017', 3, 20, 1),
  a('rejectionMinWorkDays', 'Bank Rejection, Fastest', 1, 'working days', 'industry', 'ABM, Oct 2017', 1, 5, 1),
  a('rejectionMaxWorkDays', 'Bank Rejection, Slowest', 2, 'working days', 'industry', 'ABM, Oct 2017', 1, 10, 1),
  a('slowDecisionRate', 'Decisions Running Past The Band', 40, '%', 'assumption', 'Assumptions panel', 0, 60, 5),
  a('slowDecisionExtraDays', 'Slow Decision Extra Wait', 20, 'days', 'assumption', 'Assumptions panel', 3, 40, 1),
  a(
    'secondApplicationRate',
    'Second Bank After A Rejection',
    55,
    '%',
    'assumption',
    'Assumptions panel; bookings carry one to three applications',
    0,
    100,
    5
  ),
  a('thirdApplicationRate', 'Third Bank After Two Rejections', 35, '%', 'assumption', 'Assumptions panel', 0, 100, 5),
  a(
    'rejectedCancelRate',
    'Cancelled After Final Rejection',
    75,
    '%',
    'assumption',
    'Assumptions panel; refund policy is developer-set',
    0,
    100,
    5
  ),
  a('retryLagMaxDays', 'Resubmission Delay', 7, 'days', 'assumption', 'Assumptions panel', 1, 21, 1),
  // Buyer behaviour
  a('hesitationRate', 'Buyers Showing Hesitation', 20, '%', 'assumption', 'Assumptions panel', 0, 50, 1),
  a('hesitantColdRate', 'Hesitant Buyers Going Cold', 50, '%', 'assumption', 'Assumptions panel', 0, 80, 5),
  a(
    'withdrawalRate',
    'Buyers Withdrawing',
    8,
    '%',
    'survey',
    'Practitioner survey, n = 5: withdrawal named top-three by 4 of 5',
    0,
    30,
    1
  ),
  a('withdrawalLagMaxDays', 'Withdrawal After Hesitation', 12, 'days', 'assumption', 'Assumptions panel', 1, 30, 1),
  a('lapsedMinDays', 'Booking Lapses After', 45, 'days', 'assumption', 'Developer policy placeholder', 30, 120, 5),
  a('lapsedMaxDays', 'Booking Lapses By', 95, 'days', 'assumption', 'Developer policy placeholder', 45, 180, 5),
  a('contactedRate', 'Bookings With Contact Updates', 28, '%', 'assumption', 'Assumptions panel', 0, 100, 5),
  a('provisionalRate', 'Recent Events Awaiting Review', 4, '%', 'assumption', 'Assumptions panel', 0, 20, 1),
  a('disputedRate', 'Events Under Dispute', 3, '%', 'assumption', 'Assumptions panel', 0, 5, 0.1),
  // Valuation and legal
  a(
    'valuationShortfallRate',
    'Valuations Below Price',
    8,
    '%',
    'survey',
    'Practitioner survey, n = 5: named top-three by 2 of 5',
    0,
    30,
    1
  ),
  a('valuationDelayMaxDays', 'Shortfall Renegotiation Delay', 6, 'days', 'assumption', 'Assumptions panel', 1, 30, 1),
  a(
    'spaAppointmentMinDays',
    'SPA Appointment Lead, Fastest',
    1,
    'days',
    'anecdotal',
    'Buyer guides: booking to SPA typically 14–21 days',
    1,
    14,
    1
  ),
  a('spaAppointmentMaxDays', 'SPA Appointment Lead, Slowest', 5, 'days', 'anecdotal', 'Buyer guides', 2, 21, 1),
  a('slowSpaRate', 'SPA Scheduling Running Long', 18, '%', 'assumption', 'Assumptions panel', 0, 60, 5),
  a('slowSpaExtraDays', 'Slow SPA Extra Wait', 16, 'days', 'assumption', 'Assumptions panel', 4, 30, 1),
  a('signingLagMinDays', 'Appointment To Signing, Fastest', 2, 'days', 'anecdotal', 'Buyer guides', 1, 14, 1),
  a('signingLagMaxDays', 'Appointment To Signing, Slowest', 7, 'days', 'anecdotal', 'Buyer guides', 3, 30, 1),
  a('loanAgreementLagMaxDays', 'Loan Agreement After SPA', 10, 'days', 'assumption', 'Assumptions panel', 2, 30, 1),
  a('disbursementMinDays', 'Disbursement, Fastest', 15, 'days', 'assumption', 'Assumptions panel', 5, 45, 1),
  a('disbursementMaxDays', 'Disbursement, Slowest', 45, 'days', 'assumption', 'Assumptions panel', 15, 120, 5),
  a('cancelLagMaxDays', 'Cancellation Processing', 3, 'days', 'assumption', 'Assumptions panel', 0, 14, 1),
  // Financing risk
  a(
    'marginOfFinancingCap',
    'Margin Of Financing Cap',
    90,
    '%',
    'industry',
    'Press practice; about 90% before the third home',
    70,
    100,
    1
  ),
  a('marginOfFinancingThirdHome', 'Margin Cap, Third Home On', 70, '%', 'official', 'BNM, Nov 2010', 50, 90, 1),
  a('interestRateAnnual', 'Loan Interest Rate', 4.2, '% p.a.', 'assumption', 'Assumptions panel', 3, 8, 0.05),
  a('maxTenureYears', 'Maximum Loan Tenure', 35, 'years', 'official', 'BNM, Jul 2013', 20, 35, 1),
  a('tenureAgeCap', 'Tenure Age Cap', 70, 'years', 'assumption', 'Assumptions panel', 55, 75, 1),
  a(
    'dsrCap',
    'Debt Service Ratio Cap',
    40,
    '%',
    'industry',
    'ABM, 2017: instalments at most 40% of gross income',
    25,
    70,
    1
  ),
  a('dsrMediumBand', 'Medium Band Below Cap', 5, 'pts', 'assumption', 'Assumptions panel', 0, 15, 1),
  // Evidence and stalls
  a('unknownAfterDays', 'Unknown After', 10, 'days', 'assumption', 'Assumptions panel', 5, 21, 1),
  a('staleEvidenceDays', 'Stall: No Update For', 7, 'days', 'assumption', 'Assumptions panel', 3, 14, 1),
  a(
    'documentStallDays',
    'Stall: Document Still Outstanding After',
    5,
    'days',
    'assumption',
    'Assumptions panel',
    2,
    14,
    1
  ),
  a(
    'undecidedStallWorkDays',
    'Stall: Bank Has Not Decided After',
    9,
    'working days',
    'industry',
    'ABM, Oct 2017: 2–9 working days',
    5,
    15,
    1
  )
]

/** The value for `key`, falling back to the default entry when the list omits it. */
export function assumptionValue(assumptions: Assumption[], key: string): number {
  const found = assumptions.find((x) => x.key === key) ?? DEFAULT_ASSUMPTIONS.find((x) => x.key === key)
  if (!found) throw new Error(`Unknown assumption "${key}"`)
  return found.value
}
