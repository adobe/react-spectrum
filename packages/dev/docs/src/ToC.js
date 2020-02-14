/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import classNames from 'classnames';
import React from 'react';
import sidenavstyles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import styles from './toc.css';


export function ToC(props) {
  let {
    toc
  } = props;

  return (
    <nav className={styles['toc']} id="toc">
      <div>Contents</div>
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


