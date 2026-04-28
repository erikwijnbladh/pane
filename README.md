# Pane

An infinite canvas for building React components. Write code in the editor, see your components live on the canvas.

![Pane](https://github.com/user-attachments/assets/29d974cf-78d4-4f28-8b4c-b7d3c9bbd49e)

## How it works

- The canvas runs a local Vite dev server in the background
- Each component is an iframe pointing at `localhost:5174?component=Name`
- Vite's HMR means changes appear instantly after Cmd+S
- Components are plain `.tsx` files on disk — git, imports, and agents all just work
- Vercel serves the editor app with a bundled static preview at `/preview`

## Getting started

```bash
git clone https://github.com/yourname/pane
cd pane
npm run install:all
npm run dev
```

Then open **http://localhost:3000**.

For a static production build:

```bash
npm run build
```

The build outputs the editor to `app/dist` and copies the workspace preview into `app/dist/preview`. Hosted edits are demo-only/in-memory unless a backend is added.

## Usage

| Action | How |
|---|---|
| Open a component | Click its pane on the canvas |
| Edit | Write in the editor, Cmd+S to save |
| New component | Click **+** in the tab bar |
| Delete component | Click **×** on the pane |
| Undo delete | Cmd+Z |
| Pan canvas | Two-finger scroll or click-drag |
| Zoom | Pinch or Cmd+scroll |
| Resize editor | Drag the divider |

## Structure

```
pane/
├── server.js          # Express API — reads/writes component files
├── app/               # Canvas UI (React + Vite, port 3000)
│   └── src/
│       ├── App.tsx    # Layout, state, file management
│       ├── Canvas.tsx # Infinite canvas, pan/zoom, panes
│       └── Editor.tsx # CodeMirror editor
└── workspace/         # Component sandbox (React + Vite, port 5174)
    └── src/
        ├── Preview.tsx          # Renders any component by URL param
        └── components/          # Your components live here
            ├── tokens.ts         # Small shared class tokens for scaffolds
            ├── Button.tsx        # Root button component
            └── Toolbar.tsx       # Three-button toolbar using ButtonRoot
```

## Stack

- **Canvas app** — React, Vite, Tailwind CSS, CodeMirror 6
- **Workspace** — React, Vite, Tailwind CSS, Lucide React
- **Server** — Node.js, Express

## Token workflow

Open `tokens.ts`, change the small shared Tailwind class tokens, then save. New scaffolded components import those same classes.
