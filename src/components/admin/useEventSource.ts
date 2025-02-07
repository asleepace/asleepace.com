import { useEffect, useMemo, useRef, useState } from 'react'

type HandleMessage<T> = (event: MessageEvent) => T | void | undefined

/**
 * ## useEventSource(url)
 *
 * A simple wrapper arround an event source.
 */
export function useEventSource<T>(
  url: string | undefined,
  handleMessage: HandleMessage<T>
) {
  const [eventSource, setEventSource] = useState<EventSource | undefined>()
  const [error, setError] = useState<Error | undefined>()
  const [messages, setMessages] = useState<T[]>([])

  const state = useMemo(() => {
    switch (eventSource?.readyState) {
      case EventSource.OPEN:
        return 'open'
      case EventSource.CLOSED:
        return 'closed'
      case EventSource.CONNECTING:
      default:
        return 'connecting'
    }
  }, [eventSource])

  useEffect(() => {
    if (!url) return

    // reset the messages and error
    setMessages([])
    setError(undefined)

    // create a new event source
    const nextEventSource = new EventSource(url)

    // log any errors and close the event source
    nextEventSource.onerror = (event) => {
      console.error('[useEventSource] error: ', JSON.stringify(event))
      setError(new Error('EventSource error: ' + event['target']?.toString()))
      nextEventSource.close()
    }

    // parse incoming messages and append to messages
    nextEventSource.onmessage = (event) => {
      if (!event.data || typeof event.data !== 'string') {
        console.error('[useEventSource] invalid event data:', event.data)
        return
      }

      if (event.data === 'ping') {
        console.log('[useEventSource] received ping', true)
        return 
      }

      console.log('[useEventSource] rawEvent:', event.data)
      const data = handleMessage(event)
      if (data) {
        setMessages((prev) => [...prev, data])
      }
    }

    // keep the event source in state
    setEventSource(nextEventSource)

    // close the event source when the component unmounts
    return () => {
      console.warn('[useEventSource] closing: ', url, true)
      nextEventSource.close()
    }
  }, [url])

  return { eventSource, messages, error, state }
}
