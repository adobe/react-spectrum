import React from 'react';
import { Link as AriaLink, LinkProps as AriaLinkProps, composeRenderProps } from 'react-aria-components';
import { tv } from 'tailwind-variants';
import { focusRing } from './utils';

interface LinkProps extends AriaLinkProps {
  variant?: 'primary' | 'secondary'
}

const styles = tv({
  extend: focusRing,
  base: 'underline disabled:no-underline disabled:cursor-default forced-colors:disabled:text-[GrayText] transition rounded',
  variants: {
    variant: {
      primary: 'text-blue-600 dark:text-blue-500 underline decoration-blue-600/60 hover:decoration-blue-600 dark:decoration-blue-500/60 dark:hover:decoration-blue-500',
      secondary: 'text-gray-700 dark:text-zinc-300 underline decoration-gray-700/50 hover:decoration-gray-700 dark:decoration-zinc-300/70 dark:hover:decoration-zinc-300'
    }
  },
  defaultVariants: {
    variant: 'primary'
  }
});

export function Link(props: LinkProps) {
  return <AriaLink {...props} className={composeRenderProps(props.className, (className, renderProps) =>  styles({...renderProps, className, variant: props.variant}))} />;
}
