import {Link as RACLink, LinkProps as RACLinkProps} from 'react-aria-components';
import React from 'react';
import {tv} from 'tailwind-variants';

interface LinkProps extends RACLinkProps {
  variant?: 'primary' | 'secondary'
}

const styles = tv({
  base: 'underline disabled:no-underline disabled:cursor-default forced-colors:disabled:text-[GrayText] transition',
  variants: {
    variant: {
      primary: 'text-blue-600 dark:text-blue-500 underline decoration-blue-600/60 hover:decoration-blue-600 dark:decoration-blue-500/60 dark:hover:decoration-blue-500',
      secondary: 'text-gray-700 dark:text-zinc-600 underline decoration-gray-700/50 hover:decoration-gray-700 dark:decoration-zinc-600/50 dark:hover:decoration-zinc-600'
    }
  },
  defaultVariants: {
    variant: 'primary'
  }
});

export function Link(props: LinkProps) {
  return <RACLink {...props} className={styles({variant: props.variant})} />;
}
