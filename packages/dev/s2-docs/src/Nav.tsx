'use client';

import {focusRing, size, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Link} from 'react-aria-components';
import type {PageProps} from '@parcel/rsc';
import {pressScale} from '@react-spectrum/s2';
import React, {createContext, useContext, useEffect, useRef, useState} from 'react';

export function Nav({pages, currentPage}: PageProps) {
  let sections = new Map();
  for (let page of pages) {
    let section = page.exports?.section ?? 'React Aria';
    let sectionPages = sections.get(section) ?? [];
    sectionPages.push(page);
    sections.set(section, sectionPages);
  }

  let [maskSize, setMaskSize] = useState(0);

  return (
    <nav
      onScroll={e => setMaskSize(Math.min(e.currentTarget.scrollTop, 32))}
      style={{
        maskImage: maskSize > 0 ? `linear-gradient(to bottom, transparent, black ${maskSize}px)` : undefined
      }}
      className={style({
        position: 'sticky',
        top: 40,
        height: 'fit',
        maxHeight: 'screen',
        overflow: 'auto',
        paddingEnd: 32
      })}>
      {[...sections].sort((a, b) => a[0].localeCompare(b[0])).map(([name, pages]) => (
        <SideNavSection title={name} key={name}>
          <SideNav>
            {pages.sort((a, b) => title(a).localeCompare(title(b))).map(page => (
              <SideNavItem key={page.url}><SideNavLink href={page.url} isSelected={page.url === currentPage.url}>{title(page)}</SideNavLink></SideNavItem>
            ))}
          </SideNav>
        </SideNavSection>
      ))}
    </nav>
  );
}

function title(page) {
  return page.exports?.title ?? page.tableOfContents?.[0]?.title ?? page.name;
}

function SideNavSection({title, children}) {
  return (
    <section className={style({marginBottom: 24})}>
      <div className={style({font: 'ui-sm', color: 'gray-600', minHeight: 32, paddingX: 12, display: 'flex', alignItems: 'center'})}>{title}</div>
      {children}
    </section>
  );
}

const SideNavContext = createContext('');

export function SideNav({children}) {
  return (
    <ul
      className={style({
        listStyleType: 'none',
        padding: 0,
        paddingStart: {
          default: 0,
          ':is(li > ul)': 16
        },
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 160,
        width: 192,
        maxWidth: 240,
        boxSizing: 'border-box'
      })}>
      {children}
    </ul>
  );
}

export function SideNavItem(props) {
  return (
    <li>
      {props.children}
    </li>
  );
}

export function SideNavLink(props) {
  let linkRef = useRef(null);
  let selected = useContext(SideNavContext);
  return (
    <Link
      {...props}
      ref={linkRef}
      aria-current={props.isSelected || selected === props.href ? 'page' : undefined}
      style={pressScale(linkRef)}
      className={style({
        ...focusRing(),
        minHeight: 32,
        boxSizing: 'border-box',
        paddingX: 4,
        // paddingY: centerPadding(),
        display: 'flex',
        alignItems: 'center',
        gap: size(6),
        font: 'ui',
        fontWeight: {
          default: 'normal',
          isCurrent: 'bold'
        },
        textDecoration: 'none',
        borderRadius: 'default',
        transition: 'default'
      })}>
      {(renderProps) => (<>
        <span
          className={style({
            width: 2,
            height: '[1lh]',
            borderRadius: 'full',
            transition: 'default',
            backgroundColor: {
              default: 'transparent',
              isHovered: 'gray-400',
              isCurrent: 'gray-800'
            }
          })(renderProps)} />
        {props.children}
      </>)}
    </Link>
  );
}

export function OnPageNav({children}) {
  let [selected, setSelected] = useState('');

  useEffect(() => {
    let elements = Array.from(document.querySelectorAll('article > :is(h2,h3,h4,h5)'));
    let visible = new Set();
    let observer = new IntersectionObserver(entries => {
      for (let entry of entries) {
        if (entry.isIntersecting) {
          visible.add(entry.target);
        } else {
          visible.delete(entry.target);
        }

        let firstVisible = elements.find(e => visible.has(e));
        if (firstVisible) {
          setSelected('#' + firstVisible.id);
        }
      }
    }, {rootMargin: '0px 0px -50% 0px'});

    for (let element of elements) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <SideNavContext.Provider value={selected}>
      {children}
    </SideNavContext.Provider>
  );
}
