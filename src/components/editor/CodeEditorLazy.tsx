// src/components/CodeEditorLazy.tsx
import { lazy, Suspense } from 'react'

const CodeEditor = lazy(() => import('./CodeEditor'))



export function CodeEditorLazy(props: any) {
  return (
    <CodeEditor {...props} />
  )
}
