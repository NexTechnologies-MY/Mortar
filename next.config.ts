import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // The Next.js agent rules live in docs/agents/nextjs.md instead of AGENTS.md.
  agentRules: false,
  // PGlite ships a WASM binary that must be loaded from node_modules at
  // runtime, so keep it out of the server bundle.
  serverExternalPackages: ['@electric-sql/pglite']
}

export default nextConfig
