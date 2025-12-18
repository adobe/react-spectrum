'use client';

import {CopyButton} from './CopyButton';
import {iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import Prompt from '@react-spectrum/s2/icons/Prompt';
import React from 'react';

const container = style({
  backgroundColor: 'layer-1',
  marginY: 20,
  borderRadius: 'xl',
  display: 'flex',
  flexDirection: 'column'
});

const codeWrap = style({
  padding: 16
});

const codeContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: 4
});

const preStyle = style({
  font: {default: 'code-xs', lg: 'code-sm'},
  overflowX: 'auto',
  paddingY: 8,
  paddingX: 0,
  margin: 0,
  whiteSpace: 'pre',
  flex: 1,
  minWidth: 0,
  overflow: 'auto'
});

export interface CommandProps {
  /** The command to display. */
  command: string,
  /** Optional label preceding the code block. */
  label?: string
}

export function Command({command, label}: CommandProps) {
  return (
    <div className={container} data-example-switcher>
      <div className={codeWrap}>
        {label && <div className={style({font: 'body-sm', marginBottom: 8, color: 'body'})}>{label}</div>}
        <div className={codeContainer}>
          <Prompt styles={iconStyle({size: 'L'})} />
          <pre className={preStyle}>{command}</pre>
          <CopyButton ariaLabel="Copy command" tooltip="Copy command" text={command} />
        </div>
      </div>
    </div>
  );
}

export default Command;
