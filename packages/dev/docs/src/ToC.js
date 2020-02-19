import classNames from 'classnames';
import React from 'react';
import sidenavstyles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import styles from './toc.css';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

export function ToC(props) {
  let {
    toc
  } = props;

  return (
    <nav className={styles['toc']} id="toc">
      <h3 className={typographyStyles['spectrum-Heading4']}>Contents</h3>
      <SideNav node={toc} />
    </nav>
  );
}

function SideNav(props) {
  let {node} = props;
  if (!node.children) {
    return (
      <ul className={classNames(sidenavstyles['spectrum-SideNav'], sidenavstyles['spectrum-SideNav--multiLevel'])}>
        {node.map(child => <SideNav key={child.id} node={child} />)}
      </ul>
    );
  }
  if (node.children.length > 0) {
    return (
      <li className={classNames(sidenavstyles['spectrum-SideNav-item'])}>
        <a className={classNames(sidenavstyles['spectrum-SideNav-itemLink'])} href={`#${node.id}`}>{node.textContent}</a>
        <ul className={classNames(sidenavstyles['spectrum-SideNav'], sidenavstyles['spectrum-SideNav--multiLevel'])}>
          {node.children.map(child => <SideNav key={child.id} node={child} />)}
        </ul>
      </li>
    );
  } else {
    return (
      <li className={classNames(sidenavstyles['spectrum-SideNav-item'])}>
        <a className={classNames(sidenavstyles['spectrum-SideNav-itemLink'])} href={`#${node.id}`}>{node.textContent}</a>
      </li>
    );
  }
}


