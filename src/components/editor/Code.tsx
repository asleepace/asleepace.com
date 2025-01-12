import React, {
  useEffect,
  useRef,
  useMemo,
  useState,
  useCallback,
  type KeyboardEvent,
  startTransition,
  useTransition,
  useLayoutEffect,
} from 'react'
import { useStore } from '@nanostores/react' // For state persistence across hydration
import syntax from 'highlight.js'
import javascript from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import sql from 'highlight.js/lib/languages/sql'
import 'highlight.js/styles/atom-one-dark.css'
import 'highlight.js/styles/base16/material-palenight.css'

import { getCursorSelection, setCursorPosition } from './selection'

import clsx from 'clsx'

import { useUndoRedo } from './useUndoRedo'
import { useSyntax } from './useSyntax'

export const prerender = false

const DEFAULT_THEME = '/styles/material-palenight.css'

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
  type?: keyof typeof SUPPORTED_LANGUAGES
  detectSyntax?: boolean
  pathToCSSTheme?: string
  className?: string
  code: string
  onChange?: (code: string) => void
  readOnly?: boolean
  placeholder?: string
  onSave?: (code: string) => void
}

export function Code({
  code: defaultCode,
  pathToCSSTheme = DEFAULT_THEME,
  className = 'p-4 px-6 rounded-lg',
  placeholder = 'Type your code here...',
  type = 'typescript',
  readOnly = false,
  onChange,
  onSave,
}: CodeBlockProps) {
  const { push, undo, redo } = useUndoRedo(defaultCode)
  const editorRef = useRef<HTMLElement>(null)

  // NOTE: Highlighting the code is handled by the useSyntax hook
  const [code, onUpdateCode] = useSyntax({
    language: type,
    defaultCode,
    editorRef,
  })

  return (
    <div
      className={clsx(
        'flex flex-col flex-1 flex-grow h-full bg-transparent',
        className
      )}
    >
      <pre className="w-full h-full bg-transparent relative">
        <code
          autoFocus={true}
          className={clsx(
            'focus:ring-0 border-none block focus-visible:outline-none p-2 w-full h-full bg-[rgba(255,255,255,0.02)] rounded-lg bg-transparent',
            { 'cursor-text': !readOnly, 'cursor-default': readOnly }
          )}
          dangerouslySetInnerHTML={{ __html: code }}
          onInput={onUpdateCode}
          contentEditable={!readOnly}
          spellCheck={false}
          ref={editorRef}
          onBlur={() => {
            console.log('editor blurred!')
          }}
        />
      </pre>
    </div>
  )
}
