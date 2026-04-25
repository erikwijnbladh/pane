import { useEffect, useRef } from 'react'

type State = 'idle' | 'dirty' | 'saved'

type Props = {
  state: State
  onClick: () => void
}

const LABELS: Record<State, string> = {
  idle: 'tokens',
  dirty: 'save changes',
  saved: 'saved',
}

export default function TokenPill({ state, onClick }: Props) {
  const labelRef = useRef<HTMLSpanElement>(null)
  const prevState = useRef<State>(state)

  useEffect(() => {
    const el = labelRef.current
    if (!el || prevState.current === state) return
    prevState.current = state

    // pop: scale up briefly then settle
    el.animate(
      [
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(1.18)', opacity: 0, offset: 0.3 },
        { transform: 'scale(0.85)', opacity: 0, offset: 0.31 },
        { transform: 'scale(1)', opacity: 1 },
      ],
      { duration: 320, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
    )
  }, [state])

  const isSaved = state === 'saved'
  const isDirty = state === 'dirty'

  return (
    <>
      <style>{`
        @keyframes token-pill-bob {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .token-pill:hover { animation: token-pill-bob 0.5s ease; }
        @keyframes check-draw { to { stroke-dashoffset: 0; } }
        @keyframes circle-draw { to { stroke-dashoffset: 41; } }
      `}</style>
      <button
        onClick={onClick}
        className="token-pill pointer-events-auto flex items-center gap-2.5 rounded-full bg-[#1a1a1a] px-5 py-2.5 text-[12px] font-medium text-[#aaa] shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.07)] transition-colors duration-200 hover:bg-[#222] hover:text-white"
      >
        {/* palette icon — hidden when dirty/saved */}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          style={{ transition: 'opacity 0.2s, width 0.2s', opacity: isDirty || isSaved ? 0 : 1, width: isDirty || isSaved ? 0 : 14, overflow: 'hidden', flexShrink: 0 }}
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.1 0 2-.9 2-2v-.5c0-.28-.11-.53-.29-.71a.99.99 0 0 1-.29-.7c0-.55.45-1 1-1h1.5c2.76 0 5-2.24 5-5 0-4.97-4.03-9-9-9z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor"/>
          <circle cx="11" cy="7.5" r="1.5" fill="currentColor"/>
          <circle cx="14.5" cy="10.5" r="1.5" fill="currentColor"/>
        </svg>

        {/* label */}
        <span ref={labelRef} style={{ display: 'inline-block' }}>
          {LABELS[state]}
        </span>

        {/* checkmark — shown when dirty or saved */}
        <svg
          key={state} // remount on state change so animations restart clean
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{ transition: 'opacity 0.2s, width 0.2s', opacity: isDirty || isSaved ? 1 : 0, width: isDirty || isSaved ? 16 : 0, flexShrink: 0, overflow: 'hidden' }}
        >
          {/* circle — draws in on saved */}
          <circle
            cx="8" cy="8" r="6.5"
            stroke="#10b981" strokeWidth="1.4" fill="none" strokeLinecap="round"
            style={{
              strokeDasharray: 41,
              strokeDashoffset: isSaved ? 41 : 82,
              animation: isSaved ? 'check-draw 0.45s cubic-bezier(0.4,0,0.2,1) 0.15s forwards' : 'none',
            }}
          />
          {/* tick — always visible when dirty/saved */}
          <path
            d="M4.5 8.5l2.5 2 4.5-5"
            stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  )
}
