// src/utils/typescript-loader.ts

let typescript: any = null
let tsEnums: any = null

export async function loadTypeScript() {
  if (typescript && tsEnums) return { typescript, ...tsEnums }

  try {
    const ts = await import('typescript')
    typescript = ts.default || ts

    // Extract commonly used enums
    tsEnums = {
      ModuleKind: typescript.ModuleKind,
      ScriptTarget: typescript.ScriptTarget,
      CompilerOptions: typescript.CompilerOptions,
    }

    return { typescript, ...tsEnums }
  } catch (error) {
    console.error('Failed to load TypeScript:', error)
    throw error
  }
}

// Default compiler options as constants (to avoid loading TS for defaults)
export const DEFAULT_COMPILER_OPTIONS = {
  target: 1, // ES5 = 1, ES2015 = 2
  module: 1, // CommonJS = 1, ES2015 = 5
  strict: true,
  esModuleInterop: true,
  skipLibCheck: true,
}
