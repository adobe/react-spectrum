import {DOMProps} from '@react-types/shared';

// IMPORTANT: this needs to be synced with the TypeScript definition of DOMProps
const DOMPropNames = {
  id: 1,
  tabIndex: 1,
  role: 1,
  'aria-label': 1,
  'aria-labelledby': 1,
  'aria-describedby': 1,
  'aria-controls': 1,
  'aria-owns': 1,
  'aria-hidden': 1
};

// Sync with TypeScript definition of TextInputDOMProps
export const TextInputDOMPropNames = {
  autoComplete: 1,
  maxLength: 1,
  minLength: 1,
  name: 1,
  pattern: 1,
  placeholder: 1,
  type: 1,
  inputMode: 1,

  // Clipboard events
  onCopy: 1,
  onCut: 1,
  onPaste: 1,

  // Composition events
  onCompositionEnd: 1,
  onCompositionStart: 1,
  onCompositionUpdate: 1,

  // Selection events
  onSelect: 1,

  // Input events
  onBeforeInput: 1,
  onInput: 1
};

/**
 * Checking for data-* props
 */
const propRe = /^(data-.*)$/;

// Filters out all props that aren't valid DOM props or are user defined via override prop obj.
export function filterDOMProps(props, override = {}): DOMProps {
  const filterProps = {};
  const propFilter = {...DOMPropNames, ...override};

  for (const prop in props) {
    if (props.hasOwnProperty(prop) && (propFilter[prop] || propRe.test(prop))) {
      filterProps[prop] = props[prop];
    }
  }

  return filterProps;
}
