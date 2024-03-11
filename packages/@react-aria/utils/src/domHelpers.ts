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

export const getRootNode = (el: Element | null | undefined): Document | (ShadowRoot & {
  body: ShadowRoot
}) => {
  const rootNode = el?.getRootNode() ?? document;

  if (rootNode instanceof ShadowRoot) {
    rootNode.body = rootNode;
  }

  return rootNode;
};

export const getDeepActiveElement = () => {
  let activeElement = document.activeElement;
  while (activeElement.shadowRoot && activeElement.shadowRoot.activeElement) {
    activeElement = activeElement.shadowRoot.activeElement;
  }
  return activeElement;
};
