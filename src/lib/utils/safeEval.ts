type GlobalObjects = keyof typeof globalThis & string

const ALLOWED_GLOBALS: GlobalObjects[] = [
  'console',
  'setTimeout',
  'fetch',
  'Array',
  'Object',
  'JSON',
  'Math',
]

/**
 *
 *  Create a safe execution context to run the code in, with the given context and allowed globals.
 *  The context is an object with keys and values that will be available to the code, and the globals
 *  are the global objects that can be accessed by the code.
 *
 */
function createSafeContext(allowedGlobals: GlobalObjects[]) {
  const ctx = Object.create(null)

  Object.entries(ctx).forEach(([key, value]) => {
    ctx[key] = value
  })

  Object.values(allowedGlobals).forEach((item) => {
    ctx[item] = globalThis[item]
  })

  return new Proxy(ctx, {
    has() {
      return false
    },
    get(target, prop) {
      if (prop in target || allowedGlobals.includes(prop as GlobalObjects)) {
        return target[prop]
      } else {
        throw new Error(
          `[safeEval] access to global '${String(prop)}' is not allowed.`
        )
      }
    },
  })
}

/**
 *  ## Safe Eval
 *
 *  Attempts to evaluate a piece of code safely, returning null if an error occurs.
 *  You can pass in a custom context and/or a list of allowed global objects which
 *  can be accessed by the code.
 *
 * ```ts
 * const output = await safeEval("1 + 1")            // 2
 * const output = await safeEval("x + 1", { x: 5 })  // 6
 * const output = await safeEval("Number(x)", { x: 7 }, ['Number'])  // 7
 * ```
 *
 */
export async function safeEval<T>(
  code: string,
  context: any = {}
): Promise<T | Error> {
  try {
    const safeEvalFunc = new Function(
      ...Object.keys(context),
      `"use strict"; return ${code};`
    )

    const ctx = createSafeContext(ALLOWED_GLOBALS)
    let output = safeEvalFunc.call(ctx, ...Object.values(context))

    console.log('[api/exec] output:', output)

    if (output instanceof Function) {
      output = output.call(ctx)
    }

    console.log('[api/exec] safeEvalResult:', output)

    if (output instanceof Promise) {
      return await output
    } else {
      return output
    }
  } catch (e) {
    return e as Error
  }
}
