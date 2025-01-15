import { useCallback, useRef } from 'react'
import syntax from 'highlight.js'
import javascript from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import sql from 'highlight.js/lib/languages/sql'
import 'highlight.js/styles/atom-one-dark.css'
import 'highlight.js/styles/base16/material-palenight.css'

import clsx from 'clsx'

import { useUndoRedo } from './useUndoRedo'
import { useSyntax } from './useSyntax'

// Register all supported languages
const SUPPORTED_LANGUAGES = {
  javascript,
  typescript: ts,
  sql,
} as const

Object.entries(SUPPORTED_LANGUAGES).forEach(([name, language]) => {
  syntax.registerLanguage(name, language)
})

export type CodeBlockProps = {
  code: string
  lang?: keyof typeof SUPPORTED_LANGUAGES
  className?: string
  readOnly?: boolean
  onChange?: (code: string) => void
  onSubmit?: (code: string) => void
}

/**
 * ## Code
 *
 * An editable code block which can shows syntax highlighting.
 */
export function Code({
  code: defaultCode,
  className = 'p-4 px-6 rounded-lg',
  lang = 'typescript',
  readOnly = false,
  onChange,
  onSubmit,
}: CodeBlockProps) {
  const { push, undo, redo } = useUndoRedo(defaultCode)
  const editorRef = useRef<HTMLElement>(null)

  const isEditable = !readOnly

  // NOTE: Highlighting the code is handled by the useSyntax hook
  const [code, onUpdateCode, rawCode] = useSyntax({
    language: lang,
    defaultCode,
    editorRef,
  })

  const handleSubmit = useCallback(() => {
    onSubmit?.(editorRef.current?.textContent ?? code)
  }, [code, onSubmit])

  return (
    <div
      className={clsx(
        'flex flex-col flex-1 flex-grow h-full bg-transparent',
        className
      )}
    >
      <pre className="w-full h-full bg-transparent relative">
        <code
          dangerouslySetInnerHTML={{ __html: code }}
          className={clsx(
            'focus:ring-0 border-none block focus-visible:outline-none p-3 w-full h-full rounded-lg bg-transparent',
            { 'cursor-text': isEditable, 'cursor-default': readOnly }
          )}
          onInput={onUpdateCode}
          onSubmit={onSubmit ? handleSubmit : undefined}
          contentEditable={isEditable}
          onBlur={handleSubmit}
          spellCheck={false}
          autoFocus={true}
          ref={editorRef}
        />
      </pre>
    </div>
  )
}
