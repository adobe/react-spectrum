import {AriaBreadcrumbsProps, useBreadcrumbs} from 'react-aria';
import {CollectionProps, useCollection} from './Collection';
import {HeadingContext} from './Heading';
import {LinkContext} from './Link';
import {Provider, StyleProps} from './utils';
import React, {HTMLAttributes} from 'react';

interface BreadcrumbsProps<T> extends Omit<CollectionProps<T>, 'disabledKeys'>, Omit<AriaBreadcrumbsProps, 'children'>, StyleProps {
  /** Whether the breadcrumbs are disabled. */
  isDisabled?: boolean
}

export function Breadcrumbs<T extends object>(props: BreadcrumbsProps<T>) {
  let {navProps} = useBreadcrumbs(props);
  let {portal, collection} = useCollection(props);

  return (
    <nav {...navProps} style={props.style} className={props.className ?? 'react-aria-Breadcrumbs'}>
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
