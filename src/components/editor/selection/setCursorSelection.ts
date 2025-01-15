import { createTraverseContext } from './traverse'
import type { EditorRef, RangeArray } from './types'

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

  // Traverse the editor element to find the new cursor position
  const context = createTraverseContext(editorRef.current, start, end)

  // Only update selection if we found a valid range
  if (context.found) {
    selection.removeAllRanges()
    selection.addRange(context.range)
  }
}
