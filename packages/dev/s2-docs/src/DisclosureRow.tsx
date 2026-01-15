'use client';

import {Button} from 'react-aria-components';
import Chevron from '@react-spectrum/s2/icons/ChevronRight';
import {focusRing, iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {TableBody, TableRow} from './Table';
import {useDisclosure} from 'react-aria';
import {useDisclosureState} from 'react-stately';
import {useRef} from 'react';

const tableCell = style({
  padding: 0,
  borderWidth: 0,
  borderBottomWidth: {
    default: 1,
    ':is(tbody:last-child > tr:last-child > *)': 0
  },
  borderStyle: 'solid',
  borderColor: 'gray-300',
  boxSizing: 'border-box',
  display: {
    default: 'block',
    sm: '[table-cell]'
  }
});

const buttonStyles = style({
  ...focusRing(),
  outlineOffset: -2,
  font: 'title-sm',
  color: 'neutral',
  size: 'full',
  backgroundColor: {
    default: 'transparent',
    isHovered: 'gray-100',
    isFocusVisible: 'gray-100',
    isPressed: 'gray-300',
    isExpanded: {
      default: 'gray-100',
      isHovered: 'gray-200',
      isFocusVisible: 'gray-200',
      isPressed: 'gray-300'
    }
  },
  borderWidth: 0,
  paddingX: 16,
  paddingY: 8,
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  transition: 'default',
  textAlign: 'start',
  disableTapHighlight: true
});

const chevronStyles = iconStyle({
  size: 'S',
  color: 'neutral',
  // @ts-ignore - TODO: support conditions in iconStyle types?
  rotate: {
    isRTL: 180,
    isExpanded: 90
  },
  transition: 'default',
  flexShrink: 0
});

export function DisclosureRow({title, children, defaultExpanded}) {
  let state = useDisclosureState({defaultExpanded});
  let ref = useRef(null);
  let {buttonProps} = useDisclosure({}, state, ref);
  delete buttonProps['aria-controls']; // there is no panel element in this implementation

  return (
    <TableBody>
      <TableRow>
        <td colSpan={3} className={tableCell}>
          <Button {...buttonProps} className={p => buttonStyles({...p, isExpanded: state.isExpanded})}>
            {/* @ts-ignore */}
            <Chevron styles={chevronStyles({isExpanded: state.isExpanded})} />
            {title}
          </Button>
        </td>
      </TableRow>
      {state.isExpanded && children}
    </TableBody>
  );
}
