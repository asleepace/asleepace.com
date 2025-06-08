import { z, type TypeOf } from 'astro:schema'
import { type Prettify } from './types'

declare const BrandSymbol: unique symbol

type RxProps = z.ZodObject<any>

type RxMethodHandle = string & {
  [BrandSymbol]: string
}

type InferState<S extends string> =
  S extends `${string}data-state="${infer State}"${string}` ? State : never

export interface RxInstance<T extends RxProps> extends HTMLElement {
  shadowRoot: ShadowRoot
  state: z.infer<T>
  handlers: Function[]
  attach<T extends RxProps>(
    this,
    method: (this, state: z.infer<T>) => void
  ): RxMethodHandle
}

export interface RxConfig<T extends RxProps> {
  tagName: string
  props: T
  render(this: RxInstance<T>, state: z.infer<T>): string
}

/**
 *  Define a custom reactive html web component.
 *
 *  ```ts
 *  defineComponent({
 *      tagName: 'rx-counter',
 *      props: z.object({
 *          count: z.number().default(0)
 *      }),
 *      render(state) {
 *        const onClick = state.attach(() => {
 *           state.count += 1
 *        })
 *        return `<button onclick=${onClick} class="">Clicked ${state.count} times</button>`
 *      }
 *  })
 *  ```
 */
export function defineComponent<T extends RxProps>(rx: RxConfig<T>) {
  type RxState = z.infer<T>

  // define custom html element
  const RxElement = class extends HTMLElement implements RxInstance<T> {
    static readonly observedAttributes = Object.keys(rx.props || {})
    static {
      window.customElements.define(rx.tagName, this)
    }
    public shadowRoot: ShadowRoot
    public state: RxState
    public handlers: Function[] = []
    constructor() {
      super()
      this.shadowRoot = this.attachShadow({ mode: 'open' })
      this.state = rx.props
      this.render()
    }
    public attach(method: (state) => void): RxMethodHandle {
      const methodId = this.handlers.length
      this.handlers.push(() => method.call(this))
      const handleId = `this.getRootNode().host.handlers[${methodId}]()`
      return handleId as RxMethodHandle
    }
    public setState(nextState: Partial<RxState>) {
      this.state = rx.props.safeParse({ ...this.state, ...nextState })
      this.render()
    }
    public render() {
      this.shadowRoot.innerHTML = rx.render.call(this, this.state)
    }
    public connectedCallback() {
      // rx.attach?.call(this)
    }
    public attributeChangedCallback(
      name: string,
      oldValue: string | null,
      newValue: string | null
    ) {
      if (oldValue === newValue) return
      if (!this.isConnected) return
      if (name in this.state) {
        this.setState({ [name]: newValue } as Partial<TypeOf<T>>)
      }
    }
  }
  // return class for optional use
  return RxElement
}
