'use client';
import {
  Breadcrumbs as RACBreadcrumbs,
  type BreadcrumbsProps,
  Breadcrumb as RACBreadcrumb,
  type BreadcrumbProps,
  type LinkProps,
  Link
} from 'react-aria-components/Breadcrumbs';
import {ChevronRight} from 'lucide-react';
import './Breadcrumbs.css';

export function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>) {
  return <RACBreadcrumbs {...props} />;
}

export function Breadcrumb(props: BreadcrumbProps & Omit<LinkProps, 'className'>) {
  return (
    <RACBreadcrumb {...props}>
      {({isCurrent}) => (
        <>
          <Link {...props} />
          {!isCurrent && <ChevronRight size={14} />}
        </>
      )}
    </RACBreadcrumb>
  );
}
