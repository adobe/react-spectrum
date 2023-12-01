import {
    SlotProvider,
    useFocusableRef,
    useHasChild,
    useSlotProps,
    useStyleProps
} from '@react-spectrum/utils';
import {FocusableRef} from '@react-types/shared';
import {Button as RACButton} from 'react-aria-components';
import {SpectrumActionButtonProps, Text} from '@adobe/react-spectrum';
import {tv} from 'tailwind-variants';
import {FocusRing, useButton} from 'react-aria';
import React, {forwardRef} from 'react';
import {pressScale, usePressScale} from './usePressScale';
import CornerTriangle from '@spectrum-icons/ui/CornerTriangle';

let baseButton = tv({
  base: 'flex items-center justify-center rounded-75 border-solid border-transparent font-[inherit] font-bold cursor-default transition outline-none focus-visible:ring disabled:text-disabled',
  variants: {
    size: {
      S: 'h-c-75 text-75 gap-ttv-75 px-125',
      M: 'h-c-100 text-100 gap-ttv-100 px-ptt-100',
      L: 'h-c-200 text-200 gap-ttv-200 px-250',
      XL: 'h-c-300 text-300 gap-ttv-300 px-275'
    },
    isQuiet: {
      false: 'bg-tint-100 bg-hover-tint-200',
      true: 'bg-transparent bg-hover-gray-400'
    }
  },
  defaultVariants: {
    isQuiet: false
  },
  compoundVariants: [
    {
      hasIcon: true,
      hasLabel: false,
      class: 'px-0 aspect-square'
    }
  ]
});

let buttonStyles = tv({
  extend: baseButton,
  base: 'text-gray-800 tint-gray/25 disabled:text-disabled'
}, {
  twMerge: false
});

let staticColorButton = tv({
  extend: baseButton,
  base: 'disabled:text-tint-disabled',
  variants: {
    variant: {
      primary: '',
      secondary: ''
    },
    style: {
      fill: 'disabled:bg-tint-disabled',
      outline: 'bg-hover-tint-300 text-tint-900 disabled:border-tint-disabled'
    },
    staticColor: {
      black: 'ring-black',
      white: 'ring-white'
    }
  },
  compoundVariants: [
    {
      staticColor: 'black',
      variant: 'primary',
      style: 'fill',
      class: 'text-white'
    },
    {
      staticColor: 'white',
      variant: 'primary',
      style: 'fill',
      class: 'text-black'
    },
    {
      staticColor: 'black',
      variant: 'primary',
      class: 'tint-transparent-black/800'
    },
    {
      staticColor: 'white',
      variant: 'primary',
      class: 'tint-transparent-white/800'
    },
    {
      staticColor: 'black',
      variant: 'secondary',
      class: 'tint-transparent-black/200 text-black'
    },
    {
      staticColor: 'white',
      variant: 'secondary',
      class: 'tint-transparent-white/200 text-white'
    },
    {
      variant: 'primary',
      style: 'outline',
      class: 'border-base-tint-800'
    },
    {
      variant: 'secondary',
      style: 'outline',
      class: 'border-base-tint-300'
    }
  ]
}, {twMerge: false});

// do forward ref up here so that we get storybook types, at least until someone can figure out why we don't in our
// normal codebase
let ActionButton = forwardRef((props: SpectrumActionButtonProps & {size?: 'S' | 'M' | 'L' | 'XL'}, ref: FocusableRef<HTMLElement>) => {
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
            hasIcon: hasIcon as any,
            hasLabel
          } as any)}>
        <SlotProvider
          slots={{
            icon: {
              size: 'S',
              UNSAFE_className: 'flex-shrink-0 ' + (hasLabel ? '-ml-[2px]' : ''),
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
