import { useEffect, useMemo, useRef } from 'react'

export type ChatMessage = {
  id: string
  sender: string
  body: string
  createdAt: string
  readAt?: string | null
}

function senderLabel(sender: string, role: 'student' | 'admin') {
  if (sender === role) return 'You'
  return role === 'student' ? 'Apply Once team' : 'Student'
}

export function ChatThread(props: {
  messages: ChatMessage[]
  role: 'student' | 'admin'
  emptyHint?: string
}) {
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
        <div className="chatEmptyState">
          <p className="chatEmptyTitle">Start the conversation</p>
          <p className="chatEmptyText">
            {props.emptyHint ??
              'Ask us anything — missing documents, bursary questions, or where you are stuck. We are here to help.'}
          </p>
        </div>
      ) : (
        items.map((m) => {
          const isSelf = m.sender === props.role
          return (
            <div
              key={m.id}
              className={isSelf ? 'chatBubble chatBubbleSelf' : 'chatBubble chatBubbleOther'}
            >
              <div className="chatSender">{senderLabel(m.sender, props.role)}</div>
              <div className="chatBody">{m.body}</div>
              <div className="chatMeta">
                <span>{new Date(m.createdAt).toLocaleString()}</span>
                {isSelf ? (
                  <span className={m.readAt ? 'chatReceiptRead' : 'chatReceiptSent'}>
                    {m.readAt ? ' · Read' : ' · Sent'}
                  </span>
                ) : null}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
