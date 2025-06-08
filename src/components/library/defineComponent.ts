import { z, type TypeOf } from 'astro:schema'
import { type Prettify } from './types'

declare const BrandSymbol: unique symbol

type RxMethodHandle = string & {
  [BrandSymbol]: string
}

type RxHandlers<T> = ((this: ThisType<RxInstance<T>>, state: T) => any)[]

export interface RxInstance<T> extends HTMLElement {
  shadowRoot: ShadowRoot
  state: T
  handlers: ((state: T) => any)[]
  attach(
    this: RxInstance<T>,
    method: (this: RxInstance<T>, state: T) => void
  ): RxMethodHandle
}

export function defineComponent<T extends {}>({
  tagName,
  state: initialState,
  attach,
}: {
  tagName: string
  state: T
  attach: (this: RxInstance<T>, state: T) => any | void
}) {
  const RxElement = class extends HTMLElement implements RxInstance<T> {
    static readonly observedAttributes = Object.keys(initialState)
    static {
      window.customElements.define(tagName, this)
    }
    public shadowRoot: ShadowRoot
    public state: T = initialState
    public handlers: RxHandlers<T> = []
    constructor() {
      super()
      this.shadowRoot = this.attachShadow({ mode: 'open' })
      this.shadowRoot.innerHTML = '<slot />'

      const onSetAttribute = (nextState: Partial<T>) => {
        const combined = { ...this.state, ...nextState }
      }

      this.state = new Proxy(initialState, {
        set(target, prop, value, recv) {
          onSetAttribute({ [prop]: value } as any)
          return Reflect.set(target, prop, value, recv)
        },
      })
    }
    public self() {
      return 'this.getRootNode().host'
    }
    public attach(
      method: (this: ThisType<RxInstance<T>>, state: T) => void
    ): RxMethodHandle {
      const methodId = this.handlers.length
      this.handlers.push(() => method.call(this, this.state))
      const handleId = `this.getRootNode().host.handlers[${methodId}]()`
      return handleId as RxMethodHandle
    }
    public render() {
      this.shadowRoot.innerHTML = `<slot />`
    }
    public connectedCallback() {
      console.log('[rxml] connected:', this)
      attach.call(this, this.state)
    }
    public attributeChangedCallback(
      name: string,
      oldValue: string | null,
      newValue: string | null
    ) {
      if (!this.isConnected || oldValue === newValue) return
      if (name in this.state) {
        this.state[name] = newValue
        this.render()
      }
    }
  }
  // return class for optional use
  return RxElement
}
