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
export type TraverseContext = {
  charCount: number
  start: number
  end: number
  range: Range
  found: boolean
}
