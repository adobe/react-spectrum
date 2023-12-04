import {
    SlotProvider,
    useFocusableRef,
    useHasChild,
    useSlotProps,
    useStyleProps
} from '@react-spectrum/utils';
import {FocusableRef} from '@react-types/shared';
import {Button as RACButton, Provider, TextContext} from 'react-aria-components';
import {Text} from './Text';
import {SpectrumActionButtonProps} from '@adobe/react-spectrum';
import {tv} from 'tailwind-variants';
import {FocusRing, useButton} from 'react-aria';
import React, {forwardRef} from 'react';
import {pressScale, usePressScale} from './usePressScale';
import CornerTriangle from '@spectrum-icons/ui/CornerTriangle';

let baseIcon = tv({
  base: 'flex-shrink-0 fill-current aspect-square',
  variants: {
    size: {
      XS: 'h-200 w-200',
      S: 'h-225 w-225',
      M: 'h-250 w-250',
      L: 'h-275 w-275',
      XL: 'h-300 w-300'
    }
  }
});

let baseButton = tv({
  base: 'box-border flex items-center justify-center border-solid border-none font-[inherit] font-bold cursor-default transition outline-none focus-visible:ring disabled:text-disabled',
  variants: {
    size: {
      // rounded-75 is wrong across all but medium, it's based on 2nd Major log scale, can we apply something like tint?
      // this doesn't account for rounding at scale (as opposed to size)
      XS: 'h-c-50 text-50 gap-ttv-50 rounded-[6px]', // gap should be 5px
      S: 'h-c-75 text-75 gap-ttv-50 rounded-[7px]', // gap should be 5px, h-c-150 doesn't exist
      M: 'h-c-100 text-100 gap-ttv-75 rounded-75', // height should be 32px (between 175 and 200...)
      L: 'h-c-200 text-200 gap-ttv-75 rounded-[9px]', // gap should be 7px
      XL: 'h-c-300 text-300 gap-ttv-100 rounded-[10px]'
    },
    isQuiet: {
      false: 'bg-tint-100 bg-hover-tint-200',
      true: 'bg-transparent bg-hover-gray-200' // how to use tint here?
    }
  },
  defaultVariants: {
    isQuiet: false
  },
  // SELECTED is ToggleButton? What about in an ActionGroup, how do we override the selection colors?

  // is this really the best way to handle the scaling? can we find a pattern?
  compoundVariants: [
    {
      hasIcon: true,
      hasLabel: false,
      class: 'aspect-square'
    },
    {
      hasIcon: true,
      hasLabel: true,
      size: 'XS',
      class: 'ps-75 pe-100'
    },
    {
      hasIcon: true,
      hasLabel: false,
      size: 'XS',
      class: 'px-0'
    },
    {
      hasIcon: false,
      hasLabel: true,
      size: 'XS',
      class: 'px-100'
    },
    {
      hasIcon: true,
      hasLabel: true,
      size: 'S',
      class: 'ps-75 pe-75' // how to get 7px & 9px respectively...?
    },
    {
      hasIcon: true,
      hasLabel: false,
      size: 'S',
      class: 'px-50'
    },
    {
      hasIcon: false,
      hasLabel: true,
      size: 'S',
      class: 'px-125' // how to get 9px
    },
    {
      hasIcon: true,
      hasLabel: true,
      size: 'M',
      class: 'ps-125 pe-150'
    },
    {
      hasIcon: true,
      hasLabel: false,
      size: 'M',
      class: 'px-75'
    },
    {
      hasIcon: false,
      hasLabel: true,
      size: 'M',
      class: 'px-150'
    },
    {
      hasIcon: true,
      hasLabel: true,
      size: 'L',
      class: 'ps-150 pe-175' // how to get 13px & 15px respectively...?
    },
    {
      hasIcon: true,
      hasLabel: false,
      size: 'L',
      class: 'px-75'
    },
    {
      hasIcon: false,
      hasLabel: true,
      size: 'L',
      class: 'px-175' // how to get px===15px...?
    },
    {
      hasIcon: true,
      hasLabel: true,
      size: 'XL',
      class: 'ps-175 pe-225' // how to get ps===15px...?
    },
    {
      hasIcon: true,
      hasLabel: false,
      size: 'XL',
      class: 'px-125'
    },
    {
      hasIcon: false,
      hasLabel: true,
      size: 'XL',
      class: 'px-225'
    }
  ]
});

let buttonStyles = tv({
  extend: baseButton,
  base: 'text-gray-800 tint-gray/25 disabled:text-disabled'
}, {
  twMerge: false
});

// text colors are swapped from Button
let staticColorButton = tv({
  extend: baseButton,
  base: 'disabled:text-tint-disabled',
  variants: {
    staticColor: {
      black: 'ring-black tint-transparent-black/800 text-transparent-black/100',
      white: 'ring-white tint-transparent-white/800 text-transparent-white-800 shadow-none' // how to use outline instead of drop shadow?
    }
  },
}, {twMerge: false});

// do forward ref up here so that we get storybook types, at least until someone can figure out why we don't in our
// normal codebase
let ActionButton = forwardRef((props: SpectrumActionButtonProps & {size?: 'XS' | 'S' | 'M' | 'L' | 'XL'}, ref: FocusableRef<HTMLElement>) => {
  props = useSlotProps(props, 'button');
  let {
        children,
        staticColor,
        size = 'M',
        isQuiet,
        // @ts-ignore (private)
        holdAffordance,
        ...otherProps
    } = props;
  let domRef = useFocusableRef(ref);
  let {buttonProps, isPressed} = useButton(props, domRef);
  let {styleProps} = useStyleProps(otherProps as any);
  let hasLabel = useHasChild('[data-label]', domRef);
  let hasIcon = useHasChild('[data-icon]', domRef);

  usePressScale(domRef, isPressed);

    // let styles = hasIcon && !hasLabel ? iconOnlyButton : buttonStyles;
  let styles = staticColor ? staticColorButton : buttonStyles;

  return (
    <FocusRing>
      <RACButton
        {...styleProps}
        {...props}
        {...buttonProps}
        ref={domRef as any}
        data-static-color={staticColor || undefined}
        data-has-icon={hasIcon || undefined}
        data-icon-only={(hasIcon && !hasLabel) || undefined}
        style={pressScale(domRef, styleProps.style as any)}
        className={
          styles({
            staticColor,
            size,
            isQuiet,
            hasIcon,
            hasLabel
          } as any)}>

          <SlotProvider
            slots={{
              icon: {
                size: 'S',
                UNSAFE_className: baseIcon({size}),
                'data-icon': true
              },
              text: {
                'data-label': true
              }
            }}>
            {holdAffordance &&
              <CornerTriangle />
            }
            {typeof children === 'string'
                          ? <Text>{children}</Text>
                          : children}
          </SlotProvider>
      </RACButton>
    </FocusRing>
  );
});

export {ActionButton};
