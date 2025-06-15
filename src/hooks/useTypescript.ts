// src/hooks/useTypescript.ts

import { useEffect, useState, useCallback } from 'react'
import {
  loadTypeScript,
  DEFAULT_COMPILER_OPTIONS,
} from '@/utils/typescript-loader'

export type TypeScriptCompilerOptions = {
  target?: number
  module?: number
  strict?: boolean
  esModuleInterop?: boolean
  skipLibCheck?: boolean
  [key: string]: any
}

export type UseTypeScriptParams = {
  code: string
  compilerOptions?: TypeScriptCompilerOptions
}

export type UseTypeScriptResult = {
  javascript: string | null
  errors: string[]
  isLoading: boolean
  isReady: boolean
  compile: () => Promise<string | null>
}

export function useTypescript({
  code,
  compilerOptions = DEFAULT_COMPILER_OPTIONS,
}: UseTypeScriptParams): UseTypeScriptResult {
  const [javascript, setJavascript] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [typescript, setTypescript] = useState<any>(null)

  // Load TypeScript on mount
  useEffect(() => {
    let mounted = true

    async function initTypeScript() {
      setIsLoading(true)
      try {
        const ts = await loadTypeScript()
        if (mounted) {
          setTypescript(ts.typescript)
          setIsReady(true)
        }
      } catch (error) {
        console.error('Failed to load TypeScript:', error)
        if (mounted) {
          setErrors(['Failed to load TypeScript compiler'])
          setIsReady(false)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initTypeScript()
    return () => {
      mounted = false
    }
  }, [])

  const compile = useCallback(async (): Promise<string | null> => {
    if (!typescript || !code.trim()) {
      return null
    }

    try {
      setIsLoading(true)
      setErrors([])

      const result = typescript.transpile(code, {
        ...DEFAULT_COMPILER_OPTIONS,
        ...compilerOptions,
      })

      // Check for syntax errors by trying to create source file
      const sourceFile = typescript.createSourceFile(
        'temp.ts',
        code,
        compilerOptions.target || DEFAULT_COMPILER_OPTIONS.target,
        true
      )

      const diagnostics = typescript.getPreEmitDiagnostics(
        typescript.createProgram(['temp.ts'], compilerOptions, {
          getSourceFile: (fileName) =>
            fileName === 'temp.ts' ? sourceFile : undefined,
          writeFile: () => {},
          getCurrentDirectory: () => '',
          getDirectories: () => [],
          fileExists: () => true,
          readFile: () => '',
          getCanonicalFileName: (fileName) => fileName,
          useCaseSensitiveFileNames: () => true,
          getNewLine: () => '\n',
        })
      )

      if (diagnostics.length > 0) {
        const errorMessages = diagnostics.map((diagnostic) => {
          const message = typescript.flattenDiagnosticMessageText(
            diagnostic.messageText,
            '\n'
          )
          if (diagnostic.file && diagnostic.start) {
            const { line, character } =
              diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
            return `Line ${line + 1}, Column ${character + 1}: ${message}`
          }
          return message
        })
        setErrors(errorMessages)
      }

      setJavascript(result)
      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Compilation failed'
      setErrors([errorMessage])
      return null
    } finally {
      setIsLoading(false)
    }
  }, [typescript, code, compilerOptions])

  // Auto-compile when code changes and TypeScript is ready
  useEffect(() => {
    if (isReady && !isLoading && code.trim() && typescript) {
      // Call compile without dependency to avoid infinite loop
      const compileCode = async () => {
        try {
          setIsLoading(true)
          setErrors([])

          const result = typescript.transpile(code, {
            ...DEFAULT_COMPILER_OPTIONS,
            ...compilerOptions,
          })

          setJavascript(result)
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Compilation failed'
          setErrors([errorMessage])
        } finally {
          setIsLoading(false)
        }
      }

      compileCode()
    }
  }, [code, isReady, typescript, compilerOptions])

  return {
    javascript,
    errors,
    isLoading,
    isReady,
    compile,
  }
}
