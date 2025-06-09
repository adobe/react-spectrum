'use client';

import {cloneElement, createElement, isValidElement} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

interface ExampleOutputProps {
  component?: any,
  props?: Record<string, any>,
  align?: 'start' | 'center' | 'end'
}

export function ExampleOutput({component, props = {}, align = 'center'}: ExampleOutputProps) {
  return (
    <div 
      className={style({
        display: 'flex',
        flexDirection: 'column',
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
        padding: 24,
        boxSizing: 'border-box'
      })({align})}
      style={{background: getBackgroundColor(props.staticColor)}}>
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
