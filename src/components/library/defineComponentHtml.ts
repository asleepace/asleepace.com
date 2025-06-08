import { z, type TypeOf } from 'astro:schema'
import { type Prettify } from './types'

declare const BrandSymbol: unique symbol

type RxMethodHandle = string & {
  [BrandSymbol]: string
}

type RemoveChar<
  S extends string,
  C extends string
> = S extends `${infer L}${C}${infer R}`
  ? RemoveChar<`${L}${RemoveChar<R, C>}`, C>
  : S

type Unquote<S extends string> = RemoveChar<
  RemoveChar<RemoveChar<S, '"'>, "'">,
  '`'
>

type InferState<S extends string> =
  S extends `${string}data-state="${infer State}"${string}`
    ? State
    : S extends `${string}data-state='${infer State}'${string}`
    ? State
    : never

type PrimitiveMap = {
  true: boolean
  false: boolean
  null: null
  undefined: undefined
  [key: number]: number
}

type ParseValue<S extends string> = S extends keyof PrimitiveMap
  ? PrimitiveMap[S]
  : S

type ParseState<S extends string> = S extends `{${infer Key}:${infer Value}}`
  ? Record<Key, ParseValue<Value>>
  : never

type StateString<T extends string> = ParseState<Unquote<InferState<T>>>

type Test1 = InferState<`<rx-side-bar data-state='{"open":true}'>`>
type Test2 = Unquote<Test1>
type Test3 = ParseState<Test2>

export interface RxInstance<T> extends HTMLElement {
  htmlString: string
  shadowRoot: ShadowRoot
  state: T
  handlers: ((state: T) => any)[]
  attach(
    this: RxInstance<T>,
    method: (this: RxInstance<T>, state: T) => void
  ): RxMethodHandle
}

const findInStr = (str: string, regex: RegExp) => {
  return str.match(regex)?.at(1)
}

const findDataState = (htmlString: string) =>
  findInStr(htmlString, /\bdata-state\s*=\s*(['"])((?:\\.|(?!\1)[^\\])*?)\1/)

// get all html attributes
const findAllAttr = (htmlString: string) => {
  const matches = htmlString.matchAll(
    /(\w+(?:-\w+)*)(?:=(?:["']([^"']*)["']|([^\s>]+)))?/g
  )
  return [...matches]
}

export function defineComponent<S extends string, T extends StateString<S>>(
  htmlString: S,
  handler: (instance: RxInstance<T>) => any | void
) {
  const attributes = findAllAttr(htmlString)
  const tagName = attributes.at(0)?.at(0)
  if (!tagName) throw new Error('Missing tag name:' + htmlString)

  // define custom html element
  const RxElement = class extends HTMLElement implements RxInstance<T> {
    static readonly observedAttributes = [...attributes]
    static {
      window.customElements.define(tagName, this)
    }
    public htmlString: S
    public shadowRoot: ShadowRoot
    public state: T = {} as T
    public handlers: ((this: ThisType<RxInstance<T>>, state: T) => any)[] = []
    constructor() {
      super()
      this.shadowRoot = this.attachShadow({ mode: 'open' })
      this.shadowRoot.innerHTML = '<slot />'

      const initialProps = this.getAttribute('data-state')
      console.log({ initialProps })

      const initialState = JSON.parse(initialProps || '{}')

      const setState = (nextState: Partial<T>) => {
        const updatedState = { ...this.state, ...nextState }
        console.log({ updatedState })
        this.setAttribute('data-state', JSON.stringify(updatedState))
      }

      this.state = new Proxy(initialState, {
        set(target, prop, value, recv) {
          setState({ [prop]: value } as any)
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
      this.handlers.push(() => method.call(this))
      const handleId = `this.getRootNode().host.handlers[${methodId}]()`
      return handleId as RxMethodHandle
    }
    public setState(nextState: Partial<T>) {
      this.state = { ...this.state, ...nextState }
      this.render()
    }
    public render() {
      this.shadowRoot.innerHTML = `<slot />`
    }
    public connectedCallback() {
      console.log('[rxml] connected:', this)
      handler.call(this, this)
    }
    public attributeChangedCallback(
      name: string,
      oldValue: string | null,
      newValue: string | null
    ) {
      if (!this.isConnected || oldValue === newValue) return
      this.setState({ [name]: newValue } as any)
    }
  }
  // return class for optional use
  return RxElement
}
