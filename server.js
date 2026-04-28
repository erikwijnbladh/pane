const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())

const COMPONENTS_DIR = path.join(__dirname, 'workspace/src/components')
const FILE_RE = /^[A-Za-z][A-Za-z0-9_-]*\.(tsx|ts)$/

function resolveFile(name) {
  if (!FILE_RE.test(name)) return null

  const filePath = path.resolve(COMPONENTS_DIR, name)
  const root = path.resolve(COMPONENTS_DIR)

  if (!filePath.startsWith(root + path.sep)) return null
  return filePath
}

// List all components
app.get('/api/files', (req, res) => {
  const files = fs.readdirSync(COMPONENTS_DIR).filter(f => f.endsWith('.tsx'))
  res.json(files)
})

// Read a component
app.get('/api/files/:name', (req, res) => {
  const filePath = resolveFile(req.params.name)
  if (!filePath) return res.status(400).json({ error: 'Invalid file name' })
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' })
  res.json({ content: fs.readFileSync(filePath, 'utf-8') })
})

// Create or update a component
app.post('/api/files/:name', (req, res) => {
  const filePath = resolveFile(req.params.name)
  if (!filePath) return res.status(400).json({ error: 'Invalid file name' })
  if (typeof req.body.content !== 'string') return res.status(400).json({ error: 'Missing content' })
  fs.writeFileSync(filePath, req.body.content)
  res.json({ ok: true })
})

// Delete a component
app.delete('/api/files/:name', (req, res) => {
  const filePath = resolveFile(req.params.name)
  if (!filePath || !req.params.name.endsWith('.tsx')) return res.status(400).json({ error: 'Invalid file name' })
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  res.json({ ok: true })
})

app.listen(3001, () => console.log('Pane server running on http://localhost:3001'))
