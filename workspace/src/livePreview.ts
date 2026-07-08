// Live rendering for the hosted (static) build: the editor posts the
// in-memory component files into this iframe, and we transpile + evaluate
// them here so edits render without a dev server. In local dev this module
// is never loaded — Vite HMR handles updates.
import * as React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import * as lucideReact from 'lucide-react'
import { transform } from 'sucrase'

export type Files = Record<string, string>

const builtins: Record<string, unknown> = {
  react: React,
  'react/jsx-runtime': jsxRuntime,
  'react/jsx-dev-runtime': jsxRuntime,
  'lucide-react': lucideReact,
}

function resolveFile(spec: string, files: Files) {
  const base = spec.replace(/^\.\//, '').replace(/\.(tsx|ts)$/, '')
  for (const ext of ['.tsx', '.ts']) {
    if (files[base + ext] !== undefined) return base + ext
  }
  return null
}

export function evaluate(entry: string, files: Files): Record<string, unknown> {
  const cache = new Map<string, { exports: Record<string, unknown> }>()

  function load(filename: string): Record<string, unknown> {
    const cached = cache.get(filename)
    if (cached) return cached.exports

    const { code } = transform(files[filename], {
      transforms: ['typescript', 'jsx', 'imports'],
      jsxRuntime: 'automatic',
      production: true,
      filePath: filename,
    })

    const module = { exports: {} as Record<string, unknown> }
    cache.set(filename, module)

    const requireShim = (spec: string) => {
      if (builtins[spec]) return builtins[spec]
      const resolved = resolveFile(spec, files)
      if (!resolved) throw new Error(`Cannot resolve import "${spec}" in ${filename}`)
      return load(resolved)
    }

    new Function('require', 'module', 'exports', code)(requireShim, module, module.exports)
    return module.exports
  }

  const resolved = resolveFile(entry, files)
  if (!resolved) throw new Error(`Component file not found: ${entry}`)
  return load(resolved)
}
