import {DOMProps} from '@react-types/shared';

// IMPORTANT: this needs to be synced with the TypeScript definition of DOMProps
const DOMPropNames = {
  id: 1,
  tabIndex: 1,
  'aria-label': 1,
  'aria-labelledby': 1,
  'aria-describedby': 1,
  'aria-controls': 1,
  'aria-owns': 1,
  'aria-hidden': 1
};

export const KeyboardEvents = {
  onKeyDown: 1,
  onKeyUp: 1
};

export const FocusEvents = {
  onFocus: 1,
  onBlur: 1
};

/**
 * Checking for data-* props
 */
const propRe = /^(data-.*)$/;

// Filters out all props that aren't valid DOM props or are user defined via override prop obj.
export function filterDOMProps(props, override = {}): DOMProps {
  const filterProps = {};
  const propFilter = Object.assign({}, DOMPropNames, override);

  for (const prop in props) {
    if (props.hasOwnProperty(prop) && (propFilter[prop] || propRe.test(prop))) {
      filterProps[prop] = props[prop];
    }
  }

  return filterProps;
}
