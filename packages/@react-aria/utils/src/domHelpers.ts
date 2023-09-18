export const ownerDocument = (el: Element | null): Document => {
  return el?.ownerDocument ?? document;
};

export const ownerWindow = (el: Element | null): Window & typeof globalThis => {
  return el?.ownerDocument?.defaultView ?? window;
};
