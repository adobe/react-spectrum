export function getOffset(element, reverse) {
  let rect = element.getBoundingClientRect();
  if (reverse) {
    return {x: rect.right, y: rect.bottom};
  }
  return {x: rect.left, y: rect.top};
}
