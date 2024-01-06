import {Breadcrumbs as RACBreadcrumbs, BreadcrumbsProps, Breadcrumb as RACBreadcrumb, BreadcrumbProps} from 'react-aria-components';
import { Link } from './Link';
import { ChevronRight } from 'lucide-react';
import React from 'react';

export function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>) {
  return <RACBreadcrumbs {...props} className="flex gap-1" />;
}

export function Breadcrumb(props: BreadcrumbProps & LinkProps) {
  return (
    <RACBreadcrumb {...props} className="flex items-center gap-1">
      <Link variant="secondary" {...props} />
      {props.href && <ChevronRight className="w-3 h-3 text-gray-600" />}
    </RACBreadcrumb>
  );
}
