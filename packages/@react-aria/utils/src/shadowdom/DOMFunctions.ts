// Source: https://github.com/microsoft/tabster/blob/a89fc5d7e332d48f68d03b1ca6e344489d1c3898/src/Shadowdomize/DOMFunctions.ts#L16

export function nodeContains(
  node: Node | null | undefined,
  otherNode: Node | null | undefined
): boolean {
  if (!node || !otherNode) {
    return false;
  }

  let currentNode: HTMLElement | Node | null | undefined = otherNode;

  while (currentNode) {
    if (currentNode === node) {
      return true;
    }

    if (
          typeof (currentNode as HTMLSlotElement).assignedElements !==
              'function' &&
          (currentNode as HTMLElement).assignedSlot?.parentNode
      ) {
          // Element is slotted
      currentNode = (currentNode as HTMLElement).assignedSlot?.parentNode;
    } else if (currentNode.nodeType === document.DOCUMENT_FRAGMENT_NODE) {
          // Element is in shadow root
      currentNode = (currentNode as ShadowRoot).host;
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  return false;
}

export const getActiveElement = (doc: Document = document) => {
  let activeElement: Element | null = doc.activeElement;

  while (activeElement && 'shadowRoot' in activeElement &&
  activeElement.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }

  return activeElement;
};

export function getLastChild(node: Node | null | undefined): ChildNode | null {
  if (!node) {
    return null;
  }

  if (!node.lastChild && (node as Element).shadowRoot) {
    return getLastChild((node as Element).shadowRoot);
  }

  return node.lastChild;
}

export function getPreviousSibling(
  node: Node | null | undefined
): ChildNode | null {
  if (!node) {
    return null;
  }

  let sibling = node.previousSibling;

  if (!sibling && node.parentElement?.shadowRoot) {
    sibling = getLastChild(node.parentElement.shadowRoot);
  }

  return sibling;
}

export function getLastElementChild(
  element: Element | null | undefined
): Element | null {
  let child = getLastChild(element);

  while (child && child.nodeType !== Node.ELEMENT_NODE) {
    child = getPreviousSibling(child);
  }

  return child as Element | null;
}
