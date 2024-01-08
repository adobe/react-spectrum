import { ChevronRight } from 'lucide-react';
import React from 'react';
import { BreadcrumbProps, BreadcrumbsProps, LinkProps, Breadcrumb as RACBreadcrumb, Breadcrumbs as RACBreadcrumbs } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import { Link } from './Link';

export function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>) {
  return <RACBreadcrumbs {...props} className={twMerge('flex gap-1', props.className)} />;
}

export function Breadcrumb(props: BreadcrumbProps & LinkProps) {
  return (
    <RACBreadcrumb {...props} className={twMerge('flex items-center gap-1', props.className)}>
      <Link variant="secondary" {...props} />
      {props.href && <ChevronRight className="w-3 h-3 text-gray-600" />}
    </RACBreadcrumb>
  );
}
