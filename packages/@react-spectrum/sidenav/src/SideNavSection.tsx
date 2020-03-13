import {classNames} from '@react-spectrum/utils';
import {layoutInfoToStyle, useCollectionItem} from '@react-aria/collections';
import {Node} from '@react-stately/collections';
import React, {Fragment, ReactNode, useRef} from 'react';
import {ReusableView} from '@react-stately/collections';
import styles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {useListBoxSection} from '@react-aria/listbox';

interface SideNavSectionProps<T> {
  reusableView: ReusableView<Node<T>, unknown>,
  header: ReusableView<Node<T>, unknown>,
  children?: ReactNode
}

export function SideNavSection<T>(props: SideNavSectionProps<T>) {
  let {children, reusableView, header} = props;
  let item = reusableView.content;
  let {headingProps, groupProps} = useListBoxSection();

  let headerRef = useRef();
  useCollectionItem({
    reusableView: header,
    ref: headerRef
  });

  return (
    <Fragment>
      <div role="presentation" ref={headerRef} style={layoutInfoToStyle(header.layoutInfo)}>
        {item.rendered &&
          <div
            {...headingProps}
            className={
              classNames(
                styles,
                'spectrum-SideNav-heading'
              )
            }>
            {item.rendered}
          </div>
        }
      </div>
      <div
        {...groupProps}
        style={layoutInfoToStyle(reusableView.layoutInfo)}>
        {children}
      </div>
    </Fragment>
  );
}
