'use client';

import ChevronRightIcon from '@react-spectrum/s2/icons/ChevronRight';
import {getTextWidth} from './textWidth';
import {iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Link} from '@react-spectrum/s2';
import LinkIcon from '@react-spectrum/s2/icons/Link';
import type {Page} from '@parcel/rsc';
import React, {HTMLAttributes, ReactNode} from 'react';
import {TitleLink} from './Link';
import {useFocusRing} from '@react-aria/focus';
import {useHover} from '@react-aria/interactions';

function childrenToString(children: ReactNode) {
  if (typeof children === 'string') {
    return children;
  }

  if (Array.isArray(children)) {
    return children.reduce((p, c) => p + childrenToString(c), '');
  }

  return '';
}

function anchorId(children: ReactNode) {
  return childrenToString(children).replace(/\s/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
}

function AnchorLink({anchorId, isHovered, level, headingText}) {
  let {isFocusVisible, focusProps} = useFocusRing({within: true});
  const href = `#${anchorId}`;
  return (
    <span
      {...focusProps}
      className={style({
        position: 'absolute',
        opacity: {
          default: 0,
          isHovered: 1,
          isFocusVisible: 1
        },
        marginStart: {
          default: 8,
          level: {
            3: 4,
            4: 4
          }
        },
        transition: '[opacity 0.2s ease-in-out]'
      })({isHovered, isFocusVisible, level})}>
      <Link href={href} aria-label={`Link to ${headingText}`}>
        <LinkIcon
          styles={iconStyle({size: 'S', marginBottom: 4})} 
          UNSAFE_style={{marginBottom: (level === 3 || level === 4) ? 0 : undefined}} />
      </Link>
    </span>
  );
}

const h1 = style({
  font: 'heading-3xl',
  // This variable is used to calculate the line height.
  // Normally it is set by the fontSize, but the custom clamp prevents this.
  '--fs': {
    type: 'opacity',
    value: {
      default: 'pow(1.125, 10)', // heading-2xl
      isLongForm: 'pow(1.125, 8)' // heading-xl
    }
  },
  fontSize: {
    default: {
      // On mobile, adjust heading to fit in the viewport, and clamp between a min and max font size.
      default: `clamp(${35 / 16}rem, (100vw - 32px) / var(--width-per-em), ${55 / 16}rem)`,
      isLongForm: `clamp(${35 / 16}rem, (100vw - 32px) / var(--width-per-em), ${44 / 16}rem)`
    },
    lg: {
      default: 'heading-3xl',
      isLongForm: 'heading-2xl'
    }
  },
  textWrap: 'balance',
  marginY: 0,
  width: 'full',
  maxWidth: '--text-width',
  marginX: 'auto'
});

export function H1({children, isLongForm, ...props}) {
  return (
    <h1 {...props} data-anchor-link id="top" style={{'--width-per-em': getTextWidth(children)} as any} className={h1({isLongForm})}>
      {children}
    </h1>
  );
}

export function H2({children, ...props}) {
  let {hoverProps, isHovered} = useHover({});
  let id = anchorId(children);
  return (
    <h2 {...props} data-anchor-link id={id} className={style({font: 'heading-lg', marginTop: 48, marginBottom: 24, maxWidth: '--text-width', marginX: 'auto', textWrap: 'balance', position: 'relative', overflowX: 'clip'})} {...hoverProps}>
      {children}
      <AnchorLink anchorId={id} isHovered={isHovered} level={2} headingText={children} />
    </h2>
  );
}

export function H3({children, ...props}) {
  let {hoverProps, isHovered} = useHover({});
  let id = anchorId(children);
  return (
    <h3 {...props} data-anchor-link id={id} className={style({font: 'heading', marginTop: 36, marginBottom: 24, maxWidth: '--text-width', marginX: 'auto', textWrap: 'balance', position: 'relative', overflowX: {default: 'clip', ':has([data-step])': 'visible'}})} {...hoverProps}>
      {children}
      <AnchorLink anchorId={id} isHovered={isHovered} level={3} headingText={children} />
    </h3>
  );
}

export function H4({children, ...props}) {
  let {hoverProps, isHovered} = useHover({});
  let id = anchorId(children);
  return (
    <h4 {...props} data-anchor-link id={id} className={style({font: 'heading-sm', maxWidth: '--text-width', marginX: 'auto', textWrap: 'balance', position: 'relative', overflowX: 'clip'})} {...hoverProps}>
      {children}
      <AnchorLink anchorId={id} isHovered={isHovered} level={4} headingText={children} />
    </h4>
  );
}

export function PageDescription(props: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      {...props}
      className={style({
        font: 'body-xl',
        maxWidth: '--text-width',
        marginX: 'auto',
        marginTop: 8,
        marginBottom: 24
      })} />
  );
}

export function P({isLongForm, ...props}: HTMLAttributes<HTMLParagraphElement> & {isLongForm?: boolean}) {
  return (
    <p
      {...props}
      className={style({
        font: 'body-lg',
        fontFamily: {
          default: 'sans',
          isLongForm: 'serif'
        },
        textWrap: 'pretty',
        marginY: '[1lh]',
        maxWidth: '--text-width',
        marginX: 'auto'
      })({isLongForm})} />
  );
}

export function LI({isLongForm, ...props}: HTMLAttributes<HTMLLIElement> & {isLongForm?: boolean}) {
  return (
    <li
      {...props}
      className={style({
        font: 'body-lg',
        fontFamily: {
          default: 'sans',
          isLongForm: 'serif'
        },
        textWrap: 'pretty',
        marginY: {
          default: 0,
          isLongForm: 8
        },
        maxWidth: '--text-width',
        marginX: 'auto'
      })({isLongForm})} />
  );
}

interface SubpageHeaderProps {
  currentPage: Page,
  parentPage?: Page,
  isLongForm?: boolean
}

export function SubpageHeader({currentPage, parentPage, isLongForm}: SubpageHeaderProps) {
  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '--text-width', marginX: 'auto', marginBottom: 40})}>
      <div className={style({display: 'flex', alignItems: 'center', gap: 2})}>
        <TitleLink href={parentPage?.url}>{parentPage?.exports?.title ?? parentPage?.tableOfContents?.[0]?.title ?? parentPage?.name}</TitleLink>
        <ChevronRightIcon styles={iconStyle({size: 'XS'})} />
      </div>
      <H1 itemProp="headline" isLongForm={isLongForm}>{currentPage.tableOfContents?.[0].title}</H1>
      {currentPage.exports?.author && <Byline author={currentPage.exports.author} authorLink={currentPage.exports.authorLink} date={currentPage.exports.date} />}
      {currentPage.exports?.date && !currentPage.exports?.author && <Time date={currentPage.exports.date} />}
    </div>
  );
}

export function Byline({author, authorLink, date}: {author?: string, authorLink?: string, date: string}) {
  let formattedDate = new Date(date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'});

  return (
    <div className={style({font: 'detail', width: 'full', maxWidth: '--text-width', marginX: 'auto', marginTop: 4})}>
      {author && (
        <>
          {'By '}
          <span itemProp="author" itemScope itemType="https://schema.org/Person">
            {authorLink ? (<>
              <meta itemProp="url" content={authorLink} />
              <Link href={authorLink} isQuiet rel="author" target="_blank">
                <span itemProp="name">{author}</span>
              </Link>
            </>) : <span itemProp="name">{author}</span>}
          </span>
          {' · '}
        </>
      )}
      <time itemProp="datePublished" dateTime={date}>{formattedDate}</time>
    </div>
  );
}

export function Time({date}: {date: string}) {
  return <time itemProp="datePublished" dateTime={date} className={style({font: 'detail'})}>{new Date(date).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</time>;
}
