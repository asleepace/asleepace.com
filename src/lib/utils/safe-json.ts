/**
 * Alias for `Record<string, any>` for generic json objects.
 */
export type AnyJson = Record<string, any>

/**
 * Extract JSON object returned by an LLM by finding first and last index of
 * opening brackets, then parsing as JSON. Returns a result tuple.
 */
export function parseJsonSafe<T = AnyJson>(jsonStr: string): [T, undefined] | [undefined, Error] {
  try {
    const openBracket = jsonStr.indexOf('{')
    const closeBracket = jsonStr.lastIndexOf('}') + 1
    const jsonContent = jsonStr.slice(openBracket, closeBracket)
    const jsonObject = JSON.parse(jsonContent)
    return [jsonObject, undefined]
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    console.warn('[safe-json] failed to parse:', err.message, e)
    return [undefined, err]
  }
}
