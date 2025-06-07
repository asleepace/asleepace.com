import { z } from 'astro:schema'

type RxProps = z.ZodObject<any>

export type RxElement<T extends RxProps> = {
  tagName: string
  props: T
  render(state: z.infer<T>): string
  onConnected?(): void
}

export function defineComponent<T extends RxProps>(rx: RxElement<T>) {
  // define custom html element
  const RxElement = class extends HTMLElement {
    static readonly observedAttributes = Object.keys(rx.props || {})
    static {
      window.customElements.define(rx.tagName, this)
    }
    public shadowRoot: ShadowRoot
    public state: z.infer<typeof rx.props> = rx.props
    constructor() {
      super()
      this.shadowRoot = this.attachShadow({ mode: 'open' })
      this.state = rx.props
      this.render()
    }
    public render() {
      this.shadowRoot.innerHTML = rx.render(this.state)
    }
    public connectedCallback() {
      rx.onConnected?.()
    }
    public attributeChangedCallback(
      name: string,
      oldValue: string | null,
      newValue: string | null
    ) {
      if (oldValue === newValue) return
      if (!this.isConnected) return
      if (name in rx.props) {
        const nextState = rx.props.safeParse({
          ...this.state,
          [name]: newValue,
        })
        this.state = nextState
        this.render()
      }
    }
  }
}
