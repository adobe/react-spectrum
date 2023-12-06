import { useDOMRef, useSlotProps, useStyleProps } from "@react-spectrum/utils";
import {Text as RACText} from 'react-aria-components';
import {filterDOMProps} from "@react-aria/utils";
import { forwardRef } from "react";
import { TextProps } from "@adobe/react-spectrum";
import { DOMRef } from "@react-types/shared";


function Text(props: TextProps, ref: DOMRef) {
  props = useSlotProps(props, 'text');
  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);

  return (
    <RACText {...filterDOMProps(otherProps)} {...styleProps} ref={domRef}>
      {children}
    </RACText>
  );
}

/**
 * Text represents text with no specific semantic meaning.
 */
const _Text = forwardRef(Text);
export {_Text as Text};
