import { useSlotProps, useStyleProps, baseStyleProps, StyleHandlers } from "@react-spectrum/utils";
import { useProvider } from "@react-spectrum/provider";
import { IconProps } from "@adobe/react-spectrum";
import {filterDOMProps} from "@react-aria/utils";
import {IconColorValue} from "@react-types/shared";
import React, { createContext, forwardRef } from 'react';
import { ContextValue, useContextProps } from "react-aria-components";

interface IconContextValue extends IconProps {}
export const IconContext = createContext<ContextValue<IconContextValue, HTMLElement>>({});


function iconColorValue(value: IconColorValue) {
  return `var(--spectrum-semantic-${value}-color-icon)`;
}

const iconStyleProps: StyleHandlers = {
  ...baseStyleProps,
  color: ['color', iconColorValue]
};

export let Icon = forwardRef((props: IconProps, ref) => {
  props = useSlotProps(props, 'icon');
  let [_, ref2] = useContextProps(props, ref, IconContext);
  let {
    children,
    size,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps, iconStyleProps);

  let provider = useProvider();
  let scale = 'M';
  if (provider !== null) {
    scale = provider.scale === 'large' ? 'L' : 'M';
  }
  if (!ariaHidden) {
    ariaHidden = undefined;
  }

  // Use user specified size, falling back to provider scale if size is undef
  let iconSize = size ? size : scale;

  return React.cloneElement(children, {
    ...filterDOMProps(otherProps),
    ...styleProps,
    focusable: 'false',
    'aria-label': ariaLabel,
    'aria-hidden': (ariaLabel ? (ariaHidden || undefined) : true),
    role: 'img',
    ref
  });
});