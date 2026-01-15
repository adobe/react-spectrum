'use client';
import {Breadcrumbs as RACBreadcrumbs, BreadcrumbsProps, Breadcrumb as RACBreadcrumb, BreadcrumbProps, LinkProps, Link} from 'react-aria-components';
import {ChevronRight} from 'lucide-react';
import './Breadcrumbs.css';

export function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>) {
  return <RACBreadcrumbs {...props} />;
}

export function Breadcrumb(props: BreadcrumbProps & Omit<LinkProps, 'className'>) {
  return (
    <RACBreadcrumb {...props}>
      {({isCurrent}) => (<>
        <Link {...props} />
        {!isCurrent && <ChevronRight size={14} />}
      </>)}
    </RACBreadcrumb>
  );
}
