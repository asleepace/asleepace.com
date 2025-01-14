import { useCallback, useEffect, useState } from 'react'

import {
  makeJSRuntimeWorker,
  type JSRuntimeOutput,
} from '@/lib/runtime/jsRuntimeWorker'

export function useJSRuntime(code: string | undefined) {
  const [output, setOutput] = useState<JSRuntimeOutput>({
    result: null,
    loading: false,
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

    return () => {
      worker.removeEventListener('message', handleMessage)
      worker.terminate()
      URL.revokeObjectURL(workerUrl)
    }
  }, [code, handleMessage])

  return output
}
