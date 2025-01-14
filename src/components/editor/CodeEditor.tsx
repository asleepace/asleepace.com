import { memo, useCallback } from 'react'
import { Code } from './Code'

import { useTypescript } from '@/hooks/useTypescript'
import { ModuleKind, ScriptTarget } from 'typescript'
import { useJSRuntime } from '@/hooks/useJSRuntime'
import { useStore } from '@/hooks/useStore'

export type CodeEditorProps = {
  persist?: boolean
  code: string
}

/**
 * # Code Editor
 *
 * A full code editor with WYSIWYG support which can handle different themese and customizations.
 * Displays a side bar with a list of different code blocks and allows the user to select a code block.
 */
function CodeEditor({ code: defaultCode }: CodeEditorProps) {
  const [data, setCode] = useStore('code', {
    lang: 'typescript',
    code: defaultCode,
  })

  const onSubmit = useCallback((raw: string) => {
    console.log('[code] submitting code!')
    setCode({ code: raw, lang: 'typescript' })
  }, [])

  const ts = useTypescript({
    code: data.code,
    compilerOptions: {
      target: ScriptTarget.ES2015,
      module: ModuleKind.CommonJS,
    },
  })

  const js = useJSRuntime(ts.javascript)

  return (
    <div className="flex flex-1 flex-grow flex-col w-full min-h-screen bg-editor-200">
      <Code
        code={data.code}
        lang="typescript"
        className="h-full basis-3/4 p-8"
        onSubmit={onSubmit}
      />
      <button
        className="bg-blue-500 p-2 rounded-lg w-16 absolute top-8 right-8 z-10"
        onClick={() => ts.compile()}
      >
        {'►'}
      </button>
    </div>
  )
}

export default memo(CodeEditor)
