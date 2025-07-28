'use client';

import {ActionButton, ActionButtonGroup, Button, ButtonGroup, Content, createIcon, Dialog, DialogContainer, Heading, Link, Menu, MenuItem, MenuTrigger, SegmentedControl, SegmentedControlItem, Text, Tooltip, TooltipTrigger} from '@react-spectrum/s2';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import Copy from '@react-spectrum/s2/icons/Copy';
import {createCodeSandbox, getCodeSandboxFiles} from './CodeSandbox';
import {createStackBlitz} from './StackBlitz';
import Download from '@react-spectrum/s2/icons/Download';
import {iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Key} from 'react-aria';
import LinkIcon from '@react-spectrum/s2/icons/Link';
import More from '@react-spectrum/s2/icons/More';
import Polygon4 from '@react-spectrum/s2/icons/Polygon4';
import Prompt from '@react-spectrum/s2/icons/Prompt';
import {ReactNode, useEffect, useRef, useState} from 'react';
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
  type?: 'vanilla' | 'tailwind' | 's2',
  registryUrl?: string
}

export function CodePlatter({children, shareUrl, files, type, registryUrl}: CodePlatterProps) {
  let codeRef = useRef<HTMLDivElement | null>(null);
  let [showShadcn, setShowShadcn] = useState(false);
  let [isCopied, setIsCopied] = useState(false);
  let timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  let handleCopy = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    navigator.clipboard.writeText(codeRef.current!.querySelector('pre')!.textContent!).then(() => {
      setIsCopied(true);
      timeout.current = setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
      // TODO: trigger a toast if copy failed
    });
  };

  return (
    <div className={platterStyle}>
      <div className={style({display: 'flex', justifyContent: 'end', float: 'inline-end', padding: 16, position: 'relative'})}>
        <ActionButtonGroup
          orientation="vertical"
          isQuiet
          density="regular"
          size="S">
          <TooltipTrigger placement="end">
            <ActionButton aria-label="Copy code" onPress={handleCopy}>
              {isCopied ? <CheckmarkCircle /> : <Copy />}
            </ActionButton>
            <Tooltip>Copy code</Tooltip>
          </TooltipTrigger>
          {(shareUrl || files || type || registryUrl) && <MenuTrigger>
            <TooltipTrigger placement="end">
              <ActionButton aria-label="Share">
                <More />
              </ActionButton>
              <Tooltip>Share</Tooltip>
            </TooltipTrigger>
            <Menu hideLinkOutIcon>
              {shareUrl && 
                <MenuItem
                  onAction={() => {
                    // Find previous heading element to get hash.
                    let url = new URL(shareUrl, location.href);
                    let node: Element | null = codeRef.current;
                    while (node && node.parentElement?.tagName !== 'ARTICLE') {
                      node = node.parentElement;
                    }
                    while (node && !(node instanceof HTMLHeadingElement)) {
                      node = node.previousElementSibling;
                    }
                    if (node instanceof HTMLHeadingElement && node.id) {
                      url.hash = '#' + node.id;
                    }
                    navigator.clipboard.writeText(url.toString());
                  }}>
                  <LinkIcon />
                  <Text slot="label">Copy link</Text>
                </MenuItem>
              }
              {(files || type) && 
                <MenuItem
                  onAction={() => {
                    let code = codeRef.current!.querySelector('pre')!.textContent!;
                    createCodeSandbox({
                      ...files,
                      'Example.tsx': transformExampleCode(code)
                    }, type);
                  }}>
                  <Polygon4 />
                  <Text slot="label">Open in CodeSandbox</Text>
                </MenuItem>
              }
              {(files || type) && type !== 's2' && 
                <MenuItem
                  onAction={() => {
                    let code = codeRef.current!.querySelector('pre')!.textContent!;
                    createStackBlitz({
                      ...files,
                      'Example.tsx': transformExampleCode(code)
                    }, type);
                  }}>
                  <Flash />
                  <Text slot="label">Open in StackBlitz</Text>
                </MenuItem>
              }
              {registryUrl && 
                <MenuItem 
                  href={`https://v0.dev/chat/api/open?url=${registryUrl}`}
                  target="_blank"
                  rel="noopener noreferrer">
                  <V0 />
                  <Text>Open in v0</Text>
                </MenuItem>
              }
              {registryUrl && 
                <MenuItem onAction={() => setShowShadcn(true)}>
                  <Prompt />
                  <Text>Install with shadcn</Text>
                </MenuItem>
              }
              {(files || type) && 
                <MenuItem
                  onAction={() => {
                    let code = codeRef.current!.querySelector('pre')!.textContent!;
                    let filesToDownload = getCodeSandboxFiles({
                      ...files,
                      'Example.tsx': transformExampleCode(code)
                    }, type);
                    let filesToZip = {};
                    for (let key in filesToDownload) {
                      if (filesToDownload[key]) {
                        filesToZip[key] = filesToDownload[key].content;
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
                </MenuItem>
              }
            </Menu>
          </MenuTrigger>}
        </ActionButtonGroup>
      </div>
      <div ref={codeRef}> 
        {children}
      </div>
      <DialogContainer onDismiss={() => setShowShadcn(false)}>
        {showShadcn &&
          <ShadcnDialog registryUrl={registryUrl} />
        }
      </DialogContainer>
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

const V0 = createIcon(props => (
  <svg viewBox="0 0 40 20" {...props}>
    <path
      d="M23.3919 0H32.9188C36.7819 0 39.9136 3.13165 39.9136 6.99475V16.0805H36.0006V6.99475C36.0006 6.90167 35.9969 6.80925 35.9898 6.71766L26.4628 16.079C26.4949 16.08 26.5272 16.0805 26.5595 16.0805H36.0006V19.7762H26.5595C22.6964 19.7762 19.4788 16.6139 19.4788 12.7508V3.68923H23.3919V12.7508C23.3919 12.9253 23.4054 13.0977 23.4316 13.2668L33.1682 3.6995C33.0861 3.6927 33.003 3.68923 32.9188 3.68923H23.3919V0Z"
      fill="var(--iconPrimary)" />
    <path
      d="M13.7688 19.0956L0 3.68759H5.53933L13.6231 12.7337V3.68759H17.7535V17.5746C17.7535 19.6705 15.1654 20.6584 13.7688 19.0956Z"
      fill="var(--iconPrimary)" />
  </svg> 
));

const Flash = createIcon(props => (
  <svg viewBox="0 0 20 20" {...props}>
    <path d="M9.20215,18.76367c-.18262,0-.37012-.03711-.55078-.11621-.62598-.27051-.94238-.91992-.77051-1.5791l1.17383-4.50586-3.34863.06348c-.52441,0-1.00879-.28418-1.26465-.74121-.25684-.45801-.24512-1.01953.02832-1.4668L9.7002,1.88574c.35547-.58203,1.04297-.80664,1.67383-.53906.62988.26465.95312.91211.78613,1.57422l-1.20508,4.7959,3.33887-.06152c.52734,0,1.01465.28711,1.26953.74902s.23926,1.02637-.04199,1.47266l-5.19141,8.25098c-.25781.40918-.68066.63574-1.12793.63574ZM9.10254,11.12598c.45215,0,.87109.20508,1.14746.5625.27637.3584.37012.81445.25586,1.25195l-.92969,3.56836,4.62695-7.35352h-3.29688c-.4502,0-.86719-.20312-1.14355-.55859-.27637-.35449-.37207-.80859-.2627-1.24512l.96582-3.84473-4.7168,7.69434,3.35352-.0752Z" fill="var(--iconPrimary, #222)" strokeWidth="0" />
  </svg>
));

function ShadcnDialog({registryUrl}) {
  let [packageManager, setPackageManager] = useState<Key>('npm');
  let command = packageManager;
  if (packageManager === 'npx') {
    command = 'npx';
  } else if (packageManager === 'pnpm') {
    command = 'pnpm dlx';
  }

  let componentName = registryUrl.match(/([^/]+)\.json$/)[1];
  let preRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    let value = localStorage.getItem('packageManager');
    if (value) {
      setPackageManager(value);
    }
  }, []);

  let onSelectionChange = value => {
    setPackageManager(value);
    localStorage.setItem('packageManager', value);
  };

  return (
    <Dialog size="L">
      {({close}) => (<>
        <Heading slot="title">Install with shadcn</Heading>
        <Content>
          <p>Use the <Link href="https://ui.shadcn.com/docs/cli" target="_blank" rel="noopener noreferrer">shadcn CLI</Link> to install {componentName} and its dependencies into your project.</p>
          <div 
            className={style({
              backgroundColor: 'layer-1',
              borderRadius: 'xl',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            })}>
            <SegmentedControl selectedKey={packageManager} onSelectionChange={onSelectionChange}>
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
                {command} shadcn@latest add {registryUrl}
              </pre>
            </div>
          </div>
        </Content>
        <ButtonGroup>
          <Button variant="secondary" slot="close">Cancel</Button>
          <Button
            variant="accent"
            onPress={() => {
              navigator.clipboard.writeText(preRef.current!.textContent!);
              close();
            }}>
            Copy and close
          </Button>
        </ButtonGroup>
      </>)}
    </Dialog>
  );
}
