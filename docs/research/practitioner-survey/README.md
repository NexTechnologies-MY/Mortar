# Industry Practitioner Survey Findings

Findings from the Google Form "Property Booking-to-SPA Conversion — Industry
Practitioner Survey", submitted anonymously by five consenting practitioners on
18 September 2026 (n = 5). This provides practitioner evidence to rank booking
leakage causes ([Problem Statement](/docs/source/problem-statement.md)) and
informs the [Front-End Simulation](/docs/research/company-brain/simulation.md)
assumptions panel. Findings reflect industry experience, not Chin Hin records.

## Respondents

| Respondent | Stated Industry Area                                             |
| ---------- | ---------------------------------------------------------------- |
| R1         | Not stated                                                       |
| R2         | Sales / project marketing, property agency, sales administration |
| R3         | Project management                                               |
| R4         | Finance / management                                             |
| R5         | Construction                                                     |

Convenience sample across mixed roles, with only one in sales administration.

## Findings

### Leakage Causes, Ranked

| Cause                                    | Single Biggest Cause | Named In Top Three |
| ---------------------------------------- | -------------------- | ------------------ |
| Loan rejection or insufficient financing | 5 of 5               | 5 of 5             |
| Buyer withdrawal or change of mind       | 0 of 5               | 4 of 5             |
| Incomplete buyer documents               | 0 of 5               | 3 of 5             |
| Property valuation shortfall             | 0 of 5               | 2 of 5             |

### Stage Where Bookings Get Stuck

| Stage                                | Count  |
| ------------------------------------ | ------ |
| Bank credit assessment               | 4 of 5 |
| Letter of Offer / loan documentation | 1 of 5 |

### Bookings Reaching Signed SPA

| Bookings Out Of 10 Reaching Signed SPA | Count  |
| -------------------------------------- | ------ |
| 0–2                                    | 3 of 5 |
| 7–8                                    | 1 of 5 |
| Varies / not sure                      | 1 of 5 |

### Typical Time Between Booking And SPA

| Typical Duration  | Count  |
| ----------------- | ------ |
| 3–4 weeks         | 2 of 5 |
| More than 8 weeks | 2 of 5 |
| Varies / not sure | 1 of 5 |

### Time Until Failed Booking Unit Is Released

| Unit Release Window | Count  |
| ------------------- | ------ |
| Up to 2 weeks       | 1 of 5 |
| 3–4 weeks           | 2 of 5 |
| More than 12 weeks  | 1 of 5 |
| Varies / not sure   | 1 of 5 |

### Booking Progress Tracking Methods

| Tracking Method       | Count  |
| --------------------- | ------ |
| CRM or formal system  | 3 of 5 |
| Excel / Google Sheets | 2 of 5 |
| Email                 | 1 of 5 |

### First Role To Notice A Stuck Booking

| First Observer           | Count  |
| ------------------------ | ------ |
| Sales Admin / Loan Admin | 2 of 5 |
| Sales / property agent   | 2 of 5 |
| Bank / banker            | 1 of 5 |

### Financing Eligibility Check Timing

| Check Frequency | Count  |
| --------------- | ------ |
| Always          | 3 of 5 |
| Sometimes       | 1 of 5 |
| Rarely          | 1 of 5 |

### Most Useful Signals For SPA Conversion

| Signal                          | Count  |
| ------------------------------- | ------ |
| Financing eligibility or result | 5 of 5 |
| Banker progress                 | 3 of 5 |
| Buyer-document completeness     | 2 of 5 |
| Buyer responsiveness            | 2 of 5 |
| Property valuation outcome      | 1 of 5 |

### Most Helpful Process Improvement

| One Most Helpful Improvement       | Count  |
| ---------------------------------- | ------ |
| Early financing eligibility check  | 4 of 5 |
| Faster bank / legal status updates | 1 of 5 |

### Safe Areas For AI Assistance

| Area For AI Assistance                                     | Count  |
| ---------------------------------------------------------- | ------ |
| Checking documents for missing items                       | 3 of 5 |
| Suggesting next actions based on stage                     | 2 of 5 |
| Estimating conversion risk from sufficient historical data | 1 of 5 |
| AI is premature until data and processes improve           | 1 of 5 |
| Not sure                                                   | 1 of 5 |

### Practitioner Qualitative Comments

| Respondent | Verbatim Comment                                                                                                                                                                              |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1         | "Integration with IFCA system to get projects, units, status, sales packages information from the system, and write the updates back into IFCA. Integration with the core system is crucial." |
| R3         | "The buyers have met the necessary financial criteria to proceed with the property acquisition."                                                                                              |

Non-substantive responses from R2 ("no") and R4 ("N/A") are omitted.

## Implications For Mortar

**Ranked Leakage Causes:** Loan rejection is the unanimous biggest cause (5 of
5), and bank credit assessment is where bookings stall (4 of 5); this is our
practitioner evidence for the proposal's ranked causes, demonstrating how we
know rather than guess.

**Appropriate AI Boundary:** The AI boundary matches the concept: AI checks
documents (3 of 5) and suggests next steps (2 of 5), while people decide. Only
one respondent would use AI to estimate conversion risk, so the forecast stays
statistical.

**The Financing Eligibility Gap:** Four of five want an early financing
eligibility check and all five rank financing as the top signal, but the
concept's feature list has no eligibility check. Three respondents say
eligibility is already always checked, which suggests today's checks come too
late or are too shallow; the survey cannot say which. To address the
Sales-momentum tension, Mortar should compute an advisory financing-risk flag
per booking from the simulation's debt service ratio, margin-of-financing and
tenure seed values—a prompt to follow up, not a gate on bookings.

**Simulation Seed Calibration:** Conversion and timing answers are too scattered
to use as seed values (0–2 out of 10 for three respondents, 7–8 for one; booking
to SPA from 3–4 weeks to over 8 weeks). At most, these define a sensitivity
range on the assumptions panel, tagged "survey, n = 5".

**Tracking And Core Systems:** Tracking is spread across CRMs (3 of 5),
spreadsheets (2 of 5) and email (1 of 5), which supports one shared case record
and spreadsheet import. IFCA integration is a roadmap item, starting from
read-only exports as the concept recommends.

## Limitations

Five self-selected respondents, mixed roles, self-reported general experience
rather than company records, and multi-select answers counted per respondent.

## See Also

- [Company-Brain Concept](/docs/research/company-brain/README.md): the platform
  concept this survey informs.
- [Front-End Simulation](/docs/research/company-brain/simulation.md): scope,
  seed values and assumptions panel for the first prototype.
- [Problem Statement](/docs/source/problem-statement.md): the Chin Hin challenge
  brief.
- [Practitioner Interview](/docs/source/interview.md): field interview notes and
  questionnaire template.
