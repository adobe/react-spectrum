import {
    SlotProvider,
    useFocusableRef,
    useHasChild,
    useSlotProps,
    useStyleProps
} from '@react-spectrum/utils';
import {FocusableRef} from '@react-types/shared';
import {Button as RACButton} from 'react-aria-components';
import {SpectrumButtonProps, Text} from '@adobe/react-spectrum';
import {tv} from 'tailwind-variants';
import {FocusRing, useButton} from 'react-aria';
import React, {forwardRef, useEffect, useState} from 'react';
import {pressScale, usePressScale} from './usePressScale';

let baseButton = tv({
  base: 'flex items-center justify-center rounded-full font-[inherit] font-bold cursor-default transition outline-none focus-visible:ring disabled:text-disabled',
  variants: {
    size: {
      S: 'h-c-75 text-75 gap-ttv-75 px-125',
      M: 'h-c-100 text-100 gap-ttv-100 px-ptt-100',
      L: 'h-c-200 text-200 gap-ttv-200 px-250',
      XL: 'h-c-300 text-300 gap-ttv-300 px-275'
    },
    style: {
      fill: 'bg-base-tint border-none',
      outline: 'border-200 border-solid'
    }
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
  base: 'disabled:text-disabled',
  variants: {
    variant: {
      accent: 'tint-accent',
      negative: 'tint-negative',
      primary: 'tint-neutral',
      secondary: 'tint-gray/200'
    },
    style: {
      fill: 'disabled:bg-disabled',
      outline: 'disabled:bg-transparent disabled:border-disabled'
    }
  },
  compoundVariants: [
    {
      variant: ['accent', 'negative', 'primary'],
      style: 'fill',
      class: 'text-white'
    },
    {
      variant: 'secondary',
      class: 'text-base-neutral'
    },
    {
      variant: ['accent', 'negative'],
      style: 'outline',
      class: 'border-base-tint-900 bg-hover-tint-200 text-base-tint'
    },
    {
      variant: 'primary',
      style: 'outline',
      class: 'border-base-tint-800 bg-hover-tint-300 text-base-tint'
    },
    {
      variant: 'secondary',
      style: 'outline',
      class: 'border-base-tint-300 bg-hover-tint-300'
    }
  ]
}, {
    // twMergeConfig: {
    //   theme: {
    //     borderWidth: ['100', '200']
    //   },
    //   classGroups: {
    //     tint: [{'tint': [() => true]}],
    //     'default-tint': [{'default-tint': [() => true]}],
    //     'font-size': [{text: []}]
    //   }
    // }
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
let Button = forwardRef((props: SpectrumButtonProps & {size?: 'S' | 'M' | 'L' | 'XL'}, ref: FocusableRef<HTMLElement>) => {
  props = useSlotProps(props, 'button');
  let {
    children,
    variant,
    style = variant === 'accent' || variant === 'cta' ? 'fill' : 'outline',
    staticColor,
    isDisabled,
    isPending,
    size = 'M',
    ...otherProps
  } = props;
  let domRef = useFocusableRef(ref);
  let {isPressed} = useButton(props, domRef);
  let {styleProps} = useStyleProps(otherProps as any);
  let hasLabel = useHasChild('[data-label]', domRef);
  let hasIcon = useHasChild('[data-icon]', domRef);
  // eslint-disable-next-line
  let [isProgressVisible, setIsProgressVisible] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isPending) {
            // Start timer when isPending is set to true.
      timeout = setTimeout(() => {
        setIsProgressVisible(true);
      }, 1000);
    } else {
            // Exit loading state when isPending is set to false. */
      setIsProgressVisible(false);
    }
    return () => {
            // Clean up on unmount or when user removes isPending prop before entering loading state.
      clearTimeout(timeout);
    };
  }, [isPending]);

  if (variant === 'cta') {
    variant = 'accent';
  } else if (variant === 'overBackground') {
    variant = 'primary';
    staticColor = 'white';
  }

  usePressScale(domRef, isPressed);

    // let styles = hasIcon && !hasLabel ? iconOnlyButton : buttonStyles;
  let styles = staticColor ? staticColorButton : buttonStyles;
  if (staticColor && variant !== 'secondary') {
    variant = 'primary';
  }

  return (
    <FocusRing>
      <RACButton
        {...styleProps}
        {...props}
        ref={domRef as any}
        data-variant={variant}
        data-style={style}
        data-static-color={staticColor || undefined}
        aria-disabled={isPending || undefined}
        data-has-icon={hasIcon || undefined}
        data-icon-only={(hasIcon && !hasLabel) || undefined}
        aria-live={isPending ? 'polite' : undefined}
        style={pressScale(domRef, styleProps.style as any)}
        className={
                    styles({
                      variant: variant as any,
                      style,
                      staticColor,
                      size,
                      isDisabled,
                      hasIcon: hasIcon as any,
                      hasLabel
                    } as any)}>
        <SlotProvider
          slots={{
            icon: {
              size: 'S',
              UNSAFE_className: 'flex-shrink-0 ' + (hasLabel ? '-ml-[2px]' : ''),
              'data-icon': true
                            // UNSAFE_className: classNames(styles, 'spectrum-Icon')
            },
            text: {
                            // UNSAFE_className: classNames(styles, 'spectrum-Button-label')
              'data-label': true
            }
          }}>
          {typeof children === 'string'
                        ? <Text>{children}</Text>
                        : children}
        </SlotProvider>
      </RACButton>
    </FocusRing>
  );
});

export {Button};
