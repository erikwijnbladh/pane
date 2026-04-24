import CodeMirror from '@uiw/react-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { EditorView } from '@codemirror/view'
import { useEffect, useRef } from 'react'

type Props = {
  name: string
  code: string
  onChange: (code: string) => void
  onSave: (code: string) => void
}

const extensions = [
  javascript({ jsx: true, typescript: true }),
  EditorView.lineWrapping,
]

export default function Editor({ name, code, onChange, onSave }: Props) {
  const codeRef = useRef(code)
  codeRef.current = code

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        onSave(codeRef.current)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onSave])

  return (
    <CodeMirror
      value={code}
      extensions={extensions}
      theme={vscodeDark}
      onChange={onChange}
      className="flex-1 overflow-auto text-[13px] font-mono"
      basicSetup={{
        lineNumbers: true,
        foldGutter: false,
        dropCursor: false,
        allowMultipleSelections: false,
        indentOnInput: true,
        tabSize: 2,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
      }}
    />
  )
}
