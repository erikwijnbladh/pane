import { useState, useEffect, useRef } from 'react'
import Canvas from './Canvas'
import Editor from './Editor'
import TokenPill from './TokenPill'

const API = 'http://localhost:3001/api'
const DEMO_ORDER = ['Button.tsx', 'MiniToolbar.tsx', 'TokenSystem.tsx']

function toComponentName(input: string) {
  const cleaned = input
    .replace(/\.tsx?$/, '')
    .replace(/[^A-Za-z0-9_ -]/g, ' ')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  if (!cleaned || !/^[A-Za-z]/.test(cleaned)) return null
  return cleaned
}

function sortFiles(files: string[]) {
  return [...files].sort((a, b) => {
    const aIndex = DEMO_ORDER.indexOf(a)
    const bIndex = DEMO_ORDER.indexOf(b)
    if (aIndex !== -1 || bIndex !== -1) return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex)
    return a.localeCompare(b)
  })
}

function initialPaneFor(filename: string, index: number): Pane {
  const name = filename.replace('.tsx', '')
  const presets: Record<string, Partial<Pane>> = {
    'Button.tsx': { x: 60, y: 80, width: 460, height: 360 },
    'MiniToolbar.tsx': { x: 60, y: 560, width: 440 },
    'TokenSystem.tsx': { x: 560, y: 80, width: 500 },
  }

  return {
    id: name,
    name,
    x: 60 + (index % 2) * 520,
    y: 80 + Math.floor(index / 2) * 360,
    width: 440,
    height: 260,
    ...presets[filename],
  }
}

export type Pane = {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
}

export default function App() {
  const [panes, setPanes] = useState<Pane[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [openTabs, setOpenTabs] = useState<string[]>([])
  const [code, setCode] = useState('')
  const [savedCode, setSavedCode] = useState('')
  const [tokenSaved, setTokenSaved] = useState(false)
  const [files, setFiles] = useState<string[]>([])
  const [editorWidth, setEditorWidth] = useState(420)
  const deletedStack = useRef<{ name: string; content: string; pane: Pane }[]>([])
  const resizing = useRef(false)
  const resizeStart = useRef({ x: 0, width: 0 })
  const editorPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchFiles() }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizing.current) return
      const dx = e.clientX - resizeStart.current.x
      setEditorWidth(Math.max(200, Math.min(800, resizeStart.current.width + dx)))
    }
    const onUp = () => { resizing.current = false; document.body.style.cursor = '' }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  useEffect(() => {
    if (editorPanelRef.current) {
      editorPanelRef.current.style.setProperty('width', `${editorWidth}px`)
    }
  }, [editorWidth])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        undoDelete()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  async function fetchFiles() {
    const res = await fetch(`${API}/files`)
    const data: string[] = sortFiles(await res.json())
    setFiles(data)
    setPanes(data.map(initialPaneFor))
    openTab('tokens.ts')
  }

  async function openTab(filename: string) {
    const res = await fetch(`${API}/files/${filename}`)
    if (!res.ok) return
    const { content } = await res.json()
    setCode(content)
    setSavedCode(content)
    setTokenSaved(false)
    setSelected(filename)
    setOpenTabs(prev => prev.includes(filename) ? prev : [...prev, filename])
  }

  function closeTab(filename: string) {
    setOpenTabs(prev => {
      const next = prev.filter(t => t !== filename)
      if (selected === filename) {
        const nextSelected = next.length > 0 ? next[next.length - 1] : null
        setSelected(nextSelected)
        if (nextSelected) {
          fetch(`${API}/files/${nextSelected}`).then(r => r.json()).then(d => {
            setCode(d.content)
            setSavedCode(d.content)
          })
        } else {
          setCode('')
          setSavedCode('')
        }
      }
      return next
    })
  }

  async function saveCode(filename: string, content: string) {
    await fetch(`${API}/files/${filename}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    setSavedCode(content)
  }

  async function createComponent() {
    const rawName = prompt('Component name (e.g. Card):')
    if (!rawName) return
    const name = toComponentName(rawName)
    if (!name) return
    const filename = `${name}.tsx`
    const content = `import { tokens } from './tokens'\n\nexport default function ${name}() {\n  return (\n    <div className={tokens.layout.frame}>\n      <section className={\`\${tokens.surface.card} \${tokens.layout.section}\`}>\n        <span className={tokens.text.label}>new component</span>\n        <h2 className="text-xl font-bold tracking-normal">${name}</h2>\n        <p className={tokens.text.body}>\n          This component starts with Tailwind token recipes already wired in.\n        </p>\n      </section>\n    </div>\n  )\n}\n`
    await fetch(`${API}/files/${name}.tsx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    setFiles(prev => sortFiles([...prev, filename]))
    setPanes(prev => [...prev, { id: name, name, x: 60 + prev.length * 480, y: 80, width: 460, height: 260 }])
    openTab(filename)
  }

  async function deleteComponent(name: string) {
    const res = await fetch(`${API}/files/${name}.tsx`)
    const { content } = await res.json()
    const pane = panes.find(p => p.id === name)
    if (pane) deletedStack.current.push({ name, content, pane })
    await fetch(`${API}/files/${name}.tsx`, { method: 'DELETE' })
    setFiles(prev => prev.filter(f => f !== `${name}.tsx`))
    setPanes(prev => prev.filter(p => p.id !== name))
    closeTab(`${name}.tsx`)
  }

  async function undoDelete() {
    const last = deletedStack.current.pop()
    if (!last) return
    await fetch(`${API}/files/${last.name}.tsx`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: last.content }),
    })
    setFiles(prev => [...prev, `${last.name}.tsx`])
    setPanes(prev => [...prev, last.pane])
  }

  return (
    <div className="flex h-full w-full bg-[#1e1e1e] font-sans">
      {/* Editor panel */}
      <div ref={editorPanelRef} className="relative flex shrink-0 flex-col min-w-[200px] max-w-[800px]">
        {/* Tabs */}
        <div className="flex h-[38px] shrink-0 items-center overflow-x-auto border-b border-[#2d2d2d] bg-[#252526]">
          {openTabs.map(filename => (
            <div
              key={filename}
              onClick={() => openTab(filename)}
              className={`flex h-full cursor-pointer items-center gap-1.5 whitespace-nowrap border-r border-[#2d2d2d] px-[10px] pl-[14px] text-xs transition-colors ${selected === filename ? 'bg-[#1e1e1e] text-[#ccc]' : 'bg-transparent text-[#777] hover:bg-[#2a2a2b] hover:text-[#999]'}`}
            >
              {filename}
              <span
                onClick={e => { e.stopPropagation(); closeTab(filename) }}
                className="px-[2px] text-sm leading-none text-[#555] transition-colors hover:text-[#bbb]"
              >
                ×
              </span>
            </div>
          ))}
          <div onClick={createComponent} className="flex h-full shrink-0 cursor-pointer items-center px-3 text-base text-[#555] transition-colors hover:bg-[#2a2a2b] hover:text-[#bbb]">
            +
          </div>
        </div>

        {/* Editor */}
        {selected && (
          <Editor
            name={selected}
            code={code}
            onChange={setCode}
            onSave={(c) => saveCode(selected, c)}
          />
        )}

        {/* Bottom pill bar */}
        {(() => {
          const isTokens = selected === 'tokens.ts'
          const isDirty = isTokens && code !== savedCode
          const pillState = tokenSaved ? 'saved' : isDirty ? 'dirty' : 'idle'

          async function handleTokenClick() {
            if (isDirty) {
              await saveCode('tokens.ts', code)
              setTokenSaved(true)
              setTimeout(() => setTokenSaved(false), 2000)
            } else {
              openTab('tokens.ts')
            }
          }

          return (
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center pointer-events-none">
              <TokenPill state={pillState} onClick={handleTokenClick} />
            </div>
          )
        })()}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={(e) => {
          resizing.current = true
          resizeStart.current = { x: e.clientX, width: editorWidth }
          document.body.style.cursor = 'col-resize'
        }}
        className="w-1 shrink-0 cursor-col-resize bg-[#2d2d2d] transition-colors duration-150 hover:bg-[#4a4a4a]"
      />

      {/* Canvas */}
      <div className="relative flex-1">
        <Canvas
          panes={panes}
          setPanes={setPanes}
          selected={selected ? selected.replace(/\.(tsx|ts)$/, '') : null}
          setSelected={(id) => openTab(`${id}.tsx`)}
          onDelete={deleteComponent}
          onAddComponent={createComponent}
          onOpenTokens={() => openTab('tokens.ts')}
        />
      </div>
    </div>
  )
}
