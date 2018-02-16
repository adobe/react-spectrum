export default (node, parentNode, alignToStart) => {
  if (parentNode && parentNode.contains(node)) {
    const {clientHeight, clientWidth, scrollTop, scrollLeft} = parentNode;
    const {offsetHeight, offsetWidth, offsetTop, offsetLeft} = node;
    const parentPosition = window.getComputedStyle(parentNode).position;
    let parentOffsetTop = parentNode.offsetTop;
    let parentOffsetLeft = parentNode.offsetLeft;

    if (parentPosition !== 'static') {
      parentOffsetTop = parentOffsetLeft = 0;
    }

    if (offsetTop < scrollTop) {
      parentNode.scrollTop = offsetTop;
    } else {
      const offsetBottom = offsetTop + offsetHeight;
      const scrollBottom = scrollTop + clientHeight;
      if (offsetBottom > scrollBottom) {
        parentNode.scrollTop = alignToStart ? offsetTop - parentOffsetTop : offsetBottom - clientHeight - parentOffsetTop;
      }
    }

    if (offsetLeft < scrollLeft) {
      parentNode.scrollLeft = offsetLeft;
    } else {
      const offsetRight = offsetLeft + offsetWidth;
      const scrollRight = scrollLeft + clientWidth;
      if (offsetRight > scrollRight) {
        parentNode.scrollLeft = alignToStart ? offsetLeft - parentOffsetLeft : offsetRight - clientWidth - parentOffsetLeft;
      }
    }
  }
};
