import { Try } from '@asleepace/try'

type RxHandlers<T> = ((this: ThisType<RxInstance<T>>, state: T) => any)[]

export interface RxInstance<T> extends HTMLElement {
  shadowRoot: ShadowRoot
  state: T
  self(): string
  setState(next: Partial<T>): void
  render(): void
}

const getRxAttrs = (elem: HTMLElement): Attr[] => {
  return [...elem.attributes].filter((attr) => attr.name.startsWith('rx-'))
}

// iterate all child elements which have rx-* attributes and update
// accordingly, if none are found early return.
function collectBoundChildren(child: HTMLElement | undefined, found: Map<string, HTMLElement[]> = new Map()) {
  if (!child) return found
  child.childNodes.forEach((next) => {
    if (next.nodeType === Node.ELEMENT_NODE) {
      const attrs = getRxAttrs(next as HTMLElement)
      if (!attrs.length) return
      attrs.forEach((attr) => {
        const current = found.get(attr.name) || ([] as HTMLElement[])
        found.set(attr.name, [...current, child])
      })
    }
  })
  return found
}

const attachProxy = <T extends {}>(state: T, didUpdate: (state: T) => void) =>
  new Proxy(state, {
    set(target, key, value, recv) {
      const output = Reflect.set(target, key, value, recv)
      didUpdate({ ...target, [key]: value })
      return output
    },
  })

function attributeCoder<T extends {}, K extends keyof T>(this: HTMLElement, initialState: T) {
  const keys = Object.keys(initialState) as K[]
  const toDataKey = (key: string) => `data-${key}`
  // const dataKeys = keys.filter((key) => typeof key === 'string').map(toDataKey)
  const safeParse = (obj: string) => Try.catch(() => JSON.parse(obj))[0]
  const safeStringify = <T extends {}>(obj: T) => Try.catch(() => JSON.stringify(obj))[0]

  const parseBoolean = (str: string) => {
    switch (str) {
      case 'true':
      case '1':
        return true
      default:
        return false
    }
  }

  const decodeAttribute = (dataKey: string, value: string | null): [key: K, value: any] => {
    const key = dataKey.slice(5) as K // slice off "data-"
    if (!value) return [key, undefined] as const
    if (value === 'undefined') return [key, undefined] as const
    if (value === 'null') return [key, undefined] as const
    switch (typeof initialState[key]) {
      case 'string':
        return [key, value]
      case 'number':
        return [key, Number(value)]
      case 'undefined':
        return [key, undefined]
      case 'bigint':
        return [key, BigInt(value)]
      case 'symbol':
        return [key, initialState[key]] // return og value for symbol
      case 'function':
        return [key, initialState[key]] // return og reference for functions
      case 'boolean':
        return [key, parseBoolean(value)]
      case 'object':
        return [key, safeParse(value)]
      default:
        return [key, undefined]
    }
  }

  const encodeAttribute = <T>(value: T) => {
    switch (typeof value) {
      case 'string':
        return value
      case 'number':
        return String(value)
      case 'bigint':
        return String(value)
      case 'boolean':
        return String(value)
      case 'symbol':
        return value.toString()
      case 'function':
        return `${value.name}()`
      case 'undefined':
        return 'undefined'
      case 'object': {
        if (!value) return 'null'
        return safeStringify(value)
      }
    }
  }

  return {
    keys: () => keys,
    encode: <T extends {}>(data: T) => {
      const nextState = Object.entries(data).map(([key, value]) => {
        const encodedValue = encodeAttribute(value)
        if (!encodedValue) {
          this.removeAttribute(toDataKey(key))
          return [key, value]
        } else {
          this.setAttribute(toDataKey(key), encodedValue)
          return [key, undefined]
        }
      })

      return Object.fromEntries(nextState)
    },
    decode: <T>() => {
      return Object.fromEntries(
        keys.map((key) => {
          const dataKey = toDataKey(key as string)
          const value = this.getAttribute(dataKey)
          return decodeAttribute(dataKey, value)
        })
      ) as T
    },
  }
}

type AttributeCoder = ReturnType<typeof attributeCoder>

export function defineComponent<T extends {}>({
  tagName,
  state: initialState = {} as T,
  attach,
}: {
  tagName: string
  state: T
  attach: (this: RxInstance<T>, state: T) => any | void
}) {
  // NOTE: That RxElement may not be defined until after the connectedCallback
  // has triggerd, in order to set the instances we can define this helpers.
  const shared = {
    tagName,
    instances: new Set(),
  }
  // Define a Custom Web Component which will automatically register itself in
  // the DOM with the provided tagName, state and a callback for attaching.
  const CustomComponent = class extends HTMLElement implements RxInstance<T> {
    static readonly observedAttributes = Object.keys(initialState)
    static {
      // automatically register the element
      if (typeof window !== 'undefined') {
        window.customElements.define(tagName, this)
      }
    }
    public shadowRoot: ShadowRoot
    public handlers: RxHandlers<T> = []
    public coder: AttributeCoder
    public attach: (this: RxInstance<T>, state: T) => any | void

    constructor() {
      super()
      this.shadowRoot = this.attachShadow({ mode: 'open' })
      this.shadowRoot.innerHTML = '<slot />'
      this.coder = attributeCoder.call(this, initialState)
      this.coder.encode(initialState)
      this.coder.decode()
      this.attach = attach.bind(this)
      this.updateBoundChildren()
    }

    public get state(): T {
      return this.coder.decode.call(this)
    }

    public set state(nextState: T) {
      this.coder.encode.call(this, nextState)
    }

    public self() {
      return 'this.getRootNode().host'
    }
    public setState(next: Partial<T>) {
      // Object.assign(this.state, next) // triggers proxy
      this.state = { ...this.state, ...next }
    }
    public render() {
      console.log('[component] render called!')
      this.shadowRoot.innerHTML = `<slot />`
      this.updateStateAttribute()
      this.updateBoundChildren()
    }
    public updateStateAttribute() {
      this.setAttribute('data-state', JSON.stringify(this.state))
    }
    public updateBoundChildren() {
      collectBoundChildren(this)
        .entries()
        .forEach(([boundAttr, children]) => {
          const current = this.getBoundAttribute(boundAttr)
          children.forEach((ch) => {
            ch.setAttribute(boundAttr, current)
          })
        })
    }
    public getBoundAttribute(boundAttr: string) {
      return eval(this.getAttribute(boundAttr) ?? 'undefined')
    }
    public connectedCallback() {
      console.log('[component] connected!', this)
      // attach the proxy to the state
      // this.state = attachProxy(initialState, () => this.render())
      // trigger callback method of setup
      this.attach.call(this, this.state)
      // update all reactive-child
      this.render()
      // register instance
      shared.instances.add(this)
    }
    public disconnectedCallback() {
      shared.instances.delete(this)
    }
    public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
      console.log('[component] attribute changed:', {
        name,
        oldValue,
        newValue,
      })
      if (!this.isConnected || oldValue === newValue) return
      if (name in this.state) {
        this.state[name] = newValue
        this.render()
      }
    }
  }
  // NOTE: return shared state with instances and class
  // definition to be use by the caller of this function.
  return {
    class: CustomComponent,
    ...shared,
  }
}

export const $define = <Elem extends HTMLElement, K extends keyof Elem>(
  tagName: string,
  config: Partial<Record<K, Elem[K]>> & { $state?: {} } = {}
) => {
  return defineComponent({
    tagName,
    state: {
      ...(document.getElementsByTagName(tagName).item(0)?.attributes || {}),
      ...(config.$state || {}),
    },
    attach(this: any) {
      for (const key in config) {
        const valueOrFunc = config[key]
        if (!(key in this)) continue
        switch (typeof valueOrFunc) {
          case 'function':
            this[key] = valueOrFunc.bind(this)
          default:
            this[key] = valueOrFunc
        }
      }
    },
  })
}
