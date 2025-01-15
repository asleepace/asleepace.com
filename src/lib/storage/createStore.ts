export type StoreConfig<T extends object> = {
  key: string
  initialValue: T
}

/**
 * ## createStore(args)
 *
 * Creates a store object which can be used in conjunction with the `useSyncExternalStore()` hook.
 *
 * @param key - The key to store the data under
 * @param initialValue - The initial value to store
 * @returns An object with a `subscribe` method, a `getSnapshot` method, and a `setSnapshot` method
 *
 */
export function createStore<T extends object>(config: StoreConfig<T>) {
  let cachedJson = window.localStorage.getItem(config.key)
  let cachedData = cachedJson ? JSON.parse(cachedJson) : config.initialValue

  function handleOnChange(event: StorageEvent, listener: () => void) {
    if (event.key !== config.key) return
    // parse the new value, or fallback to the initial value
    cachedData = event.newValue
      ? JSON.parse(event.newValue)
      : config.initialValue
    // notify the store the value changed
    listener()
  }

  return {
    subscribe: (listener: () => void) => {
      const onChange = (event: StorageEvent) => handleOnChange(event, listener)
      window.addEventListener('storage', onChange)
      return () => {
        window.removeEventListener('storage', onChange)
      }
    },
    getSnapshot: () => {
      return cachedData
    },
    setSnapshot: (next: Partial<T>) => {
      const nextData = { ...cachedData, ...next }
      const nextJson = JSON.stringify({ ...nextData, ...next })
      cachedData = nextData
      cachedJson = nextJson
      window.localStorage.setItem(config.key, nextJson)
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: config.key,
          newValue: nextJson,
          oldValue: cachedJson,
          storageArea: localStorage,
        })
      )
    },
  }
}
