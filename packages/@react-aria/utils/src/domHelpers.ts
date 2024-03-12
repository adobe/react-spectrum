export const getOwnerDocument = (el: Element | null | undefined): Document => {
  return el?.ownerDocument ?? document;
};

export const getOwnerWindow = (
  el: (Window & typeof global) | Element | null | undefined
): Window & typeof global => {
  if (el && 'window' in el && el.window === el) {
    return el;
  }

  const doc = getRootNode(el as Element | null | undefined);
  return doc instanceof ShadowRoot ?  doc.ownerDocument.defaultView || window :  doc.defaultView || window;
};

export const getRootNode = (el: Element | null | undefined): Document | ShadowRoot => {
  // Fallback to document if the element is null or undefined
  if (!el) {
    return document;
  }

  const rootNode = el.getRootNode ? el.getRootNode() : document;

  // Check if the rootNode is a Document, or if the element is disconnected from the DOM
  // In such cases, rootNode could either be the actual Document or a ShadowRoot,
  // but for disconnected nodes, we want to ensure consistency by returning the Document.
  if (rootNode instanceof Document || !(el.isConnected)) {
    return document;
  }

  return rootNode;
};

/**
 * `getRootBody`: Retrieves a suitable "body" element for an element, accommodating both
 * Shadow DOM and traditional DOM contexts. Returns `document.body` for elements in the
 * light DOM or the root of the Shadow DOM for elements within a shadow DOM.
 */
export const getRootBody = (root: Document | ShadowRoot): HTMLElement | ShadowRoot => {
  return root instanceof Document ? root.body : root;
};

export const getDeepActiveElement = () => {
  let activeElement = document.activeElement;
  while (activeElement.shadowRoot && activeElement.shadowRoot.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }
  return activeElement;
};
