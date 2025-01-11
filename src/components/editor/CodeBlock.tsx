import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import syntax from 'highlight.js'
import javascript from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import 'highlight.js/styles/atom-one-dark.css'
import 'highlight.js/styles/base16/material-palenight.css'
import { useCssStyle } from '@/hooks/useCssStyle'
import { NodeSelector } from './NodeSelector'

/**
 * Register supported languages for syntax highlighting.
 */
syntax.registerLanguage('javascript', javascript)
syntax.registerLanguage('typescript', ts)

/**
 * Props for the CodeBlock component.
 */
export type CodeBlockProps = {
  type?: 'typescript' | 'javascript' | 'sql'
  code: string
}

/**
 * Displays a formatted code block with syntax highlighting.
 *
 * https://github.com/highlightjs/highlight.js/tree/main/src/styles
 */
export function CodeBlock({ code: initialCode }: CodeBlockProps) {
  const [isSyntaxDetectionEnabled, setSyntaxDetectionEnabled] = useState(true)
  const [code, setCode] = useState(initialCode)

  useCssStyle({
    path: require('highlight.js/styles/base16/material-palenight.css'),
  })

  const editorRef = useRef<HTMLElement>(null)
  const cursorPositionRef = useRef<number>(0)

  const formattedCode = useMemo(() => {
    return {
      __html: isSyntaxDetectionEnabled
        ? syntax.highlightAuto(code).value
        : syntax.highlight(code, { language: 'typescript' }).value,
    }
  }, [code])

  useEffect(() => {
    if (!editorRef.current) return
    const selection = new NodeSelector(editorRef.current)
    const range = selection.getSelection(cursorPositionRef.current)
    if (range) {
      document.getSelection()?.removeAllRanges()
      document.getSelection()?.addRange(range)
    }
  }, [formattedCode])

  const onInputFormatSyntax = useCallback(() => {
    const selection = document.getSelection()
    const range = selection?.getRangeAt(0)
    if (!range || !editorRef.current) {
      return console.warn('[CodeBlock] no range or editorRef')
    }
    const clonedRange = range.cloneRange()
    clonedRange.selectNodeContents(editorRef.current)
    clonedRange.setEnd(range.endContainer, range.endOffset)
    cursorPositionRef.current = clonedRange.toString().length
    const originalText = editorRef.current.innerText
    setCode(originalText)
  }, [])

  return (
    <div className="p-4 px-6 rounded-lg flex flex-1 flex-col">
      <pre>
        <code
          className="focus:ring-0 border-none focus-visible:outline-none"
          dangerouslySetInnerHTML={formattedCode}
          onInput={onInputFormatSyntax}
          contentEditable={'true'}
          defaultValue={''}
          ref={editorRef}
        />
      </pre>
    </div>
  )
}