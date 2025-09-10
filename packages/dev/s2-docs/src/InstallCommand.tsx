'use client';

import {CopyButton} from './CopyButton';
import {Key} from 'react-aria-components';
import {Pre} from './CodePlatter';
import React, {useEffect, useMemo, useState} from 'react';
import {SegmentedControl, SegmentedControlItem} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

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

type PkgManager = 'yarn' | 'npm' | 'pnpm';

export interface InstallCommandProps {
  /** The package name(s) to install, e.g. "@react-spectrum/s2" or multiple separated by spaces. */
  pkg: string,
  /** Optional flags appended after the package name(s), e.g. "--dev". */
  flags?: string,
  /** Optional label preceding the code block. */
  label?: string
}

export function InstallCommand({pkg, flags, label}: InstallCommandProps) {
  let [manager, setManager] = useState<PkgManager>('yarn');

  useEffect(() => {
    let stored = localStorage.getItem('packageManager');
    if (stored === 'npm' || stored === 'pnpm' || stored === 'yarn') {
      setManager(stored);
    }
  }, []);

  let onSelectionChange = (key: Key) => {
    let value = String(key) as PkgManager;
    setManager(value);
    localStorage.setItem('packageManager', value);
  };

  let command = useMemo(() => {
    let parts: string[] = [];
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
    if (flags) {
      parts.push(flags);
    }
    return parts.join(' ');
  }, [manager, pkg, flags]);

  return (
    <div className={container} data-example-switcher>
      <SegmentedControl selectedKey={manager} onSelectionChange={onSelectionChange} styles={switcher}>
        <SegmentedControlItem id="yarn">yarn</SegmentedControlItem>
        <SegmentedControlItem id="npm">npm</SegmentedControlItem>
        <SegmentedControlItem id="pnpm">pnpm</SegmentedControlItem>
      </SegmentedControl>
      <div className={codeWrap}>
        {label && <div className={style({font: 'body-sm', marginBottom: 8, color: 'body'})}>{label}</div>}
        <div className={style({display: 'flex', alignItems: 'center', gap: 12})}>
          <Pre>{command}</Pre>
          <CopyButton ariaLabel="Copy command" tooltip="Copy command" text={command} />
        </div>
      </div>
    </div>
  );
}

export default InstallCommand;
