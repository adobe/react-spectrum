'use client';

import {cloneElement, createElement, isValidElement} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

interface ExampleOutputProps {
  component?: any,
  props?: Record<string, any>,
  align?: 'start' | 'center' | 'end',
  orientation?: 'horizontal' | 'vertical'
}

export function ExampleOutput({component, props = {}, align = 'center', orientation = 'horizontal'}: ExampleOutputProps) {
  return (
    <div 
      className={style({
        display: 'flex',
        flexDirection: {
          orientation: {
            horizontal: 'column',
            vertical: 'row'
          }
        },
        justifyContent: {
          align: {
            center: 'center',
            start: 'start',
            end: 'end'
          }
        },
        alignItems: 'center',
        width: 'full',
        overflow: 'auto',
        gridArea: 'example',
        borderRadius: 'lg',
        font: 'ui',
        padding: {
          default: 4,
          isOverBackground: {
            default: 12,
            lg: 24
          }
        },
        margin: {
          // Undo effect of padding, but keep so focus rings extend outside.
          default: -4,
          isOverBackground: 0
        },
        boxSizing: 'border-box'
      })({align, orientation, isOverBackground: Boolean(props.staticColor || props.isOverBackground)})}
      style={{background: getBackgroundColor(props.staticColor || (props.isOverBackground ? 'white' : undefined))}}>
      {isValidElement(component) ? cloneElement(component, props) : createElement(component, props)}
    </div>
  );
}

function getBackgroundColor(staticColor: 'black' | 'white' | undefined) {
  if (staticColor === 'black') {
    return 'linear-gradient(to right,#ddd6fe,#fbcfe8)';
  } else if (staticColor === 'white') {
    return 'linear-gradient(to right,#0f172a,#334155)';
  }
  return undefined;
}
