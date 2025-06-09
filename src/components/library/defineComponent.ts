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
function collectBoundChildren(
  child: HTMLElement | undefined,
  found: Map<string, HTMLElement[]> = new Map()
) {
  if (!child) return found
  child.childNodes.forEach((next) => {
    if (next.nodeType === Node.ELEMENT_NODE) {
      const attrs = getRxAttrs(next as HTMLElement)
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
    public state: T = initialState
    constructor() {
      super()
      this.shadowRoot = this.attachShadow({ mode: 'open' })
      this.shadowRoot.innerHTML = '<slot />'
      this.updateBoundChildren()
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
          console.log({ boundAttr, current, children })
          children.forEach((ch) => {
            console.log(
              'updated child:',
              ch,
              boundAttr,
              current,
              ch.getAttributeNames()
            )
            ch.setAttribute(boundAttr, current)
          })
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
      // register instance
      shared.instances.add(this)
    }
    public disconnectedCallback() {
      shared.instances.delete(this)
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
  // NOTE: return shared state with instances and class
  // definition to be use by the caller of this function.
  return {
    class: CustomComponent,
    ...shared,
  }
}
