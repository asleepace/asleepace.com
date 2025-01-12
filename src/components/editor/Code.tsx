// import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react'
// import syntax from 'highlight.js'
// import javascript from 'highlight.js/lib/languages/javascript'
// import ts from 'highlight.js/lib/languages/typescript'
// import 'highlight.js/styles/atom-one-dark.css'
// import 'highlight.js/styles/base16/material-palenight.css'
// import { NodeSelector } from './NodeSelector'
// import { useCSS } from '@/hooks/useCSS'
// import clsx from 'clsx'

// const DEFAULT_THEME = '/styles/material-palenight.css'

// /**
//  * Register supported languages for syntax highlighting.
//  */
// syntax.registerLanguage('javascript', javascript)
// syntax.registerLanguage('typescript', ts)

// /**
//  * Props for the CodeBlock component.
//  */
// export type CodeBlockProps = {
//   type?: 'typescript' | 'javascript' | 'sql'
//   detectSyntax?: boolean
//   pathToCSSTheme?: string
//   className?: string
//   code: string
// }

// /**
//  * Displays a formatted code block with syntax highlighting.
//  *
//  * https://github.com/highlightjs/highlight.js/tree/main/src/styles
//  */
// export function Code({
//   code: initialCode,
//   pathToCSSTheme = DEFAULT_THEME,
//   className = 'p-4 px-6 rounded-lg',
//   detectSyntax = true,
// }: CodeBlockProps) {
//   const [code, setCode] = useState(initialCode)

//   useCSS({
//     path: pathToCSSTheme,
//   })

//   const editorRef = useRef<HTMLElement>(null)
//   const cursorPositionRef = useRef<number>(0)

//   const formattedCode = useMemo(() => {
//     return {
//       __html: detectSyntax
//         ? syntax.highlightAuto(code).value
//         : syntax.highlight(code, { language: 'typescript' }).value,
//     }
//   }, [code, detectSyntax])

//   useEffect(() => {
//     if (!editorRef.current) return
//     const selection = new NodeSelector(editorRef.current)
//     const range = selection.getSelection(cursorPositionRef.current)
//     if (range) {
//       document.getSelection()?.removeAllRanges()
//       document.getSelection()?.addRange(range)
//     }
//   }, [formattedCode])

//   const onInputFormatSyntax = useCallback(() => {
//     const selection = document.getSelection()
//     const range = selection?.getRangeAt(0)
//     if (!range || !editorRef.current) {
//       return console.warn('[CodeBlock] no range or editorRef')
//     }
//     const clonedRange = range.cloneRange()
//     console.log('[CodeBlock] clonedRange', clonedRange)
//     clonedRange.selectNodeContents(editorRef.current)
//     clonedRange.setEnd(range.endContainer, range.endOffset)
//     cursorPositionRef.current = clonedRange.toString().length
//     const originalText = editorRef.current.innerText
//     setCode(originalText)
//   }, [])

//   return (
//     <div
//       className={clsx(
//         'flex flex-col flex-1 flex-grow h-full bg-transparent',
//         className
//       )}
//     >
//       <pre className="w-full h-full bg-transparent">
//         <code
//           className="focus:ring-0 border-none focus-visible:outline-none w-full h-full bg-transparent"
//           dangerouslySetInnerHTML={formattedCode}
//           onInput={onInputFormatSyntax}
//           contentEditable={'true'}
//           defaultValue={''}
//           ref={editorRef}
//         />
//       </pre>
//     </div>
//   )
// }
import React, { useEffect, useRef, useMemo, useState, useCallback, type KeyboardEvent } from 'react'
import syntax from 'highlight.js'
import javascript from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import sql from 'highlight.js/lib/languages/sql'
import 'highlight.js/styles/atom-one-dark.css'
import 'highlight.js/styles/base16/material-palenight.css'
import { NodeSelector } from './NodeSelector'
import { useCSS } from '@/hooks/useCSS'
import clsx from 'clsx'

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

const useUndoRedo = (initialValue: string) => {
  const [history, setHistory] = useState([initialValue])
  const [currentIndex, setCurrentIndex] = useState(0)

  const push = useCallback((newValue: string) => {
    setHistory(prev => [...prev.slice(0, currentIndex + 1), newValue])
    setCurrentIndex(prev => prev + 1)
  }, [currentIndex])

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      return history[currentIndex - 1]
    }
    return history[currentIndex]
  }, [currentIndex, history])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1)
      return history[currentIndex + 1]
    }
    return history[currentIndex]
  }, [currentIndex, history])

  return { push, undo, redo }
}

export function Code({
  code: initialCode,
  pathToCSSTheme = DEFAULT_THEME,
  className = 'p-4 px-6 rounded-lg',
  detectSyntax = true,
  type = 'typescript',
  onChange,
  readOnly = false,
  placeholder = 'Type your code here...',
  onSave,
}: CodeBlockProps) {
  const [code, setCode] = useState(initialCode)
  const { push, undo, redo } = useUndoRedo(initialCode)
  const editorRef = useRef<HTMLElement>(null)
  const cursorPositionRef = useRef<number>(0)

  useCSS({ path: pathToCSSTheme })

  const formattedCode = useMemo(() => {
    if (!code && placeholder) {
      return { __html: `<span class="opacity-50">${placeholder}</span>` }
    }
    return {
      __html: detectSyntax
        ? syntax.highlightAuto(code).value
        : syntax.highlight(code, { language: type }).value,
    }
  }, [code, detectSyntax, type, placeholder])

  useEffect(() => {
    if (!editorRef.current) return
    const selection = new NodeSelector(editorRef.current)
    const range = selection.getSelection(cursorPositionRef.current)
    if (range) {
      document.getSelection()?.removeAllRanges()
      document.getSelection()?.addRange(range)
    }
  }, [formattedCode])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLElement>) => {
    // Handle tab key
    if (e.key === 'Tab') {
      e.preventDefault()
      document.execCommand('insertText', false, '  ')
    }

    // Handle undo/redo
    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        const newCode = undo()
        setCode(newCode)
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault()
        const newCode = redo()
        setCode(newCode)
      } else if (e.key === 's') {
        e.preventDefault()
        onSave?.(code)
      }
    }
  }, [code, undo, redo, onSave])

  const onInputFormatSyntax = useCallback(() => {
    if (!editorRef.current) return

    const selection = document.getSelection()
    const range = selection?.getRangeAt(0)
    
    if (!range) {
      return console.warn('[CodeBlock] no range')
    }

    const clonedRange = range.cloneRange()
    clonedRange.selectNodeContents(editorRef.current)
    clonedRange.setEnd(range.endContainer, range.endOffset)
    cursorPositionRef.current = clonedRange.toString().length

    const newCode = editorRef.current.innerText
    setCode(newCode)
    push(newCode)
    onChange?.(newCode)
  }, [onChange, push])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    document.execCommand('insertText', false, text)
  }, [])

  return (
    <div className={clsx(
      'flex flex-col flex-1 flex-grow h-full bg-transparent',
      className
    )}>
      <pre className="w-full h-full bg-transparent">
        <code
          className={clsx(
            'focus:ring-0 border-none focus-visible:outline-none w-full h-full bg-transparent text-slate-200',
            { 'cursor-text': !readOnly, 'cursor-default': readOnly }
          )}
          dangerouslySetInnerHTML={formattedCode}
          onInput={onInputFormatSyntax}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          contentEditable={!readOnly}
          ref={editorRef}
          spellCheck={false}
        />
      </pre>
    </div>
  )
}