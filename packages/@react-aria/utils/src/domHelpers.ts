export const getOwnerDocument = (el: Element | null | undefined): Document => {
  return el?.ownerDocument ?? document;
};

export const getOwnerWindow = (
  el: (Window & typeof global) | Element | null | undefined
): Window & typeof global => {
  if (el && 'window' in el && el.window === el) {
    return el;
  }

  const doc = getOwnerDocument(el as Element | null | undefined);
  return doc.defaultView || window;
};

export const getRootNode = (
  el: Element | null | undefined
): Document | ShadowRoot | null => {
  if (!el) {
    // Return the main document if the element is null or undefined
    return document;
  }

  // If the element is disconnected from the DOM, return null
  if (!el.isConnected) {
    return null;
  }

  // Get the root node of the element, or default to the document
  const rootNode = el.getRootNode ? el.getRootNode() : document;

  // Use nodeType to check the type of the rootNode
  // We use nodeType instead of instanceof checks because instanceof fails across different
  // contexts (e.g., iframes or windows), as each context has its own global objects and constructors.
  // nodeType is a primitive value and is consistent across different contexts, making it
  // reliable for cross-context type checking.
  if (isDocument(rootNode)) {
    // rootNode is a Document
    return rootNode as Document;
  }

  if (isShadowRoot(rootNode)) {
    // rootNode is a ShadowRoot (a specialized type of DocumentFragment)
    // We check for the presence of the 'host' property to distinguish ShadowRoot from other DocumentFragments
    return rootNode as ShadowRoot;
  }

  // For other types of nodes or DocumentFragments that are not ShadowRoots, return null
  return null;
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
  if (isShadowRoot(root)) {
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

/**
 * Type guard for checking if a value is a Node
 */
function isNode(value: unknown): value is Node {
  return value !== null &&
    typeof value === 'object' &&
    'nodeType' in value &&
    typeof (value as Node).nodeType === 'number';
}

/**
 * Type guard for Document nodes
 */
export function isDocument(node: Node | null): node is Document {
  return isNode(node) && node.nodeType === Node.DOCUMENT_NODE;
}

/**
 * Type guard for ShadowRoot nodes
 * Uses both nodeType and host property checks to distinguish ShadowRoot from other DocumentFragments
 */
export function isShadowRoot(node: Node | null): node is ShadowRoot {
  return isNode(node) &&
    node.nodeType === Node.DOCUMENT_FRAGMENT_NODE &&
    'host' in node;
}
