'use client';

import {ActionButton, ActionButtonGroup, Menu, MenuItem, MenuTrigger, Text, Tooltip, TooltipTrigger} from '@react-spectrum/s2';
import Copy from '@react-spectrum/s2/icons/Copy';
import Download from '@react-spectrum/s2/icons/Download';
import ExportTo from '@react-spectrum/s2/icons/ExportTo';
import Link from '@react-spectrum/s2/icons/Link';
import More from '@react-spectrum/s2/icons/More';
import {ReactNode, useRef} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {createCodeSandbox, getCodeSandboxFiles} from './CodeSandbox';
import {createStackBlitz} from './StackBlitz';
import {zip} from './zip';

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

interface CodePlatterProps {
  children: ReactNode,
  shareUrl?: string,
  files?: {[name: string]: string},
  type?: 'vanilla' | 'tailwind' | 's2'
}

export function CodePlatter({children, shareUrl, files, type}: CodePlatterProps) {
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
          {(shareUrl || files || type) && <MenuTrigger>
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
              {(files || type) && <MenuItem
                onAction={() => {
                  let code = codeRef.current!.querySelector('pre')!.textContent!;
                  createCodeSandbox({
                    ...files,
                    'Example.tsx': transformExampleCode(code)
                  }, type);
                }}>
                <ExportTo />
                <Text slot="label">Open in CodeSandbox</Text>
              </MenuItem>}
              {(files || type) && type !== 's2' && <MenuItem
                onAction={() => {
                  let code = codeRef.current!.querySelector('pre')!.textContent!;
                  createStackBlitz({
                    ...files,
                    'Example.tsx': transformExampleCode(code)
                  }, type);
                }}>
                <ExportTo />
                <Text slot="label">Open in StackBlitz</Text>
              </MenuItem>}
              {(files || type) && <MenuItem
                onAction={() => {
                  let code = codeRef.current!.querySelector('pre')!.textContent!;
                  let filesToDownload = getCodeSandboxFiles({
                    ...files,
                    'Example.tsx': transformExampleCode(code)
                  }, type);
                  let filesToZip = {};
                  for (let key in filesToDownload) {
                    if (filesToDownload[key]) {
                      filesToZip[key] = filesToDownload[key].content
                    }
                  }
                  let blob = zip(filesToZip);

                  let a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = 'example.zip';
                  a.hidden = true;
                  document.body.appendChild(a);

                  a.click();
                  a.remove();
                }}>
                <Download />
                <Text slot="label">Download ZIP</Text>
              </MenuItem>}
            </Menu>
          </MenuTrigger>}
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

function transformExampleCode(code: string): string {
  // Add function wrapper around raw JSX in examples.
  return code.replace(/\n<((?:.|\n)+)/, (_, code) => {
    let res = '\nexport function Example() {\n  return (\n    <';
    let lines = code.split('\n');
    res += lines.shift();

    for (let line of lines) {
      res += '\n    ' + line;
    }

    res += '\n  );\n}\n';
    return res;
  });
}
