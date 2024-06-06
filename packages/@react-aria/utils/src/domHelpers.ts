export const getOwnerDocument = (el: Element | null | undefined): Document => {
  return el?.ownerDocument ?? document;
};

export const getOwnerWindow = (
  el: (Window & typeof global) | Element | null | undefined
): Window & typeof global => {
  if (el && 'window' in el && el.window === el) {
    return el;
  }

  const doc = getRootNode(el);
  return doc instanceof ShadowRoot ?  doc.ownerDocument.defaultView || window :  doc?.defaultView || window;
};

export const getRootNode = (el: Element | null | undefined): Document | ShadowRoot | null => {
  if (!el) {
    // Return the main document if the element is null or undefined
    return document;
  }

  const rootNode = el.getRootNode ? el.getRootNode() : document;

  // If the element is disconnected, return null
  if (!el.isConnected) {
    return null;
  }

  // Return the root node, which can be either a Document or a ShadowRoot
  return rootNode instanceof Document ? rootNode : rootNode as ShadowRoot;
};

/**
 * Retrieves a reference to the most appropriate "body" element for a given DOM context,
 * accommodating both traditional DOM and Shadow DOM environments. When used with a Shadow DOM,
 * it returns the body of the document to which the shadow root belongs, as shadow root is a document fragment,
 * meaning that it doesn't have a body. When used with a regular document, it simply returns the document's body.
 *
 * @param {Document | ShadowRoot} root - The root document or shadow root from which to find the body.
 * @returns {HTMLElement} - The "body" element of the document, or the document's body associated with the shadow root.
 */
export const getRootBody = (root: Document | ShadowRoot): HTMLElement => {
  if (root instanceof ShadowRoot) {
    return root.ownerDocument?.body;
  } else {
    return root.body;
  }
};


export const getDeepActiveElement = () => {
  let activeElement = document.activeElement;
  while (activeElement?.shadowRoot && activeElement.shadowRoot?.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }
  return activeElement;
};
