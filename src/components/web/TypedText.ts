import { WebComponent } from './WebComponent'

type State = {
  text: string
}

export class TypedText extends WebComponent<State> {
  static get tagName() {
    return 'typed-text'
  }

  static get observedAttributes() {
    return ['text']
  }

  // instance properties

  public textRef: HTMLParagraphElement
  public state = { text: '' }

  constructor() {
    super()
    console.log('[TypedText] constructor!')
    this.textRef = document.createElement('p')
    this.textRef.className = 'py-4'
  }

  public render({ text }: State) {
    console.log(`[TypedText] render called: "${text}"`)
    requestAnimationFrame(() => {
      const characters = text.split('')
      for (let i = 0; i < characters.length; i++) {
        const char = characters[i]
        setTimeout(() => {
          this.textRef.textContent += char
        }, i * 16)
      }
    })

    return this.textRef
  }
}
