declare const BrandSymbol: unique symbol

type RxMethodHandle = string & {
  [BrandSymbol]: string
}

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

function collectBoundChildren(
  child: HTMLElement | undefined,
  found: Map<string, HTMLElement[]> = new Map()
) {
  if (!child) return found
  child.childNodes.forEach((next) => {
    if (next.nodeType === Node.ELEMENT_NODE) {
      const child = next as HTMLElement
      const attrs = getRxAttrs(child)
      if (!attrs.length) return
      attrs.forEach((attr) => {
        const current = found.get(attr.name) || ([] as HTMLElement[])
        found.set(attr.name, [...current, child])
      })
    }
  })
  return found
}

const attachProxy = <T extends {}>(state: T, didUpdate?: (state: T) => void) =>
  new Proxy(state, {
    set(target, key, value, recv) {
      const output = Reflect.set(target, key, value, recv)
      didUpdate?.(target)
      return output
    },
  })

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
      // automatically register the element
      if (typeof window !== 'undefined') {
        window.customElements.define(tagName, this)
      }
    }
    public shadowRoot: ShadowRoot
    public handlers: RxHandlers<T> = []
    public state: T = initialState
    constructor() {
      super()
      this.shadowRoot = this.attachShadow({ mode: 'open' })
      this.shadowRoot.innerHTML = '<slot />'
    }
    public self() {
      return 'this.getRootNode().host'
    }
    public setState(next: Partial<T>) {
      Object.assign(this.state, next) // triggers proxy
    }
    public render() {
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
          children.forEach((ch) => ch.setAttribute(boundAttr, current))
        })
    }
    public getBoundAttribute(boundAttr: string) {
      return eval(this.getAttribute(boundAttr) ?? 'undefined')
    }
    public connectedCallback() {
      // attach the proxy to the state
      this.state = attachProxy(initialState, () => this.render())
      // trigger callback method of setup
      attach.call(this, this.state)
      // update all reactive-child
      this.render()
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
