export const getOwnerDocument = (el: Element | null): Document => {
  return el?.ownerDocument ?? document;
};

export const getOwnerWindow = (
  el: Element | null
): Window & typeof global => {
  return el?.ownerDocument?.defaultView ?? window;
};
