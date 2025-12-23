'use client';

import {ActionButton, Menu, MenuItem, MenuSection, MenuTrigger, SubmenuTrigger, Text, ToastQueue} from '@react-spectrum/s2';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import {type ColorSchemePreference, useSettings} from './SettingsContext';
import Contrast from '@react-spectrum/s2/icons/Contrast';
import Copy from '@react-spectrum/s2/icons/Copy';
import DeviceDesktop from '@react-spectrum/s2/icons/DeviceDesktop';
import {getLibraryFromUrl, getLibraryLabel} from './library';
import Lighten from '@react-spectrum/s2/icons/Lighten';
import More from '@react-spectrum/s2/icons/More';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const colorSchemeLabels: Record<ColorSchemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark'
};

interface MarkdownMenuProps {
  name: string,
  url: string | undefined
}

export function MarkdownMenu({name, url}: MarkdownMenuProps) {
  let mdUrl = (url ?? '').replace(/\.html?$/i, '') + '.md';
  let [isCopied, setIsCopied] = useState(false);
  let [isPending, setPending] = useState(false);
  let timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  let {colorScheme, setColorScheme} = useSettings();
  
  let pageUrl = typeof window !== 'undefined' && url ? new URL(url, window.location.origin).href : url ?? '';
  let fullMdUrl = typeof window !== 'undefined' && mdUrl ? new URL(mdUrl, window.location.origin).href : mdUrl;
  let library = url ? getLibraryLabel(getLibraryFromUrl(name)) : '';
  let aiPrompt = `Answer questions about the following ${library} documentation page: ${pageUrl}\nMarkdown source: ${fullMdUrl}`;
  let chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(aiPrompt)}`;
  let claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(aiPrompt)}`;

  let colorSchemeLabel = colorSchemeLabels[colorScheme];

  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  let handleCopy = useCallback(async () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        setPending(true);
        await navigator.clipboard.write([
          new ClipboardItem({
            ['text/plain']: fetch(mdUrl).then(res => res.text())
          })
        ]);
        setIsCopied(true);
        timeout.current = setTimeout(() => setIsCopied(false), 2000);
      } catch {
        ToastQueue.negative('Failed to copy markdown.');
      } finally {
        setPending(false);
      }
    }
  }, [mdUrl]);

  return (
    <div className={style({display: 'flex', justifyContent: 'space-between', paddingX: 4, paddingBottom: 16})}>
      <ActionButton isQuiet size="M" onPress={handleCopy} isPending={isPending}>
        {isCopied ? <CheckmarkCircle /> : <Copy />}
        <Text>Copy for LLM</Text>
      </ActionButton>
      <MenuTrigger align="end">
        <ActionButton size="M" isQuiet aria-label="Markdown options">
          <More />
        </ActionButton>
        <Menu>
          <MenuSection>
            <MenuItem id="view" href={mdUrl} target="_blank">
              View as Markdown
            </MenuItem>
            <MenuItem id="chatgpt" href={chatGptUrl} target="_blank">
              Open in ChatGPT
            </MenuItem>
            <MenuItem id="claude" href={claudeUrl} target="_blank">
              Open in Claude
            </MenuItem>
          </MenuSection>
          <MenuSection>
            <SubmenuTrigger>
              <MenuItem>
                <Text slot="label">Color Scheme</Text>
                <Text slot="value">{colorSchemeLabel}</Text>
              </MenuItem>
              <Menu
                selectionMode="single"
                selectedKeys={[colorScheme]}
                onSelectionChange={(keys) => setColorScheme([...keys][0] as ColorSchemePreference)}>
                <MenuItem id="system">
                  <DeviceDesktop />
                  <Text slot="label">System</Text>
                </MenuItem>
                <MenuItem id="light">
                  <Lighten />
                  <Text slot="label">Light</Text>
                </MenuItem>
                <MenuItem id="dark">
                  <Contrast />
                  <Text slot="label">Dark</Text>
                </MenuItem>
              </Menu>
            </SubmenuTrigger>
          </MenuSection>
        </Menu>
      </MenuTrigger>
    </div>
  );
} 
