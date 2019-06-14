import {AriaAttributes, CSSProperties} from 'react';

// Based on HTMLAttributes from React, but omitting common props that we override
export interface DOMProps extends AriaAttributes {
  // Standard HTML Attributes
  accessKey?: string,
  className?: string,
  contentEditable?: boolean,
  contextMenu?: string,
  dir?: string,
  draggable?: boolean,
  hidden?: boolean,
  id?: string,
  lang?: string,
  slot?: string,
  spellCheck?: boolean,
  style?: CSSProperties,
  tabIndex?: number,
  title?: string,

  // WAI-ARIA
  role?: string
}
