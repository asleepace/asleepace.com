/**
 * # NodeSelector
 *
 * A class that represents a node in the DOM and its children.
 * This is used to select a node in the DOM and get the selection of the node.
 *
 */
export class NodeSelector {
  public children: NodeSelector[] = []
  public isText: boolean = false
  public size: number = 0

  constructor(public domNode: Node | ChildNode, public offset: number = 0) {
    if (domNode.nodeType === Node.TEXT_NODE) {
      this.size = domNode.textContent?.length || 0
      this.isText = true
    }

    let childOffset = this.offset
    for (const child of domNode.childNodes) {
      const childNode = new NodeSelector(child, childOffset)
      childOffset += childNode.getSubtreeSize()
      this.children.push(childNode)
    }
  }

  public getSelection(target: number): Range | undefined {
    if (target >= this.offset && target < this.offset + this.size) {
      const range = new Range()
      range.setStart(this.domNode, target - this.offset)
      range.setEnd(this.domNode, target - this.offset)
      return range
    }

    for (const child of this.children) {
      const selection = child.getSelection(target)
      if (selection) return selection
    }

    return undefined
  }

  public getSubtreeSize(): number {
    return this.children.reduce(
      (acc, child) => acc + child.getSubtreeSize(),
      this.size
    )
  }
}
