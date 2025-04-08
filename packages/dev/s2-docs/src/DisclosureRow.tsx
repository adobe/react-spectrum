'use client';

import { useDisclosureState } from 'react-stately';
import {TableBody, TableCell, TableRow} from './Table';
import { useRef } from 'react';
import { useDisclosure } from 'react-aria';
import { Button } from 'react-aria-components';
import { baseColor, focusRing, style } from '@react-spectrum/s2/style' with {type: 'macro'};
import Chevron from '@react-spectrum/s2/icons/ChevronRight';

const tableCell = style({
  padding: 0,
  borderWidth: 0,
  borderBottomWidth: {
    default: 1,
    ':is(tbody:last-child > tr:last-child > &)': 0
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

const chevronStyles = style({
  size: 16,
  rotate: {
    isRTL: 180,
    isExpanded: 90
  },
  transition: 'default',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  flexShrink: 0
});

export function DisclosureRow({title, children, defaultExpanded}) {
  let state = useDisclosureState({defaultExpanded});
  let ref = useRef(null);
  let {buttonProps, panelProps} = useDisclosure({}, state, ref);

  return (
    <TableBody>
      <TableRow>
        <td colSpan={3} className={tableCell}>
          <Button {...buttonProps} className={p => buttonStyles({...p, isExpanded: state.isExpanded})}>
            <Chevron UNSAFE_className={chevronStyles({isExpanded: state.isExpanded})} />
            {title}
          </Button>
        </td>
      </TableRow>
      {state.isExpanded && children}
    </TableBody>
  );
}
