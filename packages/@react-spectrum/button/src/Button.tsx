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

import {
  classNames,
  SlotProvider,
  useFocusableRef,
  useHasChild,
  usePressScale,
  pressScale,
  useSlotProps,
  useStyleProps
} from '@react-spectrum/utils';
import {Button as RACButton} from 'react-aria-components';
import {FocusableRef} from '@react-types/shared';
import {FocusRing} from '@react-aria/focus';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps} from '@react-aria/utils';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {ElementType, ReactElement, useEffect, useState} from 'react';
import {SpectrumButtonProps} from '@react-types/button';
import styles from '@adobe/spectrum-css-temp/components/button/vars.css';
import {Text} from '@react-spectrum/text';
import {useButton} from '@react-aria/button';
import {useHover} from '@react-aria/interactions';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';
import {tv} from 'tailwind-variants';

function disablePendingProps(props) {
  // Don't allow interaction while isPending is true
  if (props.isPending) {
    props.onPress = undefined;
    props.onPressStart = undefined;
    props.onPressEnd = undefined;
    props.onPressChange = undefined;
    props.onPressUp = undefined;
    props.onKeyDown = undefined;
    props.onKeyUp = undefined;
    props.onClick = undefined;
    props.href = undefined;
  }
  return props;
}

function oldStyle({isPressed, isHovered, isDisabled}) {
  return classNames(
    styles,
    'spectrum-Button',
    {
      'spectrum-Button--iconOnly': hasIcon && !hasLabel,
      'is-disabled': isDisabled || isProgressVisible,
      'is-active': isPressed,
      'is-hovered': isHovered,
      'spectrum-Button--pending': isProgressVisible
    },
    styleProps.className
  )
}

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

function Button<T extends ElementType = 'button'>(props: SpectrumButtonProps<T>, ref: FocusableRef<HTMLElement>) {
  props = useProviderProps(props);
  props = useSlotProps(props, 'button');
  props = disablePendingProps(props);
  let {
    elementType: ElementType = 'button',
    children,
    variant,
    style = variant === 'accent' || variant === 'cta' ? 'fill' : 'outline',
    staticColor,
    isDisabled,
    isPending,
    autoFocus,
    ...otherProps
  } = props;
  let domRef = useFocusableRef(ref);
  let {buttonProps, isPressed} = useButton(props, domRef);
  let {hoverProps, isHovered} = useHover({isDisabled});
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let {styleProps} = useStyleProps(otherProps);
  // let hasLabel = useHasChild(`.${styles['spectrum-Button-label']}`, domRef);
  // let hasIcon = useHasChild(`.${styles['spectrum-Icon']}`, domRef);
  let hasLabel = useHasChild('[data-label]', domRef);
  let hasIcon = useHasChild('[data-icon]', domRef);
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
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')} autoFocus={autoFocus}>
      <RACButton
        {...styleProps}
        // {...mergeProps(buttonProps, hoverProps)}
        {...props}
        ref={domRef}
        data-variant={variant}
        data-style={style}
        data-static-color={staticColor || undefined}
        aria-disabled={isPending || undefined}
        data-has-icon={hasIcon || undefined}
        data-icon-only={(hasIcon && !hasLabel) || undefined}
        aria-live={isPending ? 'polite' : undefined}
        style={pressScale(domRef, styleProps.style)}
        className={
          styles({
            variant,
            style,
            staticColor,
            size: 'M',
            hasIcon,
            hasLabel
          })
          // classNames(
          //   styles,
          //   'spectrum-Button',
          //   {
          //     'spectrum-Button--iconOnly': hasIcon && !hasLabel,
          //     'is-disabled': isDisabled || isProgressVisible,
          //     'is-active': isPressed,
          //     'is-hovered': isHovered,
          //     'spectrum-Button--pending': isProgressVisible
          //   },
          //   styleProps.className
          // )
          // 'rounded-full font-bold cursor-default transition border-solid border outline-none focus-visible:ring ' +

          // 'font-[inherit] text-base px-300 h-[32px] ' +

          // 'bg-base-tint border-transparent text-white disabled:bg-background-disabled ' +
          // 'tint-accent'
        }>
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
          {isProgressVisible && <ProgressCircle
            aria-label={stringFormatter.format('loading')}
            isIndeterminate
            size="S"
            UNSAFE_className={classNames(styles, 'spectrum-Button-circleLoader')}
            staticColor={staticColor} />}
          {typeof children === 'string'
            ? <Text>{children}</Text>
            : children}
        </SlotProvider>
      </RACButton>
    </FocusRing>
  );
}

/**
 * Buttons allow users to perform an action or to navigate to another page.
 * They have multiple styles for various needs, and are ideal for calling attention to
 * where a user needs to do something in order to move forward in a flow.
 */
let _Button = React.forwardRef(Button) as <T extends ElementType = 'button'>(props: SpectrumButtonProps<T> & {ref?: FocusableRef<HTMLElement>}) => ReactElement;
export {_Button as Button};
