'use client';
import {Breadcrumbs as RACBreadcrumbs, BreadcrumbsProps, Breadcrumb as RACBreadcrumb, BreadcrumbProps} from 'react-aria-components';
import './Breadcrumbs.css';

export function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>) {
  return <RACBreadcrumbs {...props} />;
}

export function Breadcrumb(props: BreadcrumbProps) {
  return <RACBreadcrumb {...props} />;
}
