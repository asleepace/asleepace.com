// src/components/CodeEditorLazy.tsx
import { lazy, Suspense } from 'react'

const CodeEditor = lazy(() => import('./CodeEditor'))

/**
 * Loading skeleton for the code editor
 */
function CodeEditorSkeleton() {
  return (
    <div className="flex flex-1 grow flex-col w-full min-h-screen bg-editor-200">
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
        <div className="flex gap-2">
          <div className="w-16 h-6 bg-gray-600 rounded animate-pulse" />
          <div className="w-16 h-6 bg-gray-600 rounded animate-pulse" />
          <div className="w-20 h-6 bg-gray-600 rounded animate-pulse" />
        </div>
      </div>
      <div className="flex-1 p-8">
        <div className="w-full h-full bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
          <span className="text-gray-400">Loading TypeScript compiler...</span>
        </div>
      </div>
    </div>
  )
}

export function CodeEditorLazy(props: any) {
  return (
    <Suspense fallback={<CodeEditorSkeleton />}>
      <CodeEditor {...props} />
    </Suspense>
  )
}
