'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { type FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Chat() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' })
  })
  const busy = status === 'submitted' || status === 'streaming'

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    void sendMessage({ text })
    setInput('')
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <ol className="flex flex-1 flex-col gap-3" aria-live="polite">
        {messages.length === 0 ? (
          <li className="rounded-lg border border-dashed p-6 type-copy-14 text-muted-foreground">
            Ask a question to start. Answers stream in as they are generated.
          </li>
        ) : null}
        {messages.map((message) => (
          <li
            key={message.id}
            className={
              message.role === 'user'
                ? 'max-w-[80%] self-end rounded-lg bg-gray-100 px-4 py-2 type-copy-14'
                : 'max-w-[80%] self-start type-copy-16 whitespace-pre-wrap'
            }
          >
            {message.parts.map((part, index) => (part.type === 'text' ? <span key={index}>{part.text}</span> : null))}
          </li>
        ))}
        {error ? (
          <li role="status" className="type-copy-14 text-red-900">
            {error.message}
          </li>
        ) : null}
      </ol>
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask anything…"
          aria-label="Message"
          autoComplete="off"
          autoFocus
        />
        <Button type="submit" aria-busy={busy} disabled={busy}>
          {busy ? 'Sending…' : 'Send'}
        </Button>
      </form>
    </div>
  )
}
