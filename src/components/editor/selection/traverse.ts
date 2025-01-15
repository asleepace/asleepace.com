import type { CodeEditorNode, TraverseContext } from './types'

/**
 * create a traverse context object
 * @param start - the start position of the selection range
 * @param end - the end position of the selection range
 * @returns a function that traverses the editor element and finds the new cursor position
 */
export function createTraverseContext(
  node: CodeEditorNode,
  start: number,
  end: number
) {
  const context: TraverseContext = {
    charCount: 0,
    start,
    end,
    range: document.createRange(),
    found: false,
  }

  function traverse(
    node: CodeEditorNode,
    ctx: TraverseContext
  ): TraverseContext {
    if (ctx.found) return context

    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      const nextCharCount = ctx.charCount + node.textContent.length

      // Set start position
      if (ctx.charCount <= ctx.start && ctx.start <= nextCharCount) {
        ctx.range.setStart(node, ctx.start - ctx.charCount)

        // If this is a collapsed range (start === end)
        if (ctx.start === ctx.end) {
          ctx.range.setEnd(node, ctx.start - ctx.charCount)
          ctx.found = true
          return ctx
        }
      }

      // Set end position
      if (ctx.charCount <= ctx.end && ctx.end <= nextCharCount) {
        ctx.range.setEnd(node, ctx.end - ctx.charCount)
        ctx.found = true
        return ctx
      }

      ctx.charCount = nextCharCount
      return ctx
    }

    // Traverse child nodes
    for (const child of node.childNodes) {
      traverse(child, ctx)
      if (ctx.found) break
    }

    return ctx
  }

  return traverse(node, context)
}
