export type TimeoutID = ReturnType<typeof setTimeout>

export type TimeoutDurationMS = number

export type Select<T> = (mutations: MutationRecord[]) => T | undefined | null

export interface WatchInit<T> {
  target: Node
  select: Select<T>
  config?: MutationObserverInit
  expire?: TimeoutDurationMS
}

const DEFAULT_OPTIONS: MutationObserverInit = {
  attributes: false,
  childList: true,
  subtree: true,
}

/**
 *  ## watchForSelector(parent, selector, config?)
 *
 *  Observe parent element for mutations and run onMutations selector
 *  each time a mutation is observed. If the selector returns a non-nullish
 *  value, then this function will resolve with the result.
 *
 *  ```ts
 *  const toolbarItem = await watchForSelector({
 *    target: this,
 *    select: () => this.getElementById('item'),
 *    expire: 10_000,
 *    config: {
 *      childList: true,
 *      subtree: true
 *    }
 *  })
 *  ```
 *
 */
export async function watchForSelector<T>({
  target,
  select,
  config = DEFAULT_OPTIONS,
  expire = 10_000,
}: WatchInit<T>): Promise<T | null> {
  let { resolve, promise } = Promise.withResolvers<T | null>()
  let timeoutId: TimeoutID | undefined = undefined

  // run once before any setup
  let element = select([])
  if (element) return element

  let unsubscribe: ((element?: T | null) => void) | undefined

  let observer = new MutationObserver((mutations, self) => {
    element = select(mutations)
    if (!element) return
    unsubscribe?.(element)
    self.disconnect()
  })

  // register observer with options
  observer.observe(target, config)

  // initialize unsubscribe callback
  unsubscribe = () => {
    unsubscribe = undefined
    observer.disconnect()
    clearTimeout(timeoutId)
    resolve(element || select([]) || null)
  }

  // register a max timeout if present
  if (expire) {
    timeoutId = setTimeout(unsubscribe, expire)
  }

  // return promise for element
  return promise
}
