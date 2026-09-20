/**
 * FAQ route.
 * Plain answers for staff and reviewers: what Mortar is, who uses it, how the
 * labels, Jev and the forecast behave, and what is still theatre. Sits inside
 * PublicShell, which supplies the fixed top bar and the site footer, and
 * outside AppShell like the landing.
 */

const FAQS: { question: string; answer: string[] }[] = [
  {
    question: 'What Is Mortar?',
    answer: [
      'Mortar is an internal operations tool for a Malaysian property developer. It tracks every unit booking from the paid deposit to a signed Sale & Purchase Agreement (SPA).',
      'Bookings stall quietly — a rejected loan, a missing payslip, a buyer gone quiet — while the unit sits off the market. Mortar keeps one shared case record and surfaces every stall for a person to chase. This is a prototype: everything in it runs on simulated data.'
    ]
  },
  {
    question: 'Who Uses Mortar, And Where Does Each Role Start?',
    answer: [
      'Three staff roles, chosen on the sign-in page or switched in the header. Sales Admin starts on the Chase List — every stalled booking, its blocker in plain words, and who to chase today. Loan Admin starts on Bookings — each unit\u2019s case file, its bank applications and its evidence log. Finance starts on Forecast — the signings you can bank on, not the bookings you hope will convert.'
    ]
  },
  {
    question: 'Is The Data Real?',
    answer: [
      'No. Every booking, buyer, banker, bank and law firm is invented, and every screen carries a Simulated Data badge with its seed and as-of date. A seeded generator produces the cases, calibrated on public Malaysian figures — Bank Negara Malaysia loan tables, REHDA survey results — and an anonymous practitioner survey of five industry respondents. Nothing shown is a real person, a real file or a real result.'
    ]
  },
  {
    question: 'What Do The Stage And Risk Labels Mean?',
    answer: [
      'The stage pill says where the case sits — Booked, With Bank, LO Issued, Loan Agreement, Disbursed or SPA Signed — with Cancelled and Lapsed as exits. A live case with no confirmed evidence for ten days reads Unknown instead of pretending progress.',
      'The risk chip — Low Risk, Medium Risk or High Risk — flags financing strain: the buyer\u2019s monthly commitments plus the new instalment, measured against the industry guide of 40% of gross income (Association of Banks in Malaysia, 2017), with the loan capped at a 70% margin from the buyer\u2019s third home (Bank Negara Malaysia, 2010). The chip is a prompt to check early — the bank makes the real credit decision.'
    ]
  },
  {
    question: 'When Does A Booking Land On The Chase List?',
    answer: [
      'When it stalls. Mortar states the reason in plain words: no confirmed evidence for seven days, a requested document outstanding for five, an application undecided past the industry\u2019s two-to-nine-working-day decision window (Association of Banks in Malaysia, 2017), or a disputed event still awaiting review.',
      'The limits are defaults listed on the forecast page\u2019s assumptions panel — placeholders to calibrate on company data. Jev suggests the next action and owner for each stalled case.'
    ]
  },
  {
    question: 'What Does Jev Do?',
    answer: [
      'Jev is Mortar\u2019s AI reader. Paste a buyer\u2019s or banker\u2019s message — English, Malay, Chinese or Manglish — and it proposes what happened, such as Documents Requested for a payslip, with a probability and a confidence. It also suggests next actions on the Chase List and ranks the staff playbooks by fit.',
      'Jev only proposes. A person confirms, disputes or dismisses every suggestion before it moves a case, and anything under 60% confidence is flagged Needs Review. The forecast is statistics, not Jev — the practitioners we surveyed wanted AI on document checks and next actions, not on conversion.'
    ]
  },
  {
    question: 'Where Does The Data Come From, And How Is It Refreshed?',
    answer: [
      'In this prototype, from the seeded simulation — no files are loaded. The Import page is the placeholder for the real intake: the bookings spreadsheet the team already exports, refreshed whenever a new export lands. The Chase List is a daily tool, so a daily refresh is the working assumption.',
      'For the demo, Reset Demo Data in Settings restores the original dataset in one click.'
    ]
  },
  {
    question: 'How Does The Forecast Work?',
    answer: [
      'It counts signed SPAs, not bookings. A booking is a promise; only a signed SPA — with 10% of the price due on signing — makes the unit sold. The headline is expected signings within 30 days of booking, with a range around it.',
      'Each live booking gets a probability from how resolved bookings at the same stage actually converted, and the probabilities sum to the headline. The backtest on the page checks the method against the simulated history — it proves the method works, not that the business behaves this way.'
    ]
  },
  {
    question: 'Why Is There No Real Sign-In?',
    answer: [
      'Because there is nothing to protect: the prototype holds only synthetic data. The sign-in page is theatre — the email and password fields are disabled, you pick a persona, and Sign In As Guest drops you on that role\u2019s home page. Real accounts and single sign-on are on the production roadmap.'
    ]
  }
]

/** Renders the FAQ page: the title block and the question list. */
export function FaqPage() {
  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex w-full max-w-[720px] flex-col px-6 pt-24 pb-16 min-[900px]:pt-32">
        <div className="flex flex-col gap-4 text-center">
          <p className="text-[11px] leading-[14px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            FAQ
          </p>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">
            What Mortar Is, Who It Is For, And How To Read It. Every Answer Describes The Prototype, Which Runs On
            Simulated Data.
          </p>
        </div>
        <div className="mt-10 flex flex-col divide-y divide-border border-y border-border">
          {FAQS.map((item) => (
            <section key={item.question} className="flex flex-col gap-2 py-6">
              <h2 className="text-base font-semibold tracking-[-0.01em] text-foreground">{item.question}</h2>
              {item.answer.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-6 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
