export function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

/**
 * Ensures that a given value is constrained within a given min, max and snaps to an appropriate step.
 * @param   {Number} rawValue The value to be snapped
 * @param   {Number} min      Minimum value of the range
 * @param   {Number} max      Maximum value of the range
 * @param   {Number} step     Step by which to increment/decrement values within the range.
 * @returns {Number} The snapped value
 */
export function snapValueToStep(rawValue, min, max, step) {
  step = parseFloat(step) || 1;
  let remainder = ((rawValue - min) % step);
  let snappedValue;
  let precision = step.toString().replace(/^(?:\d+)(?:\.(\d+))?$/g, '$1').length;

  if (Math.abs(remainder) * 2 >= step) {
    snappedValue = (rawValue - Math.abs(remainder)) + step;
  } else {
    snappedValue = rawValue - remainder;
  }

  if (snappedValue < min) {
    snappedValue = min;
  } else if (snappedValue > max) {
    snappedValue = min + Math.floor((max - min) / step) * step;
  }

  // correct floating point behavior by rounding to step precision
  if (precision > 0) {
    snappedValue = parseFloat(snappedValue.toFixed(precision));
  }

  return snappedValue;
}
