import type { EditorRef, RangeArray } from './types'

/**
 * ## getCursorSelection
 *
 * get the current cursor selection (position) of the editor
 *
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
