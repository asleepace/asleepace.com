export interface JSRuntimeOutput {
  result: any
  error?: {
    message: string
    stack?: string
  }
  loading: boolean
}

function makeJsRunner(code: string) {
  return `new Function('context', \`
    with (context) {
      return (async () => {
        /* --------- TEMPLATE START --------- */

${code.trim()}

        /* ---------- TEMPLATE END ---------- */
      })();
    }
\`)`
}

function makeJsHarness(code: string) {
  return `
    try {
      const context = {}; // TODO: add allowed globals here
      const runner = ${makeJsRunner(code)}
      const result = await runner(context);
      self.postMessage({ type: 'success', result, id });
    } catch (error) {
      console.error('[jsRuntimeWorker] error:', error);
      self.postMessage({ type: 'error', error, id });
    }
  `.trim()
}

const makeWorkerCode = (code: string) => {
  return `
    self.onmessage = async (event) => {
      const { code, id } = event.data;
      console.log('[jsRuntimeWorker] executing:', { id, code })
      ${makeJsHarness(code)}
    };
  `.trim()
}

/**
 * This function creates a worker that can execute JavaScript code.
 *
 * @param code - The JavaScript code to execute.
 * @returns A worker that can execute the JavaScript code.
 */
export function makeJSRuntimeWorker(code: string) {
  const workerCode = makeWorkerCode(code)
  const workerBlob = new Blob([workerCode], { type: 'application/javascript' })
  const workerUrl = URL.createObjectURL(workerBlob)
  const worker = new Worker(workerUrl)
  return [worker, workerUrl] as const
}
