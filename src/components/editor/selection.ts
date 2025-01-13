/**
 * a tuple which represents the start and end of a selection range (inclusive)
 */
export type RangeArray = [start: number, end: number]

/**
 * a ref to the code editor element
 */
export type EditorRef = React.RefObject<HTMLElement | null>

/**
 * a node which contains text content
 */
export type CodeEditorNode = Node | ChildNode

/**
 * a context object used to traverse the editor element and find the new cursor position
 */
interface TraverseContext {
  charCount: number
  start: number
  end: number
  range: Range
  found: boolean
}

/**
 * get the current cursor selection (position) of the editor
 * @param editorRef - a ref to the code editor element
 * @returns a tuple which represents the start and end of a selection range (inclusive)
 */
export function getCursorSelection(editorRef: EditorRef): RangeArray | never {
  if (!editorRef.current) {
    throw Error('editorRef is null')
  }

  const selection = window.getSelection()

  if (!selection?.rangeCount) {
    throw Error('no selection ranges')
  }

  const caretPos = selection.getRangeAt(0)

  if (!caretPos) {
    throw Error('no range found at index 0')
  }

  if (!caretPos.startContainer || typeof caretPos.startOffset !== 'number') {
    throw Error('invalid range start position')
  }

  const preCaretRange = caretPos.cloneRange()
  preCaretRange.selectNodeContents(editorRef.current)
  preCaretRange.setEnd(caretPos.startContainer, caretPos.startOffset)

  const caretStartPos = preCaretRange.toString().length
  const caretEndPos = caretStartPos + caretPos.toString().length

  return [caretStartPos, caretEndPos]
}

/**
 * set the cursor selection (position) of the editor
 * @param editorRef - a ref to the code editor element
 * @param prevCursorPos - a tuple which represents the start and end of a selection range (inclusive)
 */
export function setCursorPosition(
  editorRef: EditorRef,
  prevCursorPos: RangeArray
): void {
  if (!editorRef.current) throw Error('invalid editorRef!')
  if (!prevCursorPos) throw Error('invalid prevCursorPos!')

  const selection = window.getSelection()
  if (!selection) throw Error('no selection')

  const [start, end] = prevCursorPos

  // Validate range values
  if (start < 0 || end < start) {
    throw Error('invalid range values')
  }

  const context: TraverseContext = {
    charCount: 0,
    start,
    end,
    range: document.createRange(),
    found: false,
  }

  function traverse(node: CodeEditorNode, ctx: TraverseContext): void {
    if (ctx.found) return

    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      const nextCharCount = ctx.charCount + node.textContent.length

      // Set start position
      if (ctx.charCount <= ctx.start && ctx.start <= nextCharCount) {
        ctx.range.setStart(node, ctx.start - ctx.charCount)

        // If this is a collapsed range (start === end)
        if (ctx.start === ctx.end) {
          ctx.range.setEnd(node, ctx.start - ctx.charCount)
          ctx.found = true
          return
        }
      }

      // Set end position
      if (ctx.charCount <= ctx.end && ctx.end <= nextCharCount) {
        ctx.range.setEnd(node, ctx.end - ctx.charCount)
        ctx.found = true
        return
      }

      ctx.charCount = nextCharCount
      return
    }

    // Traverse child nodes
    for (const child of node.childNodes) {
      traverse(child, ctx)
      if (ctx.found) break
    }
  }

  traverse(editorRef.current, context)

  // Only update selection if we found a valid range
  if (context.found) {
    selection.removeAllRanges()
    selection.addRange(context.range)
  }
}
