import { useState } from 'react'
import { useCallback } from 'react'

export function useUndoRedo(initialValue: string) {
  const [history, setHistory] = useState([initialValue])
  const [currentIndex, setCurrentIndex] = useState(0)

  const push = useCallback(
    (newValue: string) => {
      setHistory((prev) => [...prev.slice(0, currentIndex + 1), newValue])
      setCurrentIndex((prev) => prev + 1)
    },
    [currentIndex]
  )

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      return history[currentIndex - 1]
    }
    return history[currentIndex]
  }, [currentIndex, history])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      return history[currentIndex + 1]
    }
    return history[currentIndex]
  }, [currentIndex, history])

  return { push, undo, redo }
}
