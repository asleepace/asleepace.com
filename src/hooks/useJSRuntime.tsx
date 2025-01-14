import { useCallback, useEffect, useRef, useState } from 'react'

import {
  makeJSRuntimeWorker,
  type JSRuntimeOutput,
} from '@/lib/runtime/jsRuntimeWorker'

export function useJSRuntime(code: string | undefined) {
  const [output, setOutput] = useState<JSRuntimeOutput>({
    result: null,
    loading: false,
  })

  const runJsCode = useRef((nextCode: string) => {
    console.warn('[useJSRuntime] runJsCode is not set!')
  })

  const handleMessage = useCallback((event: MessageEvent) => {
    const { type, result, error } = event.data
    if (type === 'success') {
      setOutput({ result, loading: false })
    } else {
      setOutput({ result: null, loading: false, error })
    }
  }, [])

  useEffect(() => {
    if (!code) return
    console.info('[useJSRuntime] creating worker!')
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
