import { useDOMRef, useSlotProps, useStyleProps } from "@react-spectrum/utils";
import {Text as RACText} from 'react-aria-components';
import {filterDOMProps} from "@react-aria/utils";
import { forwardRef } from "react";

export let Text = forwardRef((props, ref) => {
  props = useSlotProps(props, 'text');
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);

  return (
    <RACText {...filterDOMProps(otherProps)} {...styleProps} ref={ref}>
      {children}
    </RACText>
  );
});
