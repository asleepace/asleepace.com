export interface JSRuntimeOutput {
  result: any
  error?: {
    message: string
    stack?: string
  }
  loading: boolean
}

const makeWorkerCode = (code: string) => `
  self.onmessage = async (event) => {
    const { code, id } = event.data;
    
    try {
      // Create a secure context for execution
      const context = {};
      const runner = new Function('context', \`
        with (context) {
          return (async () => {
            ${code}
          })();
        }
      \`);
      
      const result = await runner(context);
      self.postMessage({ type: 'success', result, id });
    } catch (error) {
      self.postMessage({ 
        type: 'error', 
        error: { 
          message: error.message,
          stack: error.stack 
        },
        id 
      });
    }
  };
`

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
