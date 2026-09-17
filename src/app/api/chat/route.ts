import { google } from '@ai-sdk/google'
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
  validateUIMessages
} from 'ai'
import { env } from '@/lib/env'
import { getSession } from '@/lib/session'

export const maxDuration = 30

const INSTRUCTIONS = 'You are a concise, friendly assistant embedded in a hackathon project. Answer directly.'

/**
 * Streams a chat completion to the useChat() client in src/components/chat/chat.tsx.
 * Provider-agnostic: swap `google(...)` for any AI SDK provider to change vendors.
 * The default model is Gemini via Google AI Studio, which has a free tier.
 */
export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return new Response('Sign in to use chat.', { status: 401 })

  let messages: UIMessage[]
  try {
    const body = (await req.json()) as { messages?: unknown }
    messages = await validateUIMessages({ messages: body.messages })
  } catch {
    return new Response('Expected a JSON body with a `messages` array of UI messages.', { status: 400 })
  }

  if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(
      'Chat is disabled: set GOOGLE_GENERATIVE_AI_API_KEY in .env (free at https://aistudio.google.com/) and restart the dev server.',
      { status: 503 }
    )
  }

  const result = streamText({
    model: google(env.AI_MODEL),
    instructions: INSTRUCTIONS,
    messages: await convertToModelMessages(messages)
  })

  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) })
}
