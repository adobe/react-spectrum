import {FocusRing} from '@react-aria/focus';
import {Link} from '@react-spectrum/link';
import linkStyles from '@adobe/spectrum-css-temp/components/link/vars.css';
import React from 'react';
import ReactDOM from 'react-dom';
import sideNavStyles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';

export function addFocusRing() {
  let links = document.getElementsByClassName(sideNavStyles['spectrum-SideNav-itemLink']);
  for (let link of links) {
    let container = document.createElement('div');
    ReactDOM.render(
      <FocusRing focusRingClass={sideNavStyles['focus-ring']}>
        <a href={link.href} className={link.className}>{link.textContent}</a>
      </FocusRing>
    , container);
    link.parentNode.replaceChild(container.firstElementChild, link);
  }

  links = document.querySelectorAll(`a.${linkStyles['spectrum-Link']}, a.${linkStyles['spectrum-Link--secondary']}`);
  for (let link of links) {
    let container = document.createElement('span');
    let variant;
    if (link.classList.contains(linkStyles['spectrum-Link--secondary'])) {
      link.classList.toggle(linkStyles['spectrum-Link--secondary'], false);
      variant = 'secondary';
    } else {
      link.classList.toggle(linkStyles['spectrum-Link'], false);
    }
    ReactDOM.render(
      <Link variant={variant} UNSAFE_className={link.className}>
        <a href={link.href} target={link.target || undefined} onClick={link.onClick || undefined}>{link.textContent}</a>
      </Link>
    , container);
    link.parentNode.replaceChild(container.firstChild, link);
  }
}
