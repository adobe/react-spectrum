export function getOffset(element, reverse, orientation = 'horizontal') {
  let rect = element.getBoundingClientRect();
  if (reverse) {
    return orientation === 'horizontal' ? rect.right : rect.bottom;
  }
  return orientation === 'horizontal' ? rect.left : rect.top;
}
