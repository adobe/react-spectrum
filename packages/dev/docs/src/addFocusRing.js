import ChevronRight from '@spectrum-icons/workflow/ChevronRight';
import docsStyle from './docs.css';
import {FocusRing} from '@react-aria/focus';
import {Link} from '@react-spectrum/link';
import linkStyles from '@adobe/spectrum-css-temp/components/link/vars.css';
import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import sideNavStyles from '@adobe/spectrum-css-temp/components/sidenav/vars.css';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';
import {useKeyboard, usePress} from '@react-aria/interactions';

function SideNavItemLink({href, className, children}) {
  return (
    <FocusRing focusRingClass={sideNavStyles['focus-ring']}>
      <a href={href} className={className}>{children}</a>
    </FocusRing>
  );
}

function Summary({children}) {
  const [open, setOpen] = useState(false);
  let {pressProps} = usePress({
    onPress: () => setOpen(!open)
  });

  let {keyboardProps} = useKeyboard({});

  return (
    <FocusRing focusRingClass={docsStyle['focus-ring']}>
      <summary
        {...pressProps}
        {...keyboardProps}
        className={typographyStyles['spectrum-Heading4']}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
        role="button"
        tabIndex="0"
        aria-expanded={open ? 'true' : 'false'}>
        <ChevronRight size="S" />
        {children}
      </summary>
    </FocusRing>
  );
}

export function addFocusRing() {

  // Add focus-ring styling to SideNav item links in the left hand rail and ToC
  let links = document.getElementsByClassName(sideNavStyles['spectrum-SideNav-itemLink']);
  for (let link of links) {
    let container = document.createElement('div');
    ReactDOM.render(
      <SideNavItemLink href={link.href} className={link.className}>{link.textContent}</SideNavItemLink>
    , container);
    link.parentNode.replaceChild(container.firstElementChild, link);
  }

  // Add focus-ring styling to inline links within the documentation and footer
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

  // Add focus-ring styling and expand/collapse button behavior to summary elements in PropTable
  const summaries = document.querySelectorAll(`details > summary.${typographyStyles['spectrum-Heading4']}`);
  for (let summary of summaries) {
    let container = document.createElement('div');
    ReactDOM.render(
      <Summary>{summary.textContent}</Summary>
    , container);
    summary.parentNode.replaceChild(container.firstChild, summary);
  }
}
