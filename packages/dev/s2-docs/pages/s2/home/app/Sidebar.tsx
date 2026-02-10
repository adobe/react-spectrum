'use client';
import Add from '@react-spectrum/s2/icons/Add';
import Home from '@react-spectrum/s2/icons/Home';
import ImageIcon from '@react-spectrum/s2/icons/Image';
import Lightbulb from '@react-spectrum/s2/icons/Lightbulb';
import { focusRing, size, style } from "@react-spectrum/s2/style" with { type: 'macro' };
import { ActionButton, Button, pressScale, createIcon } from '@react-spectrum/s2';
import { useRef, useState } from 'react';
import { ToggleButtonGroup as RACToggleButtonGroup, ToggleButton as RACToggleButton, useLocale } from 'react-aria-components';

const SM = `@container (min-width: ${(640 / 16)}rem)`;
const LG = `@container (width > ${(1024 / 16)}rem)`;

const textStyle = style({
  opacity: {
    default: 0,
    [LG]: 1,
    state: {
      expanded: 1,
      collapsed: 0
    }
  },
  transition: 'default',
  transitionDuration: 300
});

export function Sidebar({page, onPageChange}: any) {
  let [state, setState] = useState<null | 'expanded' | 'collapsed'>(null);
  let {locale} = useLocale();
  return (
    <div
      className={style({
        gridArea: 'sidebar',
        display: {
          default: 'none',
          [SM]: 'flex'
        },
        flexDirection: 'column',
        gap: 8,
        paddingX: 16,
        paddingBottom: 16,
        width: {
          default: 32,
          [LG]: 100,
          state: {
            expanded: 100,
            collapsed: 32
          }
        },
        overflow: 'clip',
        transition: '[width]',
        transitionDuration: 300
      })({state})}>
      {/* This button is actually kinda custom to support the expand/collapsed state... */}
      <Button
        variant="accent"
        styles={style({marginBottom: 8, width: {default: 32, [LG]: 80, state: {expanded: 80, collapsed: 32}}})({state})}
        UNSAFE_style={{alignItems: 'center', justifyContent: 'start', overflow: 'clip', transition: 'all 300ms'}}>
        <span className={style({marginStart: size(6)})}>
          <Add />
        </span>
        <span className={textStyle({state})}>{locale === 'ar-AE' ? 'يخلق' : 'Create'}</span>
      </Button>
      <SideNav
        aria-label="Navigation"
        isQuiet
        orientation="vertical"
        selectedKeys={[page || 'photos']}
        onSelectionChange={(keys: any) => onPageChange?.([...keys][0])}
        disallowEmptySelection>
        <SideNavItem id="home">
          <Home />
          <span className={textStyle({state})}>{locale === 'ar-AE' ? 'بيت' : 'Home'}</span>
        </SideNavItem>
        <SideNavItem id="photos">
          <ImageIcon />
          <span className={textStyle({state})}>{locale === 'ar-AE' ? 'الصور' : 'Photos'}</span>
        </SideNavItem>
        <SideNavItem id="ideas">
          <Lightbulb />
          <span className={textStyle({state})}>{locale === 'ar-AE' ? 'أفكار' : 'Ideas'}</span>
        </SideNavItem>
      </SideNav>
      <div className={style({flexGrow: 1})} />
      <PanelToggleButton state={state} setState={setState} />
    </div>
  )
}

function PanelToggleButton({state, setState}: any) {
  let [isHovered, setHovered] = useState(false);
  return (
    <ActionButton
      isQuiet
      aria-label="Toggle sidebar"
      styles={style({alignSelf: 'start'})}
      // @ts-ignore - should we expose this?
      onHoverChange={setHovered}
      onPress={(e) => {
        if (state == null) {
          let container = e.target.closest('[data-container]') as HTMLElement;
          setState(container?.offsetWidth > 1024 ? 'collapsed' : 'expanded')
        } else {
          setState(state === 'expanded' ? 'collapsed' : 'expanded');
        }
        setHovered(false);
      }}>
      {/* @ts-ignore */}
      <PanelIcon state={state} isHovered={isHovered} />
    </ActionButton>
  );
}

const PanelIcon = createIcon(props => {
  let {state, isHovered, ...otherProps} = props as any;
  return (
    <svg viewBox="0 0 20 20" fill="var(--iconPrimary)" {...otherProps}>
      <path d="M15.75 18H4.25C3.00977 18 2 16.9907 2 15.75V4.25C2 3.00928 3.00977 2 4.25 2H15.75C16.9902 2 18 3.00928 18 4.25V15.75C18 16.9907 16.9902 18 15.75 18ZM4.25 3.5C3.83691 3.5 3.5 3.83643 3.5 4.25V15.75C3.5 16.1636 3.83691 16.5 4.25 16.5H15.75C16.1631 16.5 16.5 16.1636 16.5 15.75V4.25C16.5 3.83643 16.1631 3.5 15.75 3.5H4.25Z" fill="var(--iconPrimary)" />
      <rect
        x={5}
        y={5}
        rx={0.5}
        height={10}
        className={style({
          transition: '[width]',
          transitionDuration: 300,
          width: {
            default: '[1.5px]',
            [LG]: '[5px]',
            state: {
              expanded: '[5px]',
              collapsed: '[1.5px]'
            },
            isHovered: {
              default: '[5px]',
              [LG]: '[1.5px]',
              state: {
                expanded: '[1.5px]',
                collapsed: '[5px]'
              }
            }
          }
        })({state, isHovered})} />
    </svg>
  );
});

// Fake sidenav component until we have a real one
function SideNav(props: any) {
  return (
    <RACToggleButtonGroup
      {...props}
      className={style({
        marginStart: -4,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        boxSizing: 'border-box',
        width: 'full'
      })} />
  );
}

function SideNavItem(props: any) {
  let ref = useRef(null)
  return (
    <RACToggleButton
      {...props}
      ref={ref}
      style={pressScale(ref)}
      className={style({
        ...focusRing(),
        backgroundColor: 'transparent',
        borderStyle: 'none',
        width: 'full',
        minHeight: 32,
        boxSizing: 'border-box',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        font: 'ui',
        fontWeight: {
          default: 'normal',
          isSelected: 'bold'
        },
        textDecoration: 'none',
        borderRadius: 'default',
        transition: 'default'
      })}>
      {(renderProps) => (<>
        <span
          className={style({
            flexShrink: 0,
            width: 2,
            height: '[1lh]',
            borderRadius: 'full',
            transition: 'default',
            backgroundColor: {
              default: 'transparent',
              isHovered: 'gray-400',
              isSelected: 'gray-800'
            }
          })(renderProps)} />
        {props.children}
      </>)}
    </RACToggleButton>
  );
}
