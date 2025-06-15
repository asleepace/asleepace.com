import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getCursorSelection,
  setCursorPosition,
  type EditorRef,
  type RangeArray,
} from './selection'

/**
 * extend this as needed, for now just keeping the binary small
 */
export const SUPPORTED_LANGUAGES = {
  javascript: 'javascript',
  typescript: 'typescript',
  sql: 'sql',
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

// Global cache for hljs and languages
let hljs: any = null
const languageCache = new Map<string, any>()

async function loadHighlightJS() {
  if (hljs) return hljs

  const { default: highlight } = await import('highlight.js/lib/core')
  hljs = highlight
  return hljs
}

async function loadLanguage(lang: string) {
  if (languageCache.has(lang)) return languageCache.get(lang)

  let module
  switch (lang) {
    case 'javascript':
      module = await import('highlight.js/lib/languages/javascript')
      break
    case 'typescript':
      module = await import('highlight.js/lib/languages/typescript')
      break
    case 'sql':
      module = await import('highlight.js/lib/languages/sql')
      break
    default:
      return null
  }

  const language = module.default
  languageCache.set(lang, language)
  return language
}

/**
 * Highlight code with the given language
 */
async function highlightCode(
  code: string,
  language: SupportedLanguages
): Promise<string> {
  try {
    const syntax = await loadHighlightJS()

    // Ensure language is loaded and registered
    const lang = await loadLanguage(language)
    if (lang && !syntax.getLanguage(language)) {
      syntax.registerLanguage(language, lang)
    }

    return language && syntax.getLanguage(language)
      ? syntax.highlight(code, { language }).value
      : syntax.highlightAuto(code).value
  } catch (error) {
    console.error('Syntax highlighting failed:', error)
    return code // Return unhighlighted code as fallback
  }
}

/**
 * Handle syntax highlighting and cursor position for the editor.
 */
function useSyntax({
  editorRef,
  defaultCode = '',
  language = 'typescript',
}: SyntaxParams): SyntaxResult {
  const [rawCode, setRawCode] = useState(defaultCode)
  const [highlightedCode, setHighlightedCode] = useState(defaultCode)
  const [isInitialized, setIsInitialized] = useState(false)

  /**
   * since the html is regenerated each time the code changes,
   * we need to keep track of the last cursor position and
   * restore it after the html is re-rendered.
   */
  const lastCursorPosRef = useRef<RangeArray>([0, defaultCode.length])

  // Initialize highlighting for default code
  useEffect(() => {
    let mounted = true

    async function initHighlighting() {
      try {
        const highlighted = await highlightCode(defaultCode, language)
        if (mounted) {
          setHighlightedCode(highlighted)
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('Failed to initialize syntax highlighting:', error)
        if (mounted) {
          setHighlightedCode(defaultCode)
          setIsInitialized(true)
        }
      }
    }

    initHighlighting()
    return () => {
      mounted = false
    }
  }, [defaultCode, language])

  /**
   * callback passed to the <code> element onInput prop
   */
  const onChangeInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextRawCode = e.target.textContent || ''

      // Store cursor position before updating
      lastCursorPosRef.current = getCursorSelection(editorRef)

      // Update raw code immediately
      setRawCode(nextRawCode)

      // Update highlighted code asynchronously
      try {
        const highlighted = await highlightCode(nextRawCode, language)
        setHighlightedCode(highlighted)
      } catch (error) {
        console.error('Highlighting failed:', error)
        setHighlightedCode(nextRawCode)
      }
    },
    [language, editorRef]
  )

  // Restore cursor position after highlighting updates
  useEffect(() => {
    if (!editorRef.current || !isInitialized) return
    setCursorPosition(editorRef, lastCursorPosRef.current)
  }, [highlightedCode, editorRef, isInitialized])

  return [highlightedCode, onChangeInput, rawCode] as const
}

export type CodeBlockProps = {
  code: string
  lang?: SupportedLanguages
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
  onSubmit,
}: CodeBlockProps) {
  const [isReady, setIsReady] = useState(false)
  const editorRef = useRef<HTMLElement>(null)
  const isEditable = !readOnly

  // Pre-load highlight.js and language
  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const syntax = await loadHighlightJS()
        const language = await loadLanguage(lang)

        if (language && mounted) {
          syntax.registerLanguage(lang, language)
          setIsReady(true)
        }
      } catch (error) {
        console.error('Failed to load syntax highlighting:', error)
        if (mounted) setIsReady(true) // Continue without highlighting
      }
    }

    init()
    return () => {
      mounted = false
    }
  }, [lang])

  // Use syntax highlighting hook
  const [code, onUpdateCode, rawCode] = useSyntax({
    language: lang,
    defaultCode,
    editorRef,
  })

  const handleSubmit = useCallback(() => {
    onSubmit?.(editorRef.current?.textContent ?? rawCode)
  }, [rawCode, onSubmit])

  // Show loading state while initializing
  if (!isReady) {
    return (
      <div
        className={clsx(
          'w-full h-32 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center',
          className
        )}
      >
        <span className="text-gray-400 text-sm">Loading editor...</span>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'flex flex-col flex-1 grow h-full bg-transparent',
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
