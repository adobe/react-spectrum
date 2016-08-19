const validPositions = ['top', 'bottom', 'middle', 'left', 'right', 'center'];

export function getTetherPositionFromPlacement(placement) {
  switch (placement) {
    case 'left': return 'left center';
    case 'right': return 'right center';
    case 'top': return 'top center';
    case 'bottom': return 'bottom center';
    default: {
      const positions = placement.split(' ');
      let error;
      if (positions.length !== 2) {
        error = `Two of the following positions: ${ validPositions.join(', ') } must be supplied `;
        error += 'for a placement to be valid (e.g. \'right top\' or \'bottom left\').';
      } else {
        positions.forEach(pos => {
          if (!error && validPositions.every(validPos => validPos !== pos)) {
            error = `${ pos } is not a valid position. Use 2 positions in a placement: `;
            error += `${ validPositions.join(', ') } (e.g. 'right top' or 'bottom left').`;
          }
        });
      }

      if (error) {
        throw new Error(error);
      }

      return placement;
    }
  }
}
