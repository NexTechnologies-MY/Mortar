import type { Metadata } from 'next'
import { Chat } from '@/components/chat/chat'
import { env } from '@/lib/env'
import { requireUser } from '@/lib/session'

export const metadata: Metadata = { title: 'Chat' }

export default async function ChatPage() {
  await requireUser()
  const enabled = Boolean(env.GOOGLE_GENERATIVE_AI_API_KEY)

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="type-heading-32">Chat</h1>
        <p className="type-copy-16 text-muted-foreground">
          Streaming responses through the AI SDK. Model:{' '}
          <code translate="no" className="font-mono type-copy-14">
            {env.AI_MODEL}
          </code>
        </p>
      </div>
      {enabled ? (
        <Chat />
      ) : (
        <div className="rounded-lg border border-dashed p-6 type-copy-14 text-muted-foreground">
          Chat is off. Get a free key at{' '}
          <a href="https://aistudio.google.com/" className="text-foreground underline underline-offset-4">
            aistudio.google.com
          </a>
          , add it to <code className="font-mono">.env</code> as{' '}
          <code translate="no" className="font-mono">
            GOOGLE_GENERATIVE_AI_API_KEY
          </code>
          , restart <code className="font-mono">bun run dev</code>, and this page becomes a working chat. The route
          lives in <code className="font-mono">src/app/api/chat/route.ts</code>.
        </div>
      )}
    </div>
  )
}
