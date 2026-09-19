import type { Playbook } from '../types'

/** Reviewed staff playbooks in the concept's knowledge-record shape (lane W4). */
export const PLAYBOOKS: Playbook[] = [
  {
    id: 'PB-001',
    title: "Missing Income Documents: Securing Latest Three Months' Payslips",
    situation:
      'Panel bank credit assessment stalled because applicant submitted fewer than three consecutive months of recent payslips or the latest month is missing.',
    evidence:
      'Case BK-8812 communication log; Apex Bank credit clarification notice requesting June payslip before formal DSR scoring.',
    action:
      'Sales Admin contacts buyer directly via WhatsApp with exact month required and requests digital PDF from company HR portal within 24 hours, alerting banker immediately upon receipt.',
    rationale:
      'Salaried buyers usually have immediate mobile access to employer HR e-slips; requesting via Sales maintains purchase momentum compared to passive bank requests.',
    limits:
      'Only applies to fixed-salary employment; commission earners or gig workers require six months plus corresponding bank statements and cannot use this expedited path.',
    outcome:
      'Payslip received within 18 hours, forwarded to credit officer, and conditional approval secured 2 days later on 2026-06-15.',
    author: 'Tan Mei Ling',
    reviewer: 'Nurul Aina',
    reviewedOn: '2026-07-02',
    status: 'approved',
    tags: [
      'slip gaji',
      'payslip',
      'gaji',
      'income documents',
      'salary slip',
      'surat pengesahan majikan',
      'documents requested',
      'credit assessment',
      'dokumen pendapatan',
      'tunggakan'
    ]
  },
  {
    id: 'PB-002',
    title: 'Incomplete Bank Statements: Uncertified E-Statements and Missing Transaction Pages',
    situation:
      'Bank underwriter rejects downloaded e-statements because running page numbers are missing or transaction narration lacks employer name matching payslips.',
    evidence:
      'Case BK-8740 credit query log; Malayan Trust Bank document rejection notification citing missing page 3 of 5.',
    action:
      'Guide buyer to generate full-month e-statement PDF via online banking web portal rather than mobile screenshot, ensuring full account holder name and account number appear on each page.',
    rationale:
      'Underwriters require continuous chronological transaction balance verification to rule out undisclosed credit facilities or bounced direct debits.',
    limits:
      'If salary is paid in cash or via cheque deposit with irregular timing, the banker requires EPF statement cross-reference; online bank statements alone will not suffice.',
    outcome: 'Complete 3-month statement submitted within 36 hours; case cleared for scoring on 2026-05-21.',
    author: 'Tan Mei Ling',
    reviewer: 'Arvind Raj',
    reviewedOn: '2026-06-10',
    status: 'approved',
    tags: [
      'penyata bank',
      'bank statement',
      'e-statement',
      'transaksi',
      'salary crediting',
      'penyata akaun',
      'missing pages'
    ]
  },
  {
    id: 'PB-003',
    title: 'Variable Income Verification: Commission and Overtime Averaging Over Six Months',
    situation:
      'Salaried applicant relies on overtime allowances, bonuses, or sales commissions to meet debt service ratio criteria, but only three months of payslips were provided.',
    evidence:
      'Case BK-8904 credit assessment memo; Crestline Bank policy circular PB-2025/08 on variable income recognition.',
    action:
      'Request six consecutive months of payslips and matching bank statements, calculating a conservative 6-month average allowance haircutted at 80% per panel bank guidelines.',
    rationale:
      'Bank credit models classify non-basic allowances as variable income, requiring 6 months history to demonstrate sustainable repayment ability.',
    limits:
      'If employment tenure in current sales role is less than 6 months, variable income cannot be recognized by panel banks; joint applicant or guarantor is mandatory.',
    outcome: 'Six months documentation compiled in 48 hours; approved at 85% margin on 2026-08-04.',
    author: 'Farhan Malik',
    reviewer: 'Tan Mei Ling',
    reviewedOn: '2026-08-15',
    status: 'approved',
    tags: ['komisen', 'elaun', 'overtime', 'OT', 'variable income', 'gaji bersih', 'pendapatan berubah']
  },
  {
    id: 'PB-004',
    title: 'First Bank DSR Rejection: Immediate Parallel Submission to Alternative Panel Bank',
    situation:
      'First panel bank declines loan due to internal debt service ratio scoring threshold, but applicant credit history in CCRIS is clear of default.',
    evidence: 'Case BK-8855 loan rejection letter from Malayan Trust Bank citing internal debt risk scoring.',
    action:
      'Immediately package existing verified documentation and submit parallel application to second panel bank with higher allowable DSR band.',
    rationale:
      'Different commercial banks operate distinct credit assessment models and risk appetite; a single bank rejection does not preclude approval elsewhere.',
    limits:
      'Do not submit to second bank if rejection was caused by CCRIS delinquency, bankruptcy search hit, or dishonoured cheques; must rectify root credit issue first.',
    outcome: 'Second application to Crestline Bank approved at 90% margin within 5 working days on 2026-07-17.',
    author: 'Tan Mei Ling',
    reviewer: 'Nurul Aina',
    reviewedOn: '2026-07-25',
    status: 'approved',
    tags: [
      'second bank',
      'bank reject',
      'tolak pinjaman',
      'alternative bank',
      'DSR fail',
      'panel bank',
      'permohonan kedua'
    ]
  },
  {
    id: 'PB-005',
    title: 'Joint Applicant Restructuring: Adding Spouse or Immediate Family Member',
    situation:
      'Single applicant fails bank DSR threshold by 5 to 15 percentage points, but household income is sufficient to service instalment.',
    evidence: 'Case BK-8792 credit committee conditional rejection notice suggesting joint borrower.',
    action:
      'Restructure application to include spouse, parent, or sibling as joint borrower; collect IC, 3 months payslips, EPF statement, and CCRIS consent form within 3 days.',
    rationale:
      'Combining incomes reduces aggregate debt service ratio below 40% while preserving original unit booking and promotional rebate package.',
    limits:
      'Joint applicants must be immediate family members under Malaysian banking rules; friends or non-family partners are not accepted by panel banks without developer indemnities.',
    outcome: 'Restructured joint application approved by Perdana Bank on 2026-06-14; SPA signed on 2026-06-25.',
    author: 'Chloe Tan',
    reviewer: 'Tan Mei Ling',
    reviewedOn: '2026-07-01',
    status: 'approved',
    tags: ['joint applicant', 'nama bersama', 'suami isteri', 'gabung gaji', 'combined income', 'DSR', 'penjamin']
  },
  {
    id: 'PB-006',
    title: 'Pre-Emptive Dual Bank Submission for Borderline Income Profiles',
    situation:
      "Booking taken for unit above RM600,000 where buyer's initial DSR falls between 35% and 40%, leaving zero buffer for interest rate stress-testing.",
    evidence:
      'Case BK-8650 processing analysis; internal conversion risk audit showing 42% failure rate when relying on single bank submission for borderline cases.',
    action:
      'Obtain signed application forms and two sets of certified documents at sales gallery, submitting concurrently to two panel banks with contrasting underwriting criteria.',
    rationale:
      'Concurrent submission saves 10 to 14 days of sequential turnaround time if primary bank rejects, avoiding booking lapse.',
    limits:
      'Only permissible with buyer prior written consent; excessive simultaneous CCRIS inquiries within 30 days can depress automated bank credit scores.',
    outcome:
      'Applied to Malayan Trust and Apex Bank; Apex approved on day 6 while Malayan Trust requested additional guarantor, saving 2 weeks.',
    author: 'Tan Mei Ling',
    reviewer: 'Nurul Aina',
    reviewedOn: '2026-05-15',
    status: 'approved',
    tags: ['dual submission', 'dua bank', 'permohonan serentak', 'borderline DSR', 'fast track', 'panel banker']
  },
  {
    id: 'PB-007',
    title: 'Valuation Shortfall: Buyer Cash Top-Up Protocol and Differential Sum Scheduling',
    situation:
      'Bank appointed valuer assesses unit below the SPA purchase price, reducing maximum allowable 90% loan disbursement and creating a funding gap.',
    evidence: 'Case BK-8921 valuation report by Jurukur Bersatu valuing unit at RM450,000 against SPA RM480,000.',
    action:
      'Calculate exact shortfall amount, issue official differential sum breakdown to buyer, and establish staged downpayment schedule aligned with construction stages.',
    rationale:
      'Transparent schedule of payments prevents buyer panic and demonstrates that shortfall does not need to be settled in one lump sum prior to SPA execution.',
    limits:
      'If shortfall exceeds 15% of purchase price (over RM75,000), buyer top-up failure rate exceeds 80%; developer must consider unit swap or price appeal before proceeding.',
    outcome: 'Buyer agreed to 3-month staged cash top-up of RM27,000; SPA executed on 2026-08-28.',
    author: 'Farhan Malik',
    reviewer: 'Arvind Raj',
    reviewedOn: '2026-08-30',
    status: 'approved',
    tags: [
      'penilaian',
      'valuation shortfall',
      'kurang nilai',
      'top up',
      'differential sum',
      'laporan jurunilai',
      'beza harga'
    ]
  },
  {
    id: 'PB-008',
    title: 'Appealing Bank Valuation with Recent Transacted Comparable Data',
    situation:
      "Valuer adopts outdated transacted prices from adjacent secondary schemes, ignoring developer's upgraded specifications and higher floor premium.",
    evidence: 'Case BK-8715 valuation appeal pack submitted to Perdana Bank credit valuation department.',
    action:
      'Compile developer valuation appeal dossier comprising floor-level premium matrices, recent sub-sale comps from JPPH NAPIC portal, and request panel valuer desktop re-assessment.',
    rationale:
      'Valuers frequently revisit conservative initial desktop valuations when presented with developer-certified comparative data without requiring physical inspection.',
    limits:
      'Cannot appeal if building structure or unit size deviates from approved building plans; appeals take 5 to 7 working days and freeze bank approval turnaround.',
    outcome:
      'Valuer revised valuation upward from RM490,000 to RM515,000, reducing shortfall to zero; approved on 2026-06-02.',
    author: 'Tan Mei Ling',
    reviewer: 'Arvind Raj',
    reviewedOn: '2026-06-15',
    status: 'approved',
    tags: ['rayuan penilaian', 'valuation appeal', 'NAPIC', 'JPPH', 'harga pasaran', 'valuer revaluation']
  },
  {
    id: 'PB-009',
    title: 'Buyer Hesitation: Competitor Project Comparison and Value Realization Meeting',
    situation:
      'Buyer expresses hesitation or mentions competitor development offering higher cash rebates or free furnishing packages.',
    evidence:
      'Case BK-8880 customer care log; buyer WhatsApp thread comparing Aster Heights with neighbouring Subang development.',
    action:
      'Arrange in-person or video consultation within 24 hours with senior Sales Admin; present detailed net effective per-square-foot comparison, maintenance sinking fund rates, and MRT connectivity.',
    rationale:
      'Fast intervention addresses buyer remorse and misinformation before buyer makes a competing booking or cancels bank submission.',
    limits:
      'Sales staff are strictly prohibited from matching unauthorized cash rebates outside the official KPKT-approved sales package.',
    outcome:
      'Buyer reaffirmed commitment after clarifying nett density and freehold title advantages; proceeded to loan signing on 2026-08-05.',
    author: 'Nurul Aina',
    reviewer: 'Farhan Malik',
    reviewedOn: '2026-08-10',
    status: 'approved',
    tags: [
      'buyer hesitant',
      'ragu-ragu',
      'banding projek',
      'competitor project',
      'rebate',
      'pakej jualan',
      'cooling off'
    ]
  },
  {
    id: 'PB-010',
    title: 'Pre-SPA Cooling-Off Management: 7-Day Engagement Rhythm',
    situation:
      'Booking confirmed and loan approved, but buyer delays confirming SPA signing date with panel solicitors for more than 5 days.',
    evidence: 'Case BK-8692 sales administration tracking sheet; solicitor email log regarding uncontactable buyer.',
    action:
      'Sales agent initiates empathetic check-in call, answering legal fee questions, confirming panel lawyer appointment location, and offering flexible signing hours.',
    rationale:
      'First-time buyers experience anxiety regarding legal jargon and statutory 10% balance; personal reassurance eliminates friction.',
    limits:
      'If buyer remains unresponsive after 3 calls and 2 WhatsApp messages over 7 business days, issue formal 14-day notice of booking lapse per sales terms.',
    outcome: 'Buyer confirmed appointment for weekend signing session; SPA signed on 2026-05-22.',
    author: 'Nurul Aina',
    reviewer: 'Tan Mei Ling',
    reviewedOn: '2026-06-01',
    status: 'approved',
    tags: [
      'pembeli senyap',
      'tangguh tandatangan',
      'SPA delay',
      'solicitor appointment',
      'first time buyer',
      'temujanji peguam'
    ]
  },
  {
    id: 'PB-011',
    title: 'AI-Assisted Sentiment Analysis for Early Detection of Buyer Hesitation',
    situation:
      'Buyer message patterns show increased response latency (over 48 hours) combined with non-committal monosyllabic replies during loan processing.',
    evidence: 'Experimental WhatsApp sentiment tracking pilot on 15 test bookings.',
    action:
      'Flag booking as high hesitation risk in Mortar dashboard and automatically assign sales retention check-in task.',
    rationale:
      'Early detection of disengagement allows sales team to intervene before the buyer stops communicating entirely.',
    limits:
      'Draft experimental protocol; must not automate client messaging or trigger cancellation notices without human review.',
    outcome: 'Pilot demonstrated 65% early detection accuracy; undergoing management review before formal deployment.',
    author: 'Arvind Raj',
    reviewer: 'Nurul Aina',
    reviewedOn: '2026-09-01',
    status: 'draft',
    tags: ['sentimen', 'hesitation risk', 'responsiveness', 'buyer signals', 'AI detection', 'tindak balas']
  },
  {
    id: 'PB-012',
    title: 'Buyer Withdrawal Handling: Unforeseen Job Relocation or Retrenchment',
    situation:
      'Buyer requests cancellation of booking citing sudden employment relocation out of state or retrenchment prior to SPA execution.',
    evidence: 'Case BK-8910 termination request letter accompanied by corporate transfer letter.',
    action:
      'Verify genuine employer documentation, pause active bank processing immediately to prevent unnecessary credit checks, and submit case to Head of Sales for compassionate review.',
    rationale:
      'Prompt verification prevents inventory from remaining locked in limbo for 30+ days while maintaining positive brand goodwill and regulatory compliance.',
    limits:
      'Voluntary resignation without proof of outstation relocation does not qualify for compassionate administrative fee waiver.',
    outcome:
      'Relocation verified; unit released back to inventory within 5 days and booking fee refunded less RM200 administrative cost.',
    author: 'Nurul Aina',
    reviewer: 'Arvind Raj',
    reviewedOn: '2026-08-20',
    status: 'approved',
    tags: [
      'tarik diri',
      'withdrawal',
      'pindah kerja',
      'batal tempahan',
      'job transfer',
      'retrenchment',
      'cancel booking'
    ]
  },
  {
    id: 'PB-013',
    title: 'Booking Fee Refund Protocol: Two Bank Rejection Letters Standard',
    situation:
      'Buyer requests full refund of booking payment following loan rejection from panel financing institutions.',
    evidence:
      'Case BK-8755 refund dossier; developer benchmark refund policy guidelines with 30-day processing window.',
    action:
      'Require buyer to furnish two formal bank rejection letters stating applicant name, IC, and loan application number; submit to Finance for electronic fund transfer refund.',
    rationale:
      'Two rejection letters prove genuine inability to secure financing rather than casual change of mind, protecting developer marketing costs.',
    limits:
      'Letters must be official credit rejection letters on bank letterhead; informal WhatsApp text messages from bankers are not valid audit evidence.',
    outcome:
      'Documentation verified within 3 days; electronic refund of RM1,000 processed within standard 21-day finance cycle.',
    author: 'Arvind Raj',
    reviewer: 'Nurul Aina',
    reviewedOn: '2026-06-20',
    status: 'approved',
    tags: [
      'refund',
      'pulangan wang',
      'surat reject',
      'rejection letter',
      'dua bank',
      'wang tempahan',
      'administrative charge'
    ]
  },
  {
    id: 'PB-014',
    title: 'Voluntary Buyer Cancellation: Forfeiture and Administrative Cost Deduction',
    situation:
      'Buyer cancels booking unilaterally without loan rejection or valid contractual justification prior to SPA signing.',
    evidence: 'Case BK-8620 cancellation declaration form; sales agreement booking terms clause 8.',
    action:
      'Provide buyer with written explanation of administrative deduction policy, obtain signed cancellation form, and process release of unit to sales inventory.',
    rationale:
      'Formalized cancellation process prevents subsequent legal disputes over unit reservation rights and allows immediate re-marketing.',
    limits:
      'Cannot enforce total deposit forfeiture if developer has collected booking fee in technical contravention of Housing Development Regulation 11(2) without signed purchase contract.',
    outcome: 'RM500 administrative fee retained with buyer written consent; unit released and resold within 14 days.',
    author: 'Nurul Aina',
    reviewer: 'Arvind Raj',
    reviewedOn: '2026-05-10',
    status: 'approved',
    tags: ['forfeiture', 'hangus', 'batal suka rela', 'admin fee', 'pelepasan unit', 'cancellation terms']
  },
  {
    id: 'PB-015',
    title: 'Post-SPA Loan Rejection: Statutory Schedule H Clause 5(3) 1% Deduction',
    situation:
      'Buyer has executed statutory Schedule H Sale and Purchase Agreement, paid 10% deposit, but end-financing is subsequently declined by all financiers.',
    evidence:
      'Schedule H Housing Development (Control and Licensing) Regulations 1989, clause 5(3); High Court authority on statutory termination.',
    action:
      'Panel solicitor issues formal notice of termination under Clause 5(3); developer retains statutory 1% of purchase price and refunds 9% balance within 21 days.',
    rationale:
      'Statutory Schedule H terms strictly govern post-SPA terminations; non-compliance exposes developer to Tribunal for Homebuyer Claims damages.',
    limits:
      'Only applies if buyer produces written proof of loan ineligibility; does not apply if buyer refuses loan offer that meets minimum approved terms.',
    outcome: 'Panel lawyer prepared termination deed; 9% balance refunded within 14 business days on 2026-07-08.',
    author: 'Tan Mei Ling',
    reviewer: 'Arvind Raj',
    reviewedOn: '2026-07-15',
    status: 'approved',
    tags: [
      'Schedule H',
      'klausa 5(3)',
      'post-SPA rejection',
      'statutory refund',
      '1 percent deduction',
      'tribunal',
      'peguam panel'
    ]
  },
  {
    id: 'PB-016',
    title: 'Third-Home Financing: Enforcing 70% Margin of Financing Cap',
    situation:
      'Buyer currently owns two or more existing residential properties with active housing loans, purchasing third residential unit.',
    evidence: 'Bank Negara Malaysia macroprudential property measure circular; Case BK-8930 CCRIS facility report.',
    action:
      'Calculate required downpayment at minimum 30% of SPA price; verify buyer liquid assets (fixed deposit, unit trust, EPF Account 2) before proceeding with loan submission.',
    rationale:
      'BNM regulations mandate a strict 70% loan-to-value cap on third residential property loans to curb speculative borrowing; non-compliance leads to guaranteed rejection.',
    limits:
      'Commercial title properties under HDA (serviced apartments/SOHO) are subject to individual bank risk discretion, but residential titles are non-negotiable.',
    outcome:
      'Verified buyer EPF Account 2 balance of RM180,000 for 30% differential payment; loan approved at 70% margin within 7 days.',
    author: 'Tan Mei Ling',
    reviewer: 'Arvind Raj',
    reviewedOn: '2026-08-25',
    status: 'approved',
    tags: ['third home', 'rumah ketiga', 'margin 70%', 'MOF', 'BNM cap', 'CCRIS properties', 'wang beza 30%']
  },
  {
    id: 'PB-017',
    title: 'CCRIS Pre-Screening: Disclosing Existing Residential Facilities',
    situation:
      'Buyer declares zero existing properties on booking form, but banker pre-check detects active housing loans on CCRIS report.',
    evidence: 'Case BK-8772 central credit reference information system report; automated bank facility count query.',
    action:
      'Request buyer provide latest CCRIS report via eCCRIS portal; clarify whether existing loans represent jointly owned family properties or commercial loans.',
    rationale:
      'Undeclared existing properties distort margin-of-financing calculations, leading to sudden 20% downpayment shortfall at letter of offer issuance.',
    limits:
      'Mortar staff cannot pull CCRIS directly without express signed PDPA statutory consent from buyer; must obtain report from buyer or panel banker.',
    outcome:
      'Identified one existing loan was a settled commercial shoplot loan not yet discharged; bank updated facility classification to allow 90% margin.',
    author: 'Tan Mei Ling',
    reviewer: 'Nurul Aina',
    reviewedOn: '2026-07-01',
    status: 'approved',
    tags: ['CCRIS', 'eCCRIS', 'semakan kredit', 'existing loan', 'kemudahan perumahan', 'penyata liabiliti']
  },
  {
    id: 'PB-018',
    title: 'Pre-Submission DSR Assessment Exceeding 40% Guideline Threshold',
    situation:
      "Initial financial calculation shows applicant's monthly commitments plus prospective mortgage instalment exceeds 40% of gross monthly income.",
    evidence:
      'Association of Banks in Malaysia retail credit guidelines; internal pre-qualification risk assessment log.',
    action:
      'Review net income calculation, assess non-fixed commitments, and identify opportunities to extend loan tenure up to maximum 35 years or age 70 limit.',
    rationale:
      'Proactive loan structuring prior to formal bank submission prevents premature rejection records on CCRIS that prejudice subsequent applications.',
    limits:
      'Cannot artificially lower commitments; debt obligations disclosed in CCRIS are automatically matched by bank algorithmic underwriting.',
    outcome:
      'Re-tenured loan from 25 to 30 years; monthly instalment reduced by RM340, bringing DSR to 38.5%; loan approved on 2026-07-22.',
    author: 'Tan Mei Ling',
    reviewer: 'Arvind Raj',
    reviewedOn: '2026-08-01',
    status: 'approved',
    tags: [
      'DSR',
      'debt service ratio',
      'nisbah khidmat hutang',
      '40% cap',
      'tenure extension',
      'anggaran ansuran',
      'kelayakan pinjaman'
    ]
  },
  {
    id: 'PB-019',
    title: 'Credit Facility Restructuring: Personal Loan Settlement Prior to Submission',
    situation:
      'Applicant has high-interest short-term personal loan or credit card outstanding balance creating 15% DSR drag on mortgage capacity.',
    evidence: 'Case BK-8945 debt restructuring trial worksheet.',
    action:
      'Advise buyer to settle outstanding personal loan balance using liquid savings and obtain official bank clearance letter before mortgage application.',
    rationale:
      'Eliminating a small outstanding personal loan balance removes RM600-RM900 monthly commitment, instantly restoring DSR eligibility.',
    limits:
      'Must obtain formal settlement confirmation and bank clearance letter; CCRIS updates only once monthly on the 10th-15th day of each month.',
    outcome: 'Buyer cleared RM8,000 personal loan; clearance letter submitted; under review for loan approval.',
    author: 'Farhan Malik',
    reviewer: 'Tan Mei Ling',
    reviewedOn: '2026-09-05',
    status: 'draft',
    tags: ['settlement', 'penyelesaian hutang', 'personal loan', 'kad kredit', 'clearance letter', 'kurangkan komitmen']
  },
  {
    id: 'PB-020',
    title: 'Net Income Verification: Cross-Referencing EPF Statement with Monthly Payslips',
    situation:
      'Applicant payslip indicates substantial gross salary, but employer deductions for tax, SOCSO, and voluntary savings depress net take-home pay.',
    evidence: 'Case BK-8828 credit underwriting query; LHDN Form BE and KWSP statement cross-reference.',
    action:
      'Obtain annual EPF statement showing continuous employer statutory contributions, confirming true base income matches payslip gross figures.',
    rationale:
      'Panel banks treat EPF contribution records as gold-standard proof against forged or unverified computer-printed payslips.',
    limits:
      'Does not assist civil servants under government pension scheme (LPPSA) or sole proprietors who do not contribute statutory employee EPF.',
    outcome: 'EPF statement validated continuous salary; bank accepted full gross salary baseline on 2026-06-28.',
    author: 'Tan Mei Ling',
    reviewer: 'Nurul Aina',
    reviewedOn: '2026-07-10',
    status: 'approved',
    tags: ['KWSP', 'EPF statement', 'penyata KWSP', 'caruman majikan', 'gaji bersih', 'pengesahan pendapatan', 'LHDN']
  },
  {
    id: 'PB-021',
    title: 'Slow Panel Banker Escalation: Inactivity Exceeding Nine Working Days',
    situation:
      'Loan application remains in submitted state with no credit decision or document request after 9 working days.',
    evidence:
      'Association of Banks in Malaysia industry timeline commitment (2 to 9 working days); Case BK-8780 banker monitoring record.',
    action:
      'Loan Admin issues formal escalation notice to panel bank Team Leader and Branch Mortgage Manager, requesting status update within 24 hours.',
    rationale:
      'Panel banks prioritize developer project pipelines when branches face quota accountability and escalation from sales leadership.',
    limits:
      'Escalation only applies if full document checklist was acknowledged as complete; if pending buyer documents, clock pauses.',
    outcome:
      'Branch manager escalated to regional credit centre; Letter of Offer issued within 48 hours on 2026-06-18.',
    author: 'Tan Mei Ling',
    reviewer: 'Nurul Aina',
    reviewedOn: '2026-07-01',
    status: 'approved',
    tags: [
      'banker lambat',
      'slow banker',
      'escalation',
      'ABM standard',
      'chase banker',
      'team leader',
      'status permohonan'
    ]
  },
  {
    id: 'PB-022',
    title: 'Banker Reassignment: Transitioning Stalled Case to Dedicated On-Site Banker',
    situation:
      'Assigned external panel banker becomes completely unresponsive or leaves the financial institution during application processing.',
    evidence: 'Case BK-8864 communication breakdown audit log; 12-day silence from branch loan executive.',
    action:
      'Formally request bank branch manager to reassign applicant file to the developer dedicated on-site sales gallery banker with immediate file transfer.',
    rationale:
      'On-site gallery bankers have direct financial incentives to close project cases rapidly and maintain daily physical presence.',
    limits:
      'Requires bank internal operational transfer; file cannot be reassigned across different banking institutions without re-signing application.',
    outcome: 'File transferred to gallery banker; pending approval secured within 3 business days on 2026-07-20.',
    author: 'Nurul Aina',
    reviewer: 'Tan Mei Ling',
    reviewedOn: '2026-07-28',
    status: 'approved',
    tags: ['tukar banker', 'reassign banker', 'gallery banker', 'unresponsive', 'pegawai bank', 'ambil alih kes']
  },
  {
    id: 'PB-023',
    title: 'SPA Execution Scheduling: Standard 14-Day Window Post-Letter of Offer',
    situation:
      'Bank issues approved Letter of Offer (LO), accepted by buyer; legal firm requires coordinated scheduling of SPA signing appointment.',
    evidence:
      'Standard developer sales administration procedural guidelines; Bar Council Conveyancing Practice rulings.',
    action:
      'Sales Admin contacts panel solicitor to verify SPA drafting, coordinates execution appointment within 14 calendar days, and provides buyer location briefing.',
    rationale:
      'Securing SPA execution within 14 days minimizes buyer remorse risk and ensures compliance with developer monthly conversion targets.',
    limits:
      'If buyer requires differential sum financing or state authority consent (foreign buyer or bumiputera quota), signing window must be extended by written approval.',
    outcome: 'Appointment confirmed on day 7; SPA successfully executed on day 11 on 2026-08-18.',
    author: 'Nurul Aina',
    reviewer: 'Tan Mei Ling',
    reviewedOn: '2026-08-22',
    status: 'approved',
    tags: [
      'LO',
      'surat tawaran',
      'letter of offer',
      'SPA signing',
      'jadual SPA',
      'temujanji peguam',
      'tandatangan perjanjian'
    ]
  },
  {
    id: 'PB-024',
    title: 'Outstation and Overseas Buyer SPA Execution Protocol',
    situation:
      'Buyer resides outstation or overseas and cannot attend physical signing in Klang Valley panel legal office.',
    evidence:
      'Case BK-8890 outstation execution protocol memo; courier tracking and statutory declaration verification checklist.',
    action:
      'Arrange execution via panel law firm branch office, notary public, or Malaysian High Commission; coordinate tracked courier dispatch of triplicate SPA copies.',
    rationale:
      'Structured remote execution eliminates travel excuses and ensures legally binding execution compliant with Malaysian National Land Code witnessing requirements.',
    limits:
      'Must be witnessed by Advocate & Solicitor, Notary Public, or Consular Officer; informal witnessing invalidates land registry memorandum of transfer (Form 14A).',
    outcome:
      'Executed documents returned via courier from Singapore within 8 days; verified and stamped on 2026-08-12.',
    author: 'Nurul Aina',
    reviewer: 'Arvind Raj',
    reviewedOn: '2026-08-15',
    status: 'approved',
    tags: [
      'outstation buyer',
      'overseas',
      'Singapore',
      'notary public',
      'pos dokumen',
      'pesuruhjaya sumpah',
      'luar kawasan'
    ]
  },
  {
    id: 'PB-025',
    title: 'Legacy Manual Cheque Booking Fee Refund Procedure',
    situation:
      'Processing booking fee refunds via physical voucher and manual crossed corporate cheque mailed to buyer postal address.',
    evidence:
      'Standard operating procedure SOP-FIN-2022/04; Finance Department circular on manual cheque disbursement.',
    action:
      'Prepare payment voucher, obtain two director signatures, print physical cheque, and send via registered post with 45-day turnaround cycle.',
    rationale:
      'Historic financial control policy prior to implementation of corporate online banking electronic fund transfer (EFT).',
    limits:
      'Superseded due to frequent lost cheques, postal delays, and customer dissatisfaction; replaced by PB-013 instant EFT refund.',
    outcome: 'Replaced by digital electronic payment protocol in July 2025; retained for audit tracking only.',
    author: 'Arvind Raj',
    reviewer: 'Nurul Aina',
    reviewedOn: '2025-07-01',
    status: 'superseded',
    tags: ['cek manual', 'cheque refund', 'voucher', 'legacy SOP', 'superseded', 'kaedah lama', 'pos berdaftar']
  },
  {
    id: 'PB-026',
    title: 'Housing Development Regulation 11(2) Compliance and Booking Fee Accounting',
    situation:
      'Managing initial unit reservation funds in compliance with Peninsular Malaysia statutory regulations prohibiting uncontracted collection.',
    evidence:
      'Housing Development (Control and Licensing) Regulations 1989, Regulation 11(2); Housing Development Act 1966 (Act 118); KPKT enforcement directives.',
    action:
      'Account for reservation funds strictly as refundable stakeholder deposit held against standard developer booking form; credit immediately against 10% deposit upon SPA signing.',
    rationale:
      'Judicial decisions treat pre-SPA payments as legally protected stakeholder deposits; clear accounting shields developer from statutory penalties.',
    limits:
      'Cannot charge forfeiture fees if buyer withdraws prior to signing where no signed option or preliminary agreement exists under Peninsular law.',
    outcome: 'All stakeholder accounts reconciled with internal audit; 100% compliance achieved on 2026-06-30.',
    author: 'Arvind Raj',
    reviewer: 'Nurul Aina',
    reviewedOn: '2026-07-05',
    status: 'approved',
    tags: [
      'Regulation 11(2)',
      'HDA',
      'booking fee',
      'wang tempahan',
      'KPKT',
      'stakeholder deposit',
      'undang-undang perumahan'
    ]
  },
  {
    id: 'PB-027',
    title: 'Pre-PJD Regency Late Delivery Calculation from SPA Date',
    situation:
      'Historical procedure calculating liquidated ascertained damages (LAD) for late delivery starting from the date of SPA signing.',
    evidence:
      'Historical developer standard practice prior to Federal Court decision in PJD Regency Sdn Bhd v Tribunal Tuntutan Pembeli Rumah & Anor (19 January 2021).',
    action: 'Calculate completion deadline strictly from date of SPA execution, ignoring booking fee payment date.',
    rationale:
      'Previous industry convention assumed contractual relationship only commenced upon formal execution of statutory SPA.',
    limits:
      'Superseded by Federal Court ruling; all projects must now calculate completion and delivery timeline from the date booking fee was received.',
    outcome: 'Policy formally superseded across all group projects following Federal Court apex judgment.',
    author: 'Nurul Aina',
    reviewer: 'Arvind Raj',
    reviewedOn: '2024-01-10',
    status: 'superseded',
    tags: ['PJD Regency', 'LAD', 'late delivery', 'tarikh SPA', 'ganti rugi', 'superseded', 'mahkamah persekutuan']
  }
]
