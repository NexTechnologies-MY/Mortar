# Mortar Thirty-Minute Presentation Pack

Start with the [full presentation script](presentation-script.md). It includes
the agenda, spoken lines, slide numbers, exact prototype pages and actions,
fallbacks and likely questions. The presentation lasts **30 minutes, with Q&A
afterward**. It is written for a main presenter and can be shared across
teammates.

## Files To Use

| File                                             | Purpose                                                      |
| ------------------------------------------------ | ------------------------------------------------------------ |
| [Full script](presentation-script.md)            | Read in GitHub; rehearse the complete presentation and demo. |
| [Script PDF](presentation-script.pdf)            | Print or view the complete script.                           |
| [Script Word document](presentation-script.docx) | Edit or annotate the script.                                 |
| [Slide PDF](presentation-slides.pdf)             | Preview or present all 18 slides.                            |
| [Offline slide deck](presentation.html)          | Present with arrow keys; press N for speaker notes.          |
| [Presenter guide](presenter-guide.html)          | Open the script in a browser beside the deck.                |
| [Cue sheet](cue-sheet.md)                        | Quickly check timings, slide numbers and prototype routes.   |
| [Cue sheet Word document](cue-sheet.docx)        | Print or edit the cue sheet.                                 |
| [Company research](company-research.md)          | Check official sources, entity distinctions and assumptions. |
| [Review notes](review-notes.md)                  | Understand the prototype review, checks and limitations.     |
| [Complete ZIP](Mortar-Presentation-Pack.zip)     | Download the whole pack together.                            |

GitHub shows HTML as source. To use the interactive deck, download the ZIP with
the **Download raw file** button, extract it and open `presentation.html` in a
browser. Keep the companion files together. The deck works offline; the
prototype links require internet access.

## Presentation Flow

| Time        | Slides          | Content and prototype page                                                                                                   |
| ----------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 00:00–01:30 | 1–2             | Business opening and agenda.                                                                                                 |
| 01:30–06:00 | 3–4             | Chin Hin research; evidence versus assumptions.                                                                              |
| 06:00–09:30 | 5–6             | Before workflow and Mortar's solution logic.                                                                                 |
| 09:30–12:15 | 7–8             | Synthetic-data boundary `/settings`; owned work `/chase`.                                                                    |
| 12:15–16:15 | 9               | Critical workflow on `/bookings/BK-9001`: confirm a request, verify receipt, confirm the evidence and show the changed case. |
| 16:15–18:00 | 10              | Before and after; what the change proves.                                                                                    |
| 18:00–21:00 | 11–12           | Legal handoff `/legal`; manager follow-up `/manager`.                                                                        |
| 21:00–24:00 | 13–14           | Forecast `/forecast`; technology supporting the workflow.                                                                    |
| 24:00–28:00 | 15–16           | Explicit impact assumptions; adoption and `/import`.                                                                         |
| 28:00–30:00 | 17–18           | Maturity, limits and pilot request.                                                                                          |
| After 30:00 | Script appendix | Audience Q&A.                                                                                                                |

## Rehearsal And Evidence

Review snapshot: Mortar commit `e7f3f5db821b42830a941ba4d33975890f9ced91` on 28
September 2026. The current prototype link used in the pack is
[Mortar on Render](https://mortar-d18f.onrender.com).

The script distinguishes company facts, practitioner evidence, synthetic
prototype behavior and proposed pilot assumptions. Receipt of a document clears
a blocker; it does not approve a mortgage or prove an additional sale. Manager
follow-up creates internal work; it does not send WhatsApp messages.

Rehearse the live mutation sequence on a dedicated synthetic demo state before
presenting. The review inspected the shared live state without changing its
booking evidence. [Local logic verification](demo-logic-verification.json)
records the separately checked request-to-receipt transition.

The [repository inventory](repository-inventory.json) lists 781 tracked files
from the reviewed commit. Review notes explain which implementation and research
areas were examined in depth.
