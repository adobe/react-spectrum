'use client';

import {ActionButton, ActionButtonGroup, Button, ButtonGroup, Content, createIcon, Dialog, DialogContainer, Heading, Link, Menu, MenuItem, MenuTrigger, Text, UNSTABLE_ToastQueue as ToastQueue, Tooltip, TooltipTrigger} from '@react-spectrum/s2';
import {CopyButton} from './CopyButton';
import {createCodeSandbox, getCodeSandboxFiles} from './CodeSandbox';
import {createStackBlitz} from './StackBlitz';
import Download from '@react-spectrum/s2/icons/Download';
import {keyframes} from '../../../@react-spectrum/s2/style/style-macro' with {type: 'macro'};
import {Library} from './library';
import LinkIcon from '@react-spectrum/s2/icons/Link';
import OpenIn from '@react-spectrum/s2/icons/OpenIn';
import Polygon4 from '@react-spectrum/s2/icons/Polygon4';
import Prompt from '@react-spectrum/s2/icons/Prompt';
import React, {createContext, ProviderProps, ReactNode, RefObject, useContext, useRef, useState} from 'react';
import {ShadcnCommand} from './ShadcnCommand';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {zip} from './zip';

const platterStyle = style({
  backgroundColor: 'layer-2',
  borderRadius: 'lg',
  '--code-padding-start': {
    type: 'paddingStart',
    value: 16
  },
  '--code-padding-end': {
    type: 'paddingEnd',
    value: 16
  },
  '--code-padding-y': {
    type: 'paddingTop',
    value: 16
  },
  position: 'relative'
});

interface CodePlatterProps {
  children: ReactNode,
  type?: 'vanilla' | 'tailwind' | 's2',
  showCoachMark?: boolean
}

interface CodePlatterContextValue {
  library: Library
}

const CodePlatterContext = createContext<CodePlatterContextValue>({library: 'react-spectrum'});
export function CodePlatterProvider(props: CodePlatterContextValue & {children: any}) {
  return <CodePlatterContext.Provider value={props}>{props.children}</CodePlatterContext.Provider>;
}

interface FileProviderContextValue {
  files?: {[name: string]: string},
  deps?: {[name: string]: string},
  urls?: {[url: string]: string},
  entry?: string
}

const FileProviderContext = createContext<FileProviderContextValue | null>(null);
export function FileProvider(props: ProviderProps<FileProviderContextValue | null>) {
  return <FileProviderContext {...props} />;
}

const ShadcnContext = createContext<string | null>(null);
export function ShadcnProvider(props: ProviderProps<string | null>) {
  return <ShadcnContext {...props} />;
}

const ShareContext = createContext<string | null>(null);
export function ShareUrlProvider(props: ProviderProps<string | null>) {
  return <ShareContext {...props} />;
}

export function CodePlatter({children, type, showCoachMark}: CodePlatterProps) {
  let codeRef = useRef<HTMLDivElement | null>(null);
  let [showShadcn, setShowShadcn] = useState(false);
  let getText = () => codeRef.current!.querySelector('pre')!.textContent!;
  let {library} = useContext(CodePlatterContext);
  if (!type) {
    if (library === 'react-aria') {
      type = 'vanilla';
    } else if (library === 'react-spectrum') {
      type = 's2';
    }
  }

  let {files, deps = {}, urls = {}, entry} = useContext(FileProviderContext) ?? {};
  let registryUrl = useContext(ShadcnContext);
  let shareUrl = useContext(ShareContext);

  return (
    <div className={platterStyle}>
      <Toolbar showCoachMark={showCoachMark}>
        <ActionButtonGroup
          orientation="vertical"
          isQuiet
          density="regular"
          size="S">
          <CopyButton ariaLabel="Copy code" tooltip="Copy code" getText={getText} />
          {(shareUrl || files || registryUrl) && <MenuTrigger align="end">
            <TooltipTrigger placement="end">
              <ActionButton aria-label="Open in…">
                <OpenIn />
              </ActionButton>
              <Tooltip>Open in…</Tooltip>
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
                    navigator.clipboard.writeText(url.toString()).catch(() => {
                      ToastQueue.negative('Failed to copy link.');
                    });
                  }}>
                  <LinkIcon />
                  <Text slot="label">Copy link</Text>
                </MenuItem>
              }
              {files && 
                <MenuItem
                  onAction={() => {
                    let filesToDownload = getCodeSandboxFiles(getExampleFiles(codeRef, files, urls, entry), deps, type, entry);
                    let filesToZip = {};
                    for (let key in filesToDownload) {
                      if (filesToDownload[key] && !key.startsWith('.codesandbox') && !key.startsWith('.devcontainer')) {
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
              {registryUrl &&
                <MenuItem onAction={() => setShowShadcn(true)}>
                  <Prompt />
                  <Text>Install with shadcn</Text>
                </MenuItem>
              }
              {files && 
                <MenuItem
                  onAction={() => {
                    createCodeSandbox(getExampleFiles(codeRef, files, urls, entry), deps, type, entry);
                  }}>
                  <Polygon4 />
                  <Text slot="label">Open in CodeSandbox</Text>
                </MenuItem>
              }
              {files && type !== 's2' && 
                <MenuItem
                  onAction={() => {
                    createStackBlitz(getExampleFiles(codeRef, files, urls, entry), deps, type, entry);
                  }}>
                  <Flash />
                  <Text slot="label">Open in StackBlitz</Text>
                </MenuItem>
              }
              {registryUrl &&
                <MenuItem
                  href={`https://v0.dev/chat/api/open?url=${process.env.REGISTRY_URL || 'http://localhost:8081'}/${registryUrl}`}
                  target="_blank"
                  rel="noopener noreferrer">
                  <V0 />
                  <Text>Open in v0</Text>
                </MenuItem>
              }
            </Menu>
          </MenuTrigger>}
        </ActionButtonGroup>
      </Toolbar>
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

const pre = style({
  borderRadius: 'lg',
  font: {
    default: 'code-xs',
    lg: 'code-sm'
  },
  margin: 0,
  paddingStart: '--code-padding-start',
  paddingEnd: '--code-padding-end',
  paddingY: '--code-padding-y',
  width: 'fit',
  minWidth: 'full',
  boxSizing: 'border-box'
});

export function Pre({children}) {
  return (
    <pre className={pre}>
      {children}
    </pre>
  );
}

function getExampleFiles(codeRef: RefObject<HTMLDivElement | null>, files: {[name: string]: string}, urls: {[name: string]: string}, entry: string | undefined) {
  if (!entry) {
    return {
      ...files,
      'Example.tsx': getExampleCode(codeRef, urls)
    };
  }

  return files;
}

function getExampleCode(codeRef: RefObject<HTMLDivElement | null>, urls: {[name: string]: string}) {
  let code = codeRef.current!.querySelector('pre')!.textContent!;
  let fileTabs = codeRef.current!.closest('[data-files]');
  if (fileTabs) {
    let example = fileTabs.querySelector('[data-example] pre');
    if (example) {
      code = example.textContent!;
    }
  }

  return code
    // Export the last function
    .replace(/\nfunction ([^(]+)((.|\n)+\n\}\n?)$/, '\nexport default function Example$2')
    // Add function wrapper around raw JSX in examples.
    .replace(/\n<((?:.|\n)+)/, (_, code) => {
      let res = '\nexport default function Example() {\n  return (\n    <';
      let lines = code.split('\n');
      res += lines.shift();

      for (let line of lines) {
        res += '\n    ' + line;
      }

      res += '\n  );\n}\n';
      return res;
    })
    // Resolve urls
    .replace(/import (.*?) from ['"](url:.*?)['"]/g, (_, name, specifier) => {
      return `const ${name} = '${urls[specifier]}'`;
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
  let componentName = registryUrl.match(/([^/]+)\.json$/)[1];
  let preRef = useRef<HTMLPreElement | null>(null);

  return (
    <Dialog size="L">
      {({close}) => (<>
        <Heading slot="title">Install with shadcn</Heading>
        <Content>
          <p>Use the <Link href="https://ui.shadcn.com/docs/cli" target="_blank" rel="noopener noreferrer">shadcn CLI</Link> to install {componentName} and its dependencies into your project.</p>
          <ShadcnCommand registryUrl={registryUrl} preRef={preRef} />
        </Content>
        <ButtonGroup>
          <Button variant="secondary" slot="close">Cancel</Button>
          <Button
            variant="accent"
            onPress={() => {
              navigator.clipboard.writeText(preRef.current!.textContent!).catch(() => {
                ToastQueue.negative('Failed to copy command. Please try again.');
              });
              close();
            }}>
            Copy and close
          </Button>
        </ButtonGroup>
      </>)}
    </Dialog>
  );
}

const pulseAnimation = keyframes(`
  0% {
    outline-width: 0px;
    transform: scale(100%);
  }
  50% {
    outline-width: 8px;
    transform: scale(104%);
  }
  100% {
     outline-width: 0px;
     transform: scale(100%);
  }
`);


const indicator = style({
  animation: pulseAnimation,
  animationDuration: 2500,
  animationIterationCount: 'infinite',
  animationFillMode: 'forwards',
  animationTimingFunction: 'in-out',
  position: 'absolute',
  inset: 0,
  borderRadius: 'default',
  borderWidth: 2,
  borderColor: 'blue-800',
  borderStyle: 'solid',
  outlineColor: 'blue-800/20',
  outlineWidth: 4,
  outlineStyle: 'solid'
});

const toolbar = style({
  display: 'flex',
  justifyContent: 'end',
  padding: 4,
  position: 'absolute',
  top: 8,
  insetEnd: 8,
  backgroundColor: 'layer-2',
  boxShadow: 'elevated',
  borderRadius: 'default',
  zIndex: 1
});

function Toolbar({children, showCoachMark}) {
  if (showCoachMark) {
    children = (
      <>
        <div className={indicator} />
        {children}
      </>
    );
  }

  return (
    <div className={toolbar}>
      {children}
    </div>
  );
}
