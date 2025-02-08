import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type HandleMessage<T> = (event: MessageEvent) => T | void | undefined

/**
 * ## useEventSource(url)
 *
 * A simple wrapper arround an event source.
 */
export function useEventSource<T>(handleMessage: HandleMessage<T>) {
  const [eventSource, setEventSource] = useState<EventSource | undefined>()
  const [messages, setMessages] = useState<T[]>([])

  /**
   * Creates a new event source.
   */
  const subscribeToEventSource = useCallback((url: string) => {
    console.log('[useEventSource] creating event source:', url)
    const nextEventSource = new EventSource(url)

    // handle initial connection
    nextEventSource.onopen = () => {
      console.log('[useEventSource] event source opened:', url)
      setEventSource(nextEventSource)
      setMessages([])
    }

    // hadle errors
    nextEventSource.onerror = () => {
      console.error('[useEventSource] error: ', true)
      nextEventSource.close()
      setEventSource(undefined)
    }

    // handle incoming messages
    nextEventSource.onmessage = (event) => {
      if (!event.data || typeof event.data !== 'string') return
      const data = handleMessage(event)
      if (data) {
        setMessages((prev) => [...prev, data])
      }
    }

    return nextEventSource
  }, [])

  /**
   * Checks the state of the event source.
   */
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

  /**
   * Returns the event source, subscribe function, messages and state.
   */
  return { eventSource, subscribeToEventSource, messages, state }
}
