import { useState, useEffect, useRef } from 'react'
import Canvas from './Canvas'
import Editor from './Editor'
import { DEMO_FILE_CONTENTS } from './demoFiles'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])
const IS_DEV_APP = LOCAL_HOSTS.has(window.location.hostname) && window.location.port === '3000'
const API = IS_DEV_APP ? 'http://localhost:3001/api' : null
const PREVIEW_URL = IS_DEV_APP ? 'http://localhost:5174' : '/preview/index.html'
const DEMO_FILES = ['Button.tsx', 'Toolbar.tsx']

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
  return [...files].sort((a, b) => a.localeCompare(b))
}

function initialPaneFor(filename: string, index: number): Pane {
  const name = filename.replace('.tsx', '')
  const presets: Record<string, Partial<Pane>> = {
    'Button.tsx': { x: 80, y: 90, width: 420, height: 300 },
    'Toolbar.tsx': { x: 80, y: 490, width: 560, height: 120 },
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
  const [files, setFiles] = useState<string[]>([])
  const [editorWidth, setEditorWidth] = useState(420)
  const [liveMode, setLiveMode] = useState(() => localStorage.getItem('pane-live') !== 'off')
  const deletedStack = useRef<{ name: string; content: string; pane: Pane }[]>([])
  const demoFiles = useRef<Record<string, string>>({ ...DEMO_FILE_CONTENTS })
  const resizing = useRef(false)
  const resizeStart = useRef({ x: 0, width: 0 })
  const editorPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchFiles() }, [])

  useEffect(() => { localStorage.setItem('pane-live', liveMode ? 'on' : 'off') }, [liveMode])

  // Hosted demo: no dev server, so hand each preview iframe the in-memory
  // files when it asks, and rebroadcast on every save (see broadcastFiles)
  useEffect(() => {
    if (API) return
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'pane-ready' && e.source) {
        ;(e.source as Window).postMessage({ type: 'pane-files', files: { ...demoFiles.current } }, '*')
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // Live mode: debounce-save while typing so HMR cascades edits into every pane
  useEffect(() => {
    if (!liveMode || !selected || code === savedCode) return
    const filename = selected
    const timer = setTimeout(() => saveCode(filename, code), 500)
    return () => clearTimeout(timer)
  }, [code, savedCode, selected, liveMode])

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

  async function listFiles() {
    if (!API) return sortFiles(Object.keys(demoFiles.current))

    try {
      const res = await fetch(`${API}/files`)
      if (!res.ok) throw new Error('Could not list files')
      return sortFiles(await res.json())
    } catch {
      return sortFiles(Object.keys(demoFiles.current))
    }
  }

  async function readFile(filename: string) {
    if (!API) return demoFiles.current[filename] ?? null

    try {
      const res = await fetch(`${API}/files/${filename}`)
      if (!res.ok) throw new Error('Could not read file')
      const { content } = await res.json()
      return content as string
    } catch {
      return demoFiles.current[filename] ?? null
    }
  }

  function broadcastFiles() {
    const files = { ...demoFiles.current }
    document.querySelectorAll('iframe').forEach(frame => {
      ;(frame as HTMLIFrameElement).contentWindow?.postMessage({ type: 'pane-files', files }, '*')
    })
  }

  async function writeFile(filename: string, content: string) {
    demoFiles.current[filename] = content

    if (!API) return broadcastFiles()

    await fetch(`${API}/files/${filename}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
  }

  async function removeFile(filename: string) {
    delete demoFiles.current[filename]

    if (!API) return

    await fetch(`${API}/files/${filename}`, { method: 'DELETE' })
  }

  async function fetchFiles() {
    const data = await listFiles()
    setFiles(data)
    setPanes(data.filter(file => DEMO_FILES.includes(file)).map(initialPaneFor))
    openTab('tokens.ts')
  }

  async function openTab(filename: string) {
    // Flush unsaved edits so switching tabs never silently drops them
    if (selected && selected !== filename && code !== savedCode) {
      await saveCode(selected, code)
    }
    const content = await readFile(filename)
    if (content === null) return
    setCode(content)
    setSavedCode(content)
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
          readFile(nextSelected).then(content => {
            if (content === null) return
            setCode(content)
            setSavedCode(content)
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
    await writeFile(filename, content)
    setSavedCode(content)
  }

  async function createComponent() {
    const rawName = prompt('Component name (e.g. Card):')
    if (!rawName) return
    const name = toComponentName(rawName)
    if (!name) return
    const filename = `${name}.tsx`
    const content = `import { cx, tokens } from './tokens'\n\nexport default function ${name}() {\n  return (\n    <div className={tokens.frame}>\n      <section className={cx(tokens.card, tokens.section)}>\n        <span className={tokens.label}>new component</span>\n        <h2 className="text-xl font-bold tracking-normal">${name}</h2>\n        <p className={tokens.body}>\n          This component starts with the small shared token file wired in.\n        </p>\n      </section>\n    </div>\n  )\n}\n`
    await writeFile(filename, content)
    setFiles(prev => prev.includes(filename) ? prev : sortFiles([...prev, filename]))
    setPanes(prev => [...prev, { id: name, name, x: 60 + prev.length * 480, y: 80, width: 460, height: 260 }])
    openTab(filename)
  }

  async function deleteComponent(name: string) {
    const filename = `${name}.tsx`
    const content = await readFile(filename)
    if (content === null) return
    const pane = panes.find(p => p.id === name)
    if (pane) deletedStack.current.push({ name, content, pane })
    await removeFile(filename)
    setFiles(prev => prev.filter(f => f !== filename))
    setPanes(prev => prev.filter(p => p.id !== name))
    closeTab(filename)
  }

  async function undoDelete() {
    const last = deletedStack.current.pop()
    if (!last) return
    await writeFile(`${last.name}.tsx`, last.content)
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
                {selected === filename && code !== savedCode
                  ? <span className="text-[9px] leading-none text-[#d7a94c]">●</span>
                  : '×'}
              </span>
            </div>
          ))}
          <div onClick={createComponent} className="flex h-full shrink-0 cursor-pointer items-center px-3 text-base text-[#555] transition-colors hover:bg-[#2a2a2b] hover:text-[#bbb]">
            +
          </div>
          <div
            onClick={() => setLiveMode(v => !v)}
            title={liveMode ? 'Live save on — edits save as you type' : 'Live save off — Cmd+S to save'}
            className={`ml-auto flex h-full shrink-0 cursor-pointer select-none items-center gap-1 px-3 font-mono text-[11px] transition-colors ${liveMode ? 'text-[#d7a94c]' : 'text-[#555] hover:text-[#999]'}`}
          >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${liveMode ? 'bg-[#d7a94c]' : 'bg-[#555]'}`} />
            live
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
          previewUrl={PREVIEW_URL}
        />
      </div>
    </div>
  )
}
