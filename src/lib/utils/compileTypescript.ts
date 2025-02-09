import tsc, { type TranspileOptions, type CompilerOptions } from 'typescript'

/**
 * ## Compile TypeScript
 *
 * Transpile TypeScript code to JavaScript with the specified compiler options.
 * The default compiler options are:
 *
 * - module: NodeNext
 * - target: ES2015
 * - alwaysStrict: true
 * - strict: true
 *
 * ```ts
 * // example usage
 * const code = `
 *   export function hello() {
 *     console.log('Hello, world!');
 *   }
 * `
 *
 * compileTypescript(code)
 * ```
 */
export function compileTypescript(
  code: string,
  compilerOptions: CompilerOptions = {},
  transpileOptions: TranspileOptions = {}
) {
  return tsc.transpileModule(code, {
    compilerOptions: {
      module: tsc.ModuleKind.NodeNext,
      target: tsc.ScriptTarget.ES2015,
      alwaysStrict: true,
      strict: true,
      ...compilerOptions,
    },
    transformers: {},
    ...transpileOptions,
  })
}
