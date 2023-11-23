import {Breadcrumbs as RACBreadcrumbs, BreadcrumbsProps} from 'react-aria-components';


export function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>) {
  return <RACBreadcrumbs {...props} />;
}
