import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import javascript from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import sql from 'highlight.js/lib/languages/sql'
import syntax from 'highlight.js'

import {
  getCursorSelection,
  setCursorPosition,
  type EditorRef,
  type RangeArray,
} from './selection'

/**
 * extend this as needed, for now just keeping the binary small.
 */
export const SUPPORTED_LANGUAGES = {
  javascript,
  typescript: ts,
  sql,
} as const

export type SupportedLanguages = keyof typeof SUPPORTED_LANGUAGES

export type SyntaxParams = {
  editorRef: EditorRef
  defaultCode?: string
  language?: SupportedLanguages
}

export type SyntaxResult = [
  highlightedCode: string,
  onChangeInput: (e: React.ChangeEvent<HTMLInputElement>) => void,
  rawCode: string
]

/**
 * register all supported languages with highlight.js these may also need to be imported
 * in the main entry file and/or placed in the `./public/highlight.js` directory
 */
Object.entries(SUPPORTED_LANGUAGES).forEach(([name, language]) => {
  syntax.registerLanguage(name, language)
})

/**
 * a simple typesafe wrapper around syntax.highlight that allows for language selection
 * @param code - the code to highlight
 * @param language - the language to highlight the code in
 * @returns
 */
const markup = (code: string, language: SupportedLanguages) => {
  return language
    ? syntax.highlight(code, { language }).value
    : syntax.highlightAuto(code).value
}

/**
 * handle syntax highlighting and cursor position for the editor.
 */
export function useSyntax({
  editorRef,
  defaultCode = '',
  language = 'typescript',
}: SyntaxParams): SyntaxResult {
  const [rawCode, setRawCode] = useState(defaultCode)
  const [highlightedCode, setHighlightedCode] = useState(
    markup(defaultCode, language)
  )

  /**
   * since the html is regenerated each time the code changes,
   * we need to keep track of the last cursor position and
   * restore it after the html is re-rendered.
   */
  const lastCursorPosRef = useRef<RangeArray>([0, defaultCode.length])

  /**
   * callback passed to the <code> element onInput prop
   */
  const onChangeInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextRawCode = e.target.textContent || ''
      const highlighted = markup(nextRawCode, language)
      lastCursorPosRef.current = getCursorSelection(editorRef) // store before rendering
      setHighlightedCode(highlighted)
      setRawCode(nextRawCode)
    },
    [markup, language]
  )

  useEffect(() => {
    if (!editorRef.current) return
    setCursorPosition(editorRef, lastCursorPosRef.current) // restore once re-rendered
  }, [highlightedCode, editorRef])

  // return the code and the onChangeInput function
  return [highlightedCode, onChangeInput, rawCode] as const
}
