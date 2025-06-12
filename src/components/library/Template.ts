// --- simple attach method ---

export function define<T extends {} = {}>(tagName: string, state: T = {} as T) {
  const shared = {
    instances: new Set(),
    tagName,
    instance: {} as {
      new (...args: any[]): HTMLElement
    },
  }
  // --- dynamic class definition
  const instance = class extends HTMLElement {
    static observedAttributes = Object.keys(state).map((key) => `rx-${key}`)
    public shadowRoot: ShadowRoot
    constructor() {
      super()
      this.shadowRoot = this.attachShadow({ mode: 'open' })
      this.shadowRoot.appendChild(document.createElement('slot'))
      for (const key in state) {
        const value = state[key]
        this.setAttribute(key, String(value))
      }
    }
    public get state() {
      return Object.fromEntries(
        [...this.attributes].map((attr) => [attr.name, attr.value])
      )
    }
    public self() {
      return 'this.getRootNode().host'
    }
    public connectedCallback() {
      shared.instances.add(this)
    }
    public disconnectedCallback() {
      shared.instances.delete(this)
    }
    public attibuteChangedCallback(
      name: string,
      oldValue: string | null,
      newValue: string | null
    ) {
      console.log('[Template] attibuteChangedCallback:', {
        name,
        oldValue,
        newValue,
      })
    }
  }

  shared.instance = instance

  return shared
}
