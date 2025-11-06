'use client';

import {ActionButton, Menu, MenuItem, MenuTrigger, Text, UNSTABLE_ToastQueue as ToastQueue} from '@react-spectrum/s2';
import Copy from '@react-spectrum/s2/icons/Copy';
import OpenIn from '@react-spectrum/s2/icons/OpenIn';
import React, {useCallback} from 'react';

interface MarkdownMenuProps {
  url: string | undefined
}

export function MarkdownMenu({url}: MarkdownMenuProps) {
  let mdUrl = (url ?? '').replace(/\.html?$/i, '') + '.md';

  let onAction = useCallback(async (key: import('react-aria-components').Key) => {
    let action = String(key);
    switch (action) {
      case 'copy': {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          try {
            let response = await fetch(mdUrl);
            // Fallback to copying the URL if the request fails or isn't ok.
            if (!response.ok) {
              throw new Error('Failed to fetch markdown');
            }

            let markdown = await response.text();
            await navigator.clipboard.writeText(markdown);
          } catch (error) {
            // Show toast for clipboard errors, but silently ignore fetch errors
            if (error instanceof Error && error.name !== 'TypeError') {
              ToastQueue.negative('Failed to copy markdown.');
            }
          }
        }
        break;
      }
      case 'view': {
        if (typeof window !== 'undefined') {
          window.open(mdUrl, '_blank');
        }
        break;
      }
    }
  }, [mdUrl]);

  return (
    <MenuTrigger>
      <ActionButton size="L" isQuiet aria-label="Markdown options">
        <Copy />
      </ActionButton>
      <Menu onAction={onAction}>
        <MenuItem id="copy">
          <Copy />
          <Text>Copy Page as Markdown</Text>
        </MenuItem>
        <MenuItem id="view">
          <OpenIn />
          <Text>View Page as Markdown</Text>
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
} 
