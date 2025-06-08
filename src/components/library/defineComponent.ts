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

type PrettyState<S extends string> = S extends `"${infer Key}:${infer Value}}`
  ? Record<Key, Value>
  : never

type Test1 = InferState<`<rx-side-bar data-state='{"open":true}'>`>
type Test2 = Unquote<Test1>

export interface RxInstance<T> extends HTMLElement {
  htmlString: string
  shadowRoot: ShadowRoot
  state: T
  handlers: ((this, state: T) => any)[]
  attach(this, method: (this, state: T) => void): RxMethodHandle
}

export interface RxConfig<T extends string> {
  tagName: string
  props: T
  render(this: RxInstance<T>, state: T): string
}

const findInStr = (str: string, regex: RegExp) => {
  return str.match(regex)?.at(0)
}

// get the data-tag attribute
const findDataTag = (htmlString: string) =>
  findInStr(htmlString, /data-tag="([^"]*)"/)

// get the element tag name
const findHtmlTag = (htmlString: string) =>
  findInStr(htmlString, /<[a-zA-Z][^>]/)

// get all html attributes
const findAllAttr = (htmlString: string) => {
  const matches = htmlString.matchAll(
    /(\w+(?:-\w+)*)(?:=(?:["']([^"']*)["']|([^\s>]+)))?/g
  )
  return [...matches]
}

export function defineComponent<
  HTMLString extends string,
  State extends Unquote<InferState<HTMLString>>
>(
  htmlString: HTMLString,
  handler: (instance: RxInstance<State>) => any | void
) {
  const attributes = findAllAttr(htmlString)
  const tagName = attributes.at(0)?.at(0)
  if (!tagName) throw new Error('Missing tag name:' + htmlString)

  // define custom html element
  const RxElement = class
    extends HTMLElement
    implements RxInstance<HTMLString>
  {
    static readonly observedAttributes = [...attributes]
    static {
      window.customElements.define(tagName, this)
    }
    public htmlString: HTMLString
    public shadowRoot: ShadowRoot
    public state: State
    public handlers = []
    // public htmlString = htmlString
    constructor() {
      super()
      this.shadowRoot = this.attachShadow({ mode: 'open' })
      this.shadowRoot.innerHTML = '<slot />'
      this.state = {} as State
    }
    public self() {
      return 'this.getRootNode().host'
    }
    public attach(method: (state) => void): RxMethodHandle {
      const methodId = this.handlers.length
      this.handlers.push(() => method.call(this))
      const handleId = `this.getRootNode().host.handlers[${methodId}]()`
      return handleId as RxMethodHandle
    }
    public setState(nextState: Partial<State>) {
      console.log('set state')
      // this.state = rx.props.safeParse({ ...this.state, ...nextState })
      this.render()
    }
    public render() {
      this.shadowRoot.innerHTML = `<slot />`
    }
    public connectedCallback() {
      console.log('[rxml] connected!')
      handler.call(this, this.state)
    }
    public attributeChangedCallback(
      name: string,
      oldValue: string | null,
      newValue: string | null
    ) {
      if (!this.isConnected || oldValue === newValue) return
      // this.setState({ [name]: newValue } as any)
    }
  }
  // return class for optional use
  return RxElement
}
