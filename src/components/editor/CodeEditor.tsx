import { memo } from 'react'
import { Code } from './Code'

/**
 * # Code Editor
 *
 * A full code editor with WYSIWYG support which can handle different themese and customizations.
 * Displays a side bar with a list of different code blocks and allows the user to select a code block.
 */
function CodeEditor() {
  const code = 'console.log("Hello, World!");'

  return (
    <div className="flex flex-1 flex-grow flex-col w-full min-h-screen bg-editor-200">
      <Code code={code} lang="typescript" className="h-full p-8" />
    </div>
  )
}

export default memo(CodeEditor)
