import { useRef, useSyncExternalStore } from 'react'
import { createStore } from '@/lib/frontend/'

export const DEEFAULT_CODE_STORE = {
  lang: 'typescript',
  code: `// code editor 

console.log('Hello, World!')

const editThis = true;`,
}

export function useStore<T extends object>(key: string, initialValue: T) {
  const store = useRef(createStore({ key, initialValue })).current
  const value = useSyncExternalStore(store.subscribe, store.getSnapshot)
  return [value, store.setSnapshot] as const
}
