// src/App.tsx
import { useState, useRef } from 'react'
import { streamChat } from './api'
import type { ChatMessage, Role } from './types'
import './index.css'

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'system', content: 'Você é um assistente sucinto e técnico.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    const base = [...messages, userMsg]
    setMessages(base)
    setInput('')
    setLoading(true)

    // cria a resposta vazia e vai preenchendo com tokens
    let assistantIdx = base.length
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      await streamChat(
        [...base],
        (token) => {
          setMessages(prev => {
            const next = [...prev]
            const current = next[assistantIdx]
            if (current && current.role === 'assistant') {
              next[assistantIdx] = {
                role: 'assistant',
                content: current.content + token,
              }
            }
            return next
          })
          // auto-scroll
          queueMicrotask(() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
          })
        },
      )
    } catch (e: any) {
      // exibe erro como mensagem do sistema
      setMessages(prev => [
        ...prev,
        { role: 'system', content: `Erro: ${e?.message ?? 'desconhecido'}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="app">
      <header className="app-header">Ollama Chat (SSE)</header>

      <div className="chat" ref={scrollRef}>
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role} text={m.content} />
        ))}
        {loading && <div className="typing">gerando…</div>}
      </div>

      <div className="composer">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte algo…"
          rows={3}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          Enviar
        </button>
      </div>
    </div>
  )
}

function ChatBubble({ role, text }: { role: Role; text: string }) {
  const who =
    role === 'user' ? 'Você' :
    role === 'assistant' ? 'Assistente' :
    'Sistema'
  const cls =
    role === 'user' ? 'bubble user' :
    role === 'assistant' ? 'bubble assistant' :
    'bubble system'
  return (
    <div className={cls}>
      <div className="bubble-who">{who}</div>
      <div className="bubble-text">{text}</div>
    </div>
  )
}
