import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from 'react'
import javascript from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import sql from 'highlight.js/lib/languages/sql'
import syntax from 'highlight.js'

import {
  getCursorSelection,
  setCursorPosition,
  type EditorRef,
} from './selection'

type SyntaxParams = {
  editorRef: EditorRef
  initialCode: string
  language?: string
}

// Register all supported languages
const SUPPORTED_LANGUAGES = {
  javascript,
  typescript: ts,
  sql,
} as const

Object.entries(SUPPORTED_LANGUAGES).forEach(([name, language]) => {
  syntax.registerLanguage(name, language)
})

type RangeArray = [start: number, end: number]

/**
 * Call this function before updating the UI to save the current selection,
 * and caret position, which will be used to restore it later.
 */
function getTextContentRange(editorRef: EditorRef) {
  if (!editorRef.current) {
    throw Error('editorRef is null')
  }

  const selection = window.getSelection()

  if (!selection?.rangeCount) {
    throw Error('no selection ranges')
  }
  const caretPos = selection?.getRangeAt(0)

  if (!caretPos) {
    throw Error('no range found at index 0')
  }

  // close the range at the caret postion
  const preCaretRange = caretPos.cloneRange()
  preCaretRange.selectNodeContents(editorRef.current)
  preCaretRange.setEnd(caretPos.startContainer, caretPos.startOffset)

  // convert the range to a string
  const caretStartPos = preCaretRange.toString().length
  const caretEndPos = caretStartPos + caretPos.toString().length

  // return the range as an array
  return [caretStartPos, caretEndPos] as RangeArray
}

/**
 * This hook handles parsing raw code into highlighted HTML code, updating the editor and
 * maintaining the cursor position.
 */
export function useSyntax({ editorRef, initialCode, language }: SyntaxParams) {
  const markup = useCallback(
    (code: string) => {
      return language
        ? syntax.highlight(code, { language }).value
        : syntax.highlightAuto(code).value
    },
    [language]
  )

  // NOTE: We use useTransition to avoid blocking the UI when parsing the code
  const [highlightedCode, setHighlightedCode] = useState(markup(initialCode))

  // TODO: note sure if this is needed
  const [isParsing, setParsing] = useTransition()

  // keeps track of the last cursor postion
  const lastCursorPosRef = useRef<RangeArray>([0, initialCode.length])

  // callback for editable code element
  const onChangeInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const highlighted = markup(e.target.textContent || '')
      lastCursorPosRef.current = getCursorSelection(editorRef) // store before rendering
      setHighlightedCode(highlighted)
      // setParsing(() => {
      //   const highlighted = markup(e.target.textContent || '')
      //   lastCursorPosRef.current = getCursorSelection(editorRef) // store before rendering
      //   setHighlightedCode(highlighted)
      // })
    },
    [markup, setParsing]
  )

  // restore the cursor position after the code is parsed
  useEffect(() => {
    if (!editorRef.current) return
    // if (isParsing) return

    // updates are handle by browser apis
    setCursorPosition(editorRef, lastCursorPosRef.current)
  }, [highlightedCode, editorRef, isParsing])

  // return the code and the onChangeInput function
  return [highlightedCode, onChangeInput, isParsing] as const
}
