/** Liveness probe for CI, uptime checks, and Playwright's webServer wait. */
export function GET() {
  return Response.json({ ok: true })
}
