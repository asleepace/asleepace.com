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

  animateText(text: string, duration: number = 300) {
    const chars = text.split('')
    const interval = duration / (chars.length || 1)
    return chars.map((char, i) => {
      const { promise, resolve } = Promise.withResolvers<void>()
      const offset = i * interval
      setTimeout(() => {
        this.textRef.textContent += char
        resolve()
      }, offset)
      return promise
    })
  }

  public render({ text }) {
    requestAnimationFrame(() => this.animateText(text, 500))
    return this.textRef
  }
}
