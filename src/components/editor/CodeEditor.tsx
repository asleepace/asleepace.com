import { memo, useCallback } from 'react'
import { Code } from './Code'

import { useTypescript } from '@/hooks/useTypescript'
import { ModuleKind, ScriptTarget } from 'typescript'
import { useJSRuntime } from '@/hooks/useJSRuntime'
import { useStore } from '@/hooks/useStore'
import { CodeToolbar } from './CodeToolbar'

export type CodeEditorProps = {
  persist?: boolean
  code: string
}

/**
 * # Code Editor
 *
 * A full code editor with WYSIWYG support which can handle different themese and customizations.
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
      target: ScriptTarget.ES2015,
      module: ModuleKind.CommonJS,
    },
  })

  const [output, execute] = useJSRuntime(ts.javascript)

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
  }, [output, setCode])

  const onSettings = useCallback(() => {
    window.alert('Not logged in!')
  }, [])

  const runJs = useCallback(async () => {
    try {
      const jsCode = await ts.compile()
      if (!jsCode) {
        throw new Error('no code to execute!')
      }
      execute(jsCode)
    } catch (error) {
      console.warn('[CodeEditor] runJs error:', error)
    }
  }, [ts, execute])

  return (
    <div className="flex flex-1 grow flex-col w-full min-h-screen bg-editor-200">
      <CodeToolbar onRun={runJs} onSave={onSave} onSettings={onSettings} />
      <Code
        onSubmit={(code) => setCode({ code, lang: 'typescript' })}
        className="h-full basis-3/4 p-8"
        lang="typescript"
        code={data.code}
      />
    </div>
  )
}

export default memo(CodeEditor)
