import {ReactElement} from 'react';

// The doc generator is not smart enough to handle the real types for ContextualHelpTrigger so this is a simpler one.
export interface ContextualHelpTriggerProps {
  /** Whether the menu item is currently unavailable. */
  isUnavailable?: boolean,
  /** The Item which triggers opening of the Dialog, and the Dialog itself. */
  children: [ReactElement, ReactElement]
}
