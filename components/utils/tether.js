export function getTetherPositionFromPlacement(placement) {
  switch(placement) {
    case 'left': return 'left center';
    case 'right': return 'right center';
    case 'top': return 'top center';
    case 'bottom': return 'bottom center';
    default: throw new Error('Invalid position - Must use left, right, top, or bottom');
  }
}
