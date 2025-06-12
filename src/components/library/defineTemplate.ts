import { defineComponent, type RxInstance } from './defineComponent'

export type BoundMethod<T> = (this: RxInstance<T>, T) => any | void

const getSanitizedAttributes = (template: TemplateStringsArray) =>
  template
    .map((str) => str.replace('<', '').replace(/\s+/g, ' ').split(' '))
    .flat(1)
    .filter((str) => str.length > 0)

/**
 * Reactive HTML template literal which will define a custom component
 * @param strings
 * @param expressions
 */
export function defineTemplate<T extends {}, M extends BoundMethod<T>>(
  template: TemplateStringsArray,
  ...props: any[]
) {
  // --- parse template ---

  const [elemName, ...attrs] = getSanitizedAttributes(template)

  const paired = props.map((value, index) => {
    return [attrs[index], value] as const
  })

  const state = Object.fromEntries(paired)
  console.log({ state, paired })

  // --- setup component ---

  const shared = defineComponent({
    tagName: elemName,
    state,
    attach(state) {},
  })

  // --- attach bindings ----

  return shared
}
