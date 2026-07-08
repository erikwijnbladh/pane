# Pane

An infinite canvas for building React components. Write code in the editor, see your components live on the canvas.

![Pane](https://github.com/user-attachments/assets/29d974cf-78d4-4f28-8b4c-b7d3c9bbd49e)

## How it works

- The canvas runs a local Vite dev server in the background
- Each component is an iframe pointing at `localhost:5174?component=Name`
- With **live mode** on (default), edits are saved as you type and Vite's HMR pushes them into every pane — change the padding on `ButtonRoot` and watch the Button and Toolbar panes update together
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

The build outputs the editor to `app/dist` and copies the workspace preview into `app/dist/preview`.

The hosted build has no dev server, so live editing works differently there: the editor posts the in-memory files into each preview iframe, which transpiles them in the browser (Sucrase) and re-renders, with Tailwind's browser JIT generating CSS for any new classes you type. Edits are in-memory only — refresh resets them unless a backend is added.

## Usage

| Action | How |
|---|---|
| Open a component | Click its pane on the canvas |
| Edit | Write in the editor — live mode saves as you type; Cmd+S saves instantly |
| Toggle live mode | Click **live** in the tab bar (persists across sessions) |
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
├── scripts/
│   └── sync-demo-files.mjs   # Regenerates app/src/demoFiles.ts for the hosted demo
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
            ├── Button.tsx        # Root button — variants, sizes, icon, loading, disabled
            └── Toolbar.tsx       # Toolbar exercising five ButtonRoot use cases
```

## Stack

- **Canvas app** — React, Vite, Tailwind CSS, CodeMirror 6
- **Workspace** — React, Vite, Tailwind CSS, Lucide React
- **Server** — Node.js, Express

## Component-driven workflow

`Button.tsx` exports `ButtonRoot` — the single source of truth for every button. Its shared classes (gap, padding, radius, focus ring) live in one `base` string at the top of the file. Open it, tweak `gap-1.5` or `px-3`, and with live mode on the Button showcase and the Toolbar panes update as you type — no save step, no rebuild.

`Toolbar.tsx` deliberately exercises five distinct `ButtonRoot` use cases (icon-only toggles, disabled, loading, danger, primary icon+text) so a root-level change is immediately visible across real usage, not just an isolated preview.

## Token workflow

Open `tokens.ts`, change the small shared Tailwind class tokens, then save. New scaffolded components import those same classes.

## Hosted demo files

`app/src/demoFiles.ts` (the in-memory files used by the hosted build) is generated — don't edit it by hand. After changing anything in `workspace/src/components`, run `npm run sync:demo` (also runs automatically during `npm run build`).
