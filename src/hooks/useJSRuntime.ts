import { useCallback, useEffect, useRef, useState } from 'react'

import {
  makeJSRuntimeWorker,
  type JSRuntimeOutput,
} from '@/lib/frontend/jsRuntimeWorker'

/**
 * ## useJSRuntime(code)
 *
 * Executes code in a seperate worker process which can be ran multiple times.
 *
 * - `output` is the result of the code execution.
 * - `runJsCode` is a function that can be used to run the code again.
 */
export function useJSRuntime(code: string | undefined) {
  const [output, setOutput] = useState<JSRuntimeOutput>({
    loading: false,
    result: null,
    error: undefined,
  })

  const runJsCode = useRef((_nextCode: string) => {
    console.warn('[useJSRuntime] runJsCode is not set!')
  })

  const handleMessage = useCallback((event: MessageEvent) => {
    const { type, result, error } = event.data
    if (type === 'success') {
      setOutput({ result, loading: false, error: undefined })
    } else {
      setOutput({ result: undefined, loading: false, error })
    }
  }, [])

  useEffect(() => {
    if (!code) return
    const [worker, workerUrl] = makeJSRuntimeWorker(code)

    worker.addEventListener('message', handleMessage)
    worker.postMessage({ code })

    runJsCode.current = (nextCode: string) => {
      worker.postMessage({ code: nextCode })
    }

    return () => {
      console.info('[useJSRuntime] removing worker!')
      worker.removeEventListener('message', handleMessage)
      worker.terminate()
      URL.revokeObjectURL(workerUrl)
      runJsCode.current = () => {
        console.warn('[useJSRuntime] runJsCode is not set!')
      }
    }
  }, [code, handleMessage])

  return [output, runJsCode.current] as const
}
