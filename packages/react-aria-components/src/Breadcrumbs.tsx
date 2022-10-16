import {AriaBreadcrumbsProps, useBreadcrumbs} from 'react-aria';
import {CollectionProps, useCollection} from './Collection';
import {HeadingContext} from './Heading';
import {LinkContext} from './Link';
import {Provider, StyleProps} from './utils';
import React, {ForwardedRef, forwardRef, HTMLAttributes} from 'react';

export interface BreadcrumbsProps<T> extends Omit<CollectionProps<T>, 'disabledKeys'>, Omit<AriaBreadcrumbsProps, 'children'>, StyleProps {
  /** Whether the breadcrumbs are disabled. */
  isDisabled?: boolean
}

function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>, ref: ForwardedRef<HTMLElement>) {
  let {navProps} = useBreadcrumbs(props);
  let {portal, collection} = useCollection(props);

  return (
    <nav ref={ref} {...navProps} style={props.style} className={props.className ?? 'react-aria-Breadcrumbs'}>
      <ol>
        {[...collection].map((node, i) => (
          <BreadcrumbItem
            key={node.key}
            node={node}
            isCurrent={i === collection.size - 1}
            isDisabled={props.isDisabled} />
        ))}
      </ol>
      {portal}
    </nav>
  );
}

/**
 * Breadcrumbs display a heirarchy of links to the current page or resource in an application.
 */
const _Breadcrumbs = forwardRef(Breadcrumbs);
export {_Breadcrumbs as Breadcrumbs};

function BreadcrumbItem({node, isCurrent, isDisabled}) {
  // Recreating useBreadcrumbItem because we want to use composition instead of having the link builtin.
  let headingProps: HTMLAttributes<HTMLHeadingElement> = isCurrent ? {'aria-current': 'page'} : undefined;
  let linkProps = {
    'aria-current': isCurrent ? 'page' : undefined,
    isDisabled: isDisabled || isCurrent
  };

  return (
    <li style={node.props.style} className={node.props.className ?? 'react-aria-Item'}>
      <Provider 
        values={[
          [LinkContext, linkProps],
          [HeadingContext, headingProps]
        ]}>
        {node.rendered}
      </Provider>
    </li>
  );
}
