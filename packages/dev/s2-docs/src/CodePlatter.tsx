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
  '--code-padding': {
    type: 'paddingTop',
    value: 16
  },
  padding: '--code-padding',
  position: 'relative'
});

export function CodePlatter({children, shareUrl}: {children: ReactNode, shareUrl?: string}) {
  let codeRef = useRef<HTMLPreElement | null>(null);
  return (
    <div className={platterStyle}>
      <div className={style({display: 'flex', justifyContent: 'end', float: 'inline-end', paddingStart: 16})}>
        <ActionButtonGroup
          orientation="vertical"
          isQuiet
          density="regular"
          size="S">
          <TooltipTrigger placement="end">
            <ActionButton aria-label="Copy code" onPress={() => navigator.clipboard.writeText(codeRef.current!.textContent!)}>
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
      <pre ref={codeRef} className={style({borderRadius: 'lg', font: 'code-sm', whiteSpace: 'pre-wrap', margin: 0})} style={{overflowWrap: 'break-word'}}>
        {children}
      </pre>
    </div>
  );
}
