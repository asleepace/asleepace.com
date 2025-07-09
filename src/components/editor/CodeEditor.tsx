import { memo, useCallback, useEffect } from 'react'
import { Code } from './Code'

import { useTypescript } from '@/hooks/useTypescript'
import { useJSRuntime } from '@/hooks/useJSRuntime'
import { useStore } from '@/hooks/useStore'
import { CodeToolbar } from './CodeToolbar'
import { DEFAULT_COMPILER_OPTIONS } from '@/lib/utils/typescript-loader'

export type CodeEditorProps = {
  persist?: boolean
  code: string
}

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

/**
 * # Code Editor
 *
 * A full code editor with WYSIWYG support which can handle different themes and customizations.
 * Displays a side bar with a list of different code blocks and allows the user to select a code block.
 *
 */
function CodeEditor({ code: defaultCode }: CodeEditorProps) {
  // NOTE: the code is persisted to localStorage
  const [data, setCode] = useStore('code', {
    code: defaultCode,
    lang: 'typescript',
  })

  const ts = useTypescript({
    code: data.code,
    compilerOptions: {
      // target: 2, // ES2015
      // module: 1, // CommonJS
      ...DEFAULT_COMPILER_OPTIONS,
    },
  })

  const [output, execute] = useJSRuntime(ts.javascript || undefined)

  useEffect(() => {
    console.log(output)
  }, [output])

  const onSave = useCallback(() => {
    console.log('save code')
    setCode({ code: data.code, lang: 'typescript' })
    const saveFileName = window.prompt('Save file as:', `code_snippet_${Date.now()}.ts`)
    if (!saveFileName) return
    const blob = new Blob([data.code ?? ''], {
      type: 'text/plain',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = saveFileName
    a.click()
    URL.revokeObjectURL(url)
    requestAnimationFrame(() => {
      a.remove()
    })
  }, [data.code, setCode])

  const onSettings = useCallback(() => {
    window.alert('Not logged in!')
  }, [])

  const runJs = useCallback(async () => {
    try {
      const jsCode = await ts.compile()
      if (!jsCode) {
        throw new Error('No code to execute!')
      }
      execute(jsCode)
    } catch (error) {
      console.warn('[CodeEditor] runJs error:', error)
    }
  }, [ts, execute])

  // Show loading state while TypeScript is loading
  console.log('CodeEditor render:', {
    isLoading: ts.isLoading,
    isReady: ts.isReady,
    hasJavaScript: !!ts.javascript,
    errors: ts.errors,
  })

  if (ts.isLoading || !ts.isReady) {
    return <CodeEditorSkeleton />
  }

  return (
    <div className="flex flex-1 grow flex-col w-full min-h-screen bg-editor-200">
      <CodeToolbar
        onRun={runJs}
        onSave={onSave}
        onSettings={onSettings}
        isCompiling={ts.isLoading}
        errors={ts.errors}
      />
      <Code
        onSubmit={(code) => setCode({ code, lang: 'typescript' })}
        className="h-full basis-3/4 p-8"
        lang="typescript"
        code={data.code}
      />

      {/* Show compilation errors */}
      {ts.errors.length > 0 && (
        <div className="bg-red-900/20 border-t border-red-800 p-4">
          <h4 className="text-red-400 font-medium mb-2">TypeScript Errors:</h4>
          <ul className="text-red-300 text-sm space-y-1">
            {ts.errors.map((error, index) => (
              <li key={index} className="font-mono">
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default memo(CodeEditor)
