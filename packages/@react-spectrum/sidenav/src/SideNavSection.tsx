import {classNames} from '@react-spectrum/utils';
import {layoutInfoToStyle, useCollectionItem} from '@react-aria/collections';
import React, {Fragment, useRef} from 'react';
import {SideNavSectionProps} from '@react-types/sidenav';
import styles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import {useListBoxSection} from '@react-aria/listbox';

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
