'use client';

import {CopyButton} from './CopyButton';
import {iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Key} from 'react-aria-components';
import Prompt from '@react-spectrum/s2/icons/Prompt';
import React, {useMemo} from 'react';
import {SegmentedControl, SegmentedControlItem} from '@react-spectrum/s2';
import {useLocalStorage} from './useLocalStorage';

const container = style({
  backgroundColor: 'layer-1',
  marginY: 20,
  borderRadius: 'xl',
  display: 'flex',
  flexDirection: 'column'
});

const switcher = style({
  marginTop: {
    default: 12,
    lg: 24
  },
  marginStart: {
    default: 12,
    lg: 24
  }
});

const codeWrap = style({
  padding: 16
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

type PkgManager = 'yarn' | 'npm' | 'pnpm';

export interface InstallCommandProps {
  /** The package name(s) to install, e.g. "@react-spectrum/s2" or multiple separated by spaces. */
  pkg: string,
  /** Optional flags appended after the package name(s), e.g. "--dev". */
  flags?: string,
  /** Optional label preceding the code block. */
  label?: string,
  /** If true, renders an npx command instead of install (hides manager switcher). */
  isCommand?: boolean
}

export function InstallCommand({pkg, flags, label, isCommand}: InstallCommandProps) {
  let [manager, setManager] = useLocalStorage('packageManager', 'npm');

  let onSelectionChange = (key: Key) => {
    let value = String(key) as PkgManager;
    setManager(value);
  };

  let command = useMemo(() => {
    let parts: string[] = [];
    if (isCommand) {
      parts = ['npx', pkg];
    } else {
      switch (manager) {
        case 'yarn':
          parts = ['yarn', 'add'];
          break;
        case 'npm':
          parts = ['npm', 'install'];
          break;
        case 'pnpm':
          parts = ['pnpm', 'add'];
          break;
      }
      parts.push(pkg);
    }
    if (flags) {
      parts.push(flags);
    }
    return parts.join(' ');
  }, [isCommand, manager, pkg, flags]);

  return (
    <div className={container} data-example-switcher>
      {!isCommand && (
        <SegmentedControl selectedKey={manager} onSelectionChange={onSelectionChange} styles={switcher}>
          <SegmentedControlItem id="npm">npm</SegmentedControlItem>
          <SegmentedControlItem id="yarn">yarn</SegmentedControlItem>
          <SegmentedControlItem id="pnpm">pnpm</SegmentedControlItem>
        </SegmentedControl>
      )}
      <div className={codeWrap}>
        {label && <div className={style({font: 'body-sm', marginBottom: 8, color: 'body'})}>{label}</div>}
        <div className={style({display: 'flex', alignItems: 'center', gap: 12, padding: 8})}>
          <Prompt styles={iconStyle({size: 'L'})} />
          <pre className={preStyle}>{command}</pre>
          <CopyButton ariaLabel="Copy command" tooltip="Copy command" text={command} />
        </div>
      </div>
    </div>
  );
}

export default InstallCommand;
