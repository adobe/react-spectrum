export function clamp(number, min = -Infinity, max = Infinity) {
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

/**
 * Corrects floating point errors when adding or subtracting values.
 * @param   {String} operator '+' or '-'
 * @param   {Number} value1   Starting value
 * @param   {Number} value1   Value to be added or subtracted
 * @returns {Number} The returned value
 */
export function handleDecimalOperation(operator, value1, value2) {
  let result = operator === '+' ? value1 + value2 : value1 - value2;

  // Check if we have decimals
  if (value1 % 1 !== 0 || value2 % 1 !== 0) {
    const value1Decimal = value1.toString().split('.');
    const value2Decimal = value2.toString().split('.');
    const value1DecimalLength = (value1Decimal[1] && value1Decimal[1].length) || 0;
    const value2DecimalLength = (value2Decimal[1] && value2Decimal[1].length) || 0;
    const multiplier = Math.pow(10, Math.max(value1DecimalLength, value2DecimalLength));

    // Transform the decimals to integers based on the precision
    value1 = Math.round(value1 * multiplier);
    value2 = Math.round(value2 * multiplier);

    // Perform the operation on integers values to make sure we don't get a fancy decimal value
    result = operator === '+' ? value1 + value2 : value1 - value2;

    // Transform the integer result back to decimal
    result /= multiplier;
  }

  return result;
}

