'use client';
import CopyButton from './CopyButton';
import {iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Key, SegmentedControl, SegmentedControlItem} from '@react-spectrum/s2';
import Prompt from '@react-spectrum/s2/icons/Prompt';
import {RefObject} from 'react';
import {useLocalStorage} from './useLocalStorage';

export function ShadcnCommand({registryUrl, preRef}: {registryUrl: string, preRef?: RefObject<HTMLPreElement | null>}) {
  let [packageManager, setPackageManager] = useLocalStorage('packageManager', 'npm');
  let command = packageManager;
  if (packageManager === 'npm') {
    command = 'npx';
  } else if (packageManager === 'pnpm') {
    command = 'pnpm dlx';
  }

  let onSelectionChange = (value: Key) => {
    setPackageManager(String(value));
  };

  let cmd = `${command} shadcn@latest add ${process.env.REGISTRY_URL || 'http://localhost:8081'}/${registryUrl}`;
  
  return (
    <div 
      className={style({
        backgroundColor: 'layer-1',
        borderRadius: 'xl',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      })}>
      <SegmentedControl aria-label="Package manager" selectedKey={packageManager} onSelectionChange={onSelectionChange}>
        <SegmentedControlItem id="npm">npm</SegmentedControlItem>
        <SegmentedControlItem id="yarn">yarn</SegmentedControlItem>
        <SegmentedControlItem id="pnpm">pnpm</SegmentedControlItem>
      </SegmentedControl>
      <div
        className={style({
          display: 'flex',
          alignItems: 'center',
          gap: 12
        })}>
        <Prompt styles={iconStyle({size: 'L'})} />
        <pre
          ref={preRef}
          className={style({
            font: {default: 'code-xs', lg: 'code-sm'},
            overflowX: 'auto',
            padding: 0,
            margin: 0
          })}>
          {cmd}
        </pre>
        <CopyButton ariaLabel="Copy command" tooltip="Copy command" text={cmd} />
      </div>
    </div>
  );
}
