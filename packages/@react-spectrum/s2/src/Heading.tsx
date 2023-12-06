
import {DOMRef} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {HeadingProps} from '@react-types/text';
import React, {ElementType, forwardRef} from 'react';
import {useDOMRef, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {Heading as RACHeading} from 'react-aria-components';

function Heading(props: HeadingProps, ref: DOMRef<HTMLHeadingElement>) {
  props = useSlotProps(props, 'heading');

  let {
    children,
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let domRef = useDOMRef(ref);

  return (
    <RACHeading
      {...filterDOMProps(otherProps)}
      {...styleProps}
      level={props.level}
      ref={domRef}>
      {children}
    </RACHeading>
  );
}

/**
 * Heading is used to create various levels of typographic hierarchies.
 */
const _Heading = forwardRef(Heading);
export {_Heading as Heading};
