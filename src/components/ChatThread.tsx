import { useEffect, useMemo, useRef } from 'react'

export type ChatMessage = {
  id: string
  sender: string
  body: string
  createdAt: string
}

export function ChatThread(props: { messages: ChatMessage[]; role: 'student' | 'admin' }) {
  const ref = useRef<HTMLDivElement | null>(null)

  const items = useMemo(() => props.messages ?? [], [props.messages])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [items.length])

  return (
    <div className="chatThread" ref={ref}>
      {items.length === 0 ? (
        <p className="profileMuted">No messages yet.</p>
      ) : (
        items.map((m) => (
          <div
            key={m.id}
            className={
              m.sender === props.role ? 'chatBubble chatBubbleSelf' : 'chatBubble chatBubbleOther'
            }
          >
            <div className="chatBody">{m.body}</div>
            <div className="chatMeta">
              {m.sender} · {new Date(m.createdAt).toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

