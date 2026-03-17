'use client';

import {ActionButton, ToastQueue, Tooltip, TooltipTrigger} from '@react-spectrum/s2';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import Copy from '@react-spectrum/s2/icons/Copy';
import React, {useEffect, useRef, useState} from 'react';

export interface CopyButtonProps {
  /** Text to copy. If not provided, getText will be used. */
  text?: string,
  /** Function returning the text to copy. */
  getText?: () => string,
  /** Accessible label for the button. */
  ariaLabel?: string,
  /** Tooltip label shown on hover/focus. */
  tooltip?: string,
  /** Quiet variant. */
  isQuiet?: boolean,
  /** Size of the button. */
  size?: 'S' | 'M' | 'L'
}

export function CopyButton({text, getText, ariaLabel = 'Copy', tooltip = 'Copy', isQuiet = false, size = 'S'}: CopyButtonProps) {
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
    let value = text ?? getText?.();
    if (!value) {
      return;
    }
    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      timeout.current = setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
      ToastQueue.negative('Failed to copy.');
    });
  };

  return (
    <TooltipTrigger placement="end">
      <ActionButton aria-label={ariaLabel} isQuiet={isQuiet} size={size} onPress={handleCopy}>
        {isCopied ? <CheckmarkCircle /> : <Copy />}
      </ActionButton>
      <Tooltip>{tooltip}</Tooltip>
    </TooltipTrigger>
  );
}

export default CopyButton;
