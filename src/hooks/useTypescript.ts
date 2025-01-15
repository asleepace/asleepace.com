import { useCallback, useState } from 'react'
import tsc, {
  type CompilerOptions,
  type TranspileOptions,
  JSDocParsingMode,
  ModuleKind,
  ScriptTarget,
} from 'typescript'

const DEFAULT_TRANSPILE_OPTIONS: TranspileOptions = {
  fileName: 'index.ts',
  jsDocParsingMode: JSDocParsingMode.ParseAll,
}

const DEFAULT_COMPILER_OPTIONS: CompilerOptions = {
  module: ModuleKind.NodeNext,
  target: ScriptTarget.ES2015,
  alwaysStrict: true,
  strict: true,
}

export type TypescriptParams = {
  code: string
  transpileOptions?: Omit<TranspileOptions, 'compilerOptions'>
  compilerOptions?: CompilerOptions
}

/**
 * ## useTypescript(options)
 *
 * A hook that compiles TypeScript code to JavaScript and provides methods
 * for execution.
 */
export function useTypescript({
  code,
  transpileOptions = {},
  compilerOptions = {},
}: TypescriptParams) {
  const [javascript, setJavascript] = useState<string | undefined>()
  const [error, setError] = useState<Error | undefined>()

  /**
   * Compiles TypeScript code to JavaScript.
   */
  const compile = useCallback(async () => {
    try {
      const compiledJsOutput = tsc.transpileModule(code, {
        ...DEFAULT_TRANSPILE_OPTIONS,
        ...transpileOptions,
        compilerOptions: {
          ...DEFAULT_COMPILER_OPTIONS,
          ...compilerOptions,
        },
      })
      // console.log(compiledJsOutput)
      setJavascript(compiledJsOutput.outputText)
      setError(undefined)
      return compiledJsOutput.outputText
    } catch (error) {
      console.warn('[useTypescript] Failed to compile TypeScript code', error)
      if (error instanceof Error) {
        window.alert(error.message)
      }
      setError(error as Error)
    }
  }, [code, compilerOptions, transpileOptions])

  return {
    compile,
    javascript,
    error,
  }
}
