import { Code } from './Code'

/**
 * # Code Editor
 *
 * A full code editor with WYSIWYG support which can handle different themese and customizations.
 * Displays a side bar with a list of different code blocks and allows the user to select a code block.
 */
export default function CodeEditor() {
  const code = 'console.log("Hello, World!");'

  return (
    <div className="flex flex-1 flex-grow flex-col w-full min-h-screen bg-editor-200">
      <Code code={code} detectSyntax={false} className="h-full p-8" />
    </div>
  )
}
