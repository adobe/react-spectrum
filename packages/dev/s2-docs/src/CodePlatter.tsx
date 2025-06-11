'use client';

import {ActionButton, ActionButtonGroup, Menu, MenuItem, MenuTrigger, Text, Tooltip, TooltipTrigger} from '@react-spectrum/s2';
import Copy from '@react-spectrum/s2/icons/Copy';
import ExportTo from '@react-spectrum/s2/icons/ExportTo';
import Link from '@react-spectrum/s2/icons/Link';
import More from '@react-spectrum/s2/icons/More';
import {ReactNode, useRef} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const platterStyle = style({
  backgroundColor: 'layer-2',
  borderRadius: 'lg',
  '--code-padding-x': {
    type: 'paddingTop',
    value: 16
  },
  '--code-padding-y': {
    type: 'paddingTop',
    value: 16
  },
  position: 'relative',
  maxHeight: 600,
  overflow: 'auto'
});

export function CodePlatter({children, shareUrl}: {children: ReactNode, shareUrl?: string}) {
  let codeRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className={platterStyle}>
      <div className={style({display: 'flex', justifyContent: 'end', float: 'inline-end', padding: 16, position: 'relative', zIndex: 1})}>
        <ActionButtonGroup
          orientation="vertical"
          isQuiet
          density="regular"
          size="S">
          <TooltipTrigger placement="end">
            <ActionButton aria-label="Copy code" onPress={() => navigator.clipboard.writeText(codeRef.current!.querySelector('pre')!.textContent!)}>
              <Copy />
            </ActionButton>
            <Tooltip>Copy code</Tooltip>
          </TooltipTrigger>
          <MenuTrigger>
            <TooltipTrigger placement="end">
              <ActionButton aria-label="Share">
                <More />
              </ActionButton>
              <Tooltip>Share</Tooltip>
            </TooltipTrigger>
            <Menu>
              {shareUrl && <MenuItem
                onAction={() => {
                  navigator.clipboard.writeText(shareUrl);
                }}>
                <Link />
                <Text slot="label">Copy Link</Text>
              </MenuItem>}
              <MenuItem>
                <ExportTo />
                <Text slot="label">Open in CodeSandbox</Text>
              </MenuItem>
              <MenuItem>
                <ExportTo />
                <Text slot="label">Open in StackBlitz</Text>
              </MenuItem>
            </Menu>
          </MenuTrigger>
        </ActionButtonGroup>
      </div>     
      <div ref={codeRef}> 
        {children}
      </div>
    </div>
  );
}

export function Pre({children}) {
  return (
    <pre className={style({borderRadius: 'lg', font: {default: 'code-xs', lg: 'code-sm'}, whiteSpace: 'pre-wrap', margin: 0, paddingX: '--code-padding-x', paddingY: '--code-padding-y'})} style={{overflowWrap: 'break-word'}}>
      {children}
    </pre>
  );
}
