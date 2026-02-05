'use client';

import {ActionButton, Menu, MenuItem, MenuTrigger, Text, ToastQueue} from '@react-spectrum/s2';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import Copy from '@react-spectrum/s2/icons/Copy';
import {getLibraryFromUrl, getLibraryLabel} from './library';
import More from '@react-spectrum/s2/icons/More';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

interface MarkdownMenuProps {
  name: string,
  url: string | undefined
}

export function MarkdownMenu({name, url}: MarkdownMenuProps) {
  let mdUrl = (url ?? '').replace(/\.html?$/i, '') + '.md';
  let [isCopied, setIsCopied] = useState(false);
  let [isPending, setPending] = useState(false);
  let timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  let pageUrl = typeof window !== 'undefined' && url ? new URL(url, window.location.origin).href : url ?? '';
  let fullMdUrl = typeof window !== 'undefined' && mdUrl ? new URL(mdUrl, window.location.origin).href : mdUrl;
  let library = url ? getLibraryLabel(getLibraryFromUrl(name)) : '';
  let aiPrompt = `Answer questions about the following ${library} documentation page: ${pageUrl}\nMarkdown source: ${fullMdUrl}`;
  let chatGptUrl = `https://chatgpt.com/?q=${encodeURIComponent(aiPrompt)}`;
  let claudeUrl = `https://claude.ai/new?q=${encodeURIComponent(aiPrompt)}`;

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
          <MenuItem id="view" href={mdUrl} target="_blank">
            View as Markdown
          </MenuItem>
          <MenuItem id="chatgpt" href={chatGptUrl} target="_blank">
            Open in ChatGPT
          </MenuItem>
          <MenuItem id="claude" href={claudeUrl} target="_blank">
            Open in Claude
          </MenuItem>
        </Menu>
      </MenuTrigger>
    </div>
  );
} 
