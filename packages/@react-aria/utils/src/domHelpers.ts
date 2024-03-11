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
