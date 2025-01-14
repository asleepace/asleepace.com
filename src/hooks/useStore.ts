import { useRef, useSyncExternalStore } from 'react'
import { createStore } from '@/lib/storage/createStore'

const DEEFAULT_CODE_STORE = {
  lang: 'typescript',
  code: `// code editor 

console.log('Hello, World!')

const editThis = true;`,
}

const codeStore = createStore({
  key: 'code',
  initialValue: DEEFAULT_CODE_STORE,
})

export function useStore<T extends object>(key: string, initialValue: T) {
  const store = useRef(createStore({ key, initialValue })).current
  const value = useSyncExternalStore(store.subscribe, store.getSnapshot)
  return [value, store.setSnapshot] as const
}
