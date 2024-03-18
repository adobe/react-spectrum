import { ChevronRight } from 'lucide-react';
import React from 'react';
import { Breadcrumb as AriaBreadcrumb, Breadcrumbs as AriaBreadcrumbs, BreadcrumbProps, BreadcrumbsProps, LinkProps } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import { Link } from './Link';

export function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>) {
  return <AriaBreadcrumbs {...props} className={twMerge('flex gap-1', props.className)} />;
}

export function Breadcrumb(props: BreadcrumbProps & LinkProps) {
  return (
    <AriaBreadcrumb {...props} className={twMerge('flex items-center gap-1', props.className)}>
      <Link variant="secondary" {...props} />
      {props.href && <ChevronRight className="w-3 h-3 text-gray-600 dark:text-zinc-400" />}
    </AriaBreadcrumb>
  );
}
