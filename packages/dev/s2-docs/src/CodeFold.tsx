'use client';

import {baseColor, focusRing, space, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Button, Disclosure, DisclosurePanel} from 'react-aria-components';
import Chevron from '../../../@react-spectrum/s2/ui-icons/Chevron';
import More from '@react-spectrum/s2/icons/More';
import {pressScale} from '@react-spectrum/s2';
import {ReactNode, useMemo, useRef} from 'react';

const trigger = style({
  ...focusRing(),
  borderRadius: 'sm',
  padding: 0,
  marginStart: space(-12),
  backgroundColor: 'transparent',
  borderStyle: 'none',
  whiteSpace: 'inherit',
  fontFamily: 'inherit',
  fontSize: 'inherit'
});

const chevronStyles = style({
  rotate: {
    isRTL: 180,
    isExpanded: 90
  },
  transition: 'default',
  color: 'neutral',
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  flexShrink: 0,
  marginEnd: 4
});

const more = style({
  backgroundColor: baseColor('gray-100'),
  transition: 'default',
  borderRadius: 'sm',
  paddingX: 4,
  marginX: 4,
  height: 16,
  display: 'inline-flex',
  alignItems: 'center',
  verticalAlign: 'middle',
  userSelect: 'none',
  '--iconPrimary': {
    type: 'fill',
    value: 'gray-1000'
  }
});

export function CodeFold({children}) {
  let ref = useRef(null);
  let [firstLine, collapsed, lastLine] = useMemo(() => {
    let firstLine: ReactNode[] = [];
    let collapsed: ReactNode[] = [];
    let lastLine: ReactNode[] = [];

    // Iterate forward to find the first newline.
    for (let [i, child] of children.entries()) {
      if (typeof child === 'string') {
        let index = child.indexOf('\n');
        if (index === 0) {
          collapsed = children.slice(i);
          break;
        } else if (index > 0) {
          firstLine.push(child.slice(0, index));
          if (index < child.length) {
            collapsed.push(child.slice(index));
          }
          collapsed.push(...children.slice(i + 1));
          break;
        }
      }

      firstLine.push(child);
    }

    // Iterate backward to find the last newline.
    for (let i = collapsed.length - 1; i >= 0; i--) {
      let child = collapsed[i];
      if (typeof child === 'string') {
        let c = child;
        if (i === collapsed.length - 1) {
          // Ignore the last newline if it is at the very end of the code.
          c = c.trimEnd();
        }
        let index = c.lastIndexOf('\n');
        if (index === 0) {
          break;
        } else if (index > 0) {
          lastLine.unshift(c.slice(index));
          break;
        }
      }

      lastLine.unshift(child);
    }

    if (typeof collapsed[0] === 'string') {
      collapsed[0] = collapsed[0].replace(/^\n/, '');
    }

    if (typeof lastLine[0] === 'string') {
      lastLine[0] = lastLine[0].trimStart();
    }

    return [firstLine, collapsed, lastLine];
  }, [children]);

  return (
    <Disclosure>
      {({isExpanded}) => (<>
        <Button
          slot="trigger"
          className={trigger}>
          {({isHovered, isPressed, isFocusVisible}) => (<>
            <Chevron size="S" aria-hidden className={chevronStyles({isExpanded, isHovered, isPressed, isFocusVisible})} />
            {firstLine}{!isExpanded 
              ? <><span ref={ref} style={pressScale(ref)({isPressed})} className={more({isHovered, isPressed, isFocusVisible})}><More UNSAFE_style={{width: 14}} /></span>{lastLine}</> 
              : null}
          </>)}
        </Button>
        <DisclosurePanel>{collapsed}</DisclosurePanel>
      </>)}
    </Disclosure>
  );
}
