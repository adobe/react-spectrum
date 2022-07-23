import { mergeProps, useSeparator } from 'react-aria';
import React, { createContext, useContext } from 'react';

export const SeparatorContext = createContext({});

export function Separator(props) {
  let contextProps = useContext(SeparatorContext);
  props = mergeProps(contextProps, props);
  let { elementType, orientation, style, className } = props;
  let Element = elementType || 'hr';
  if (Element === 'hr' && orientation === 'vertical') {
    Element = 'div';
  }

  let { separatorProps } = useSeparator({
    elementType,
    orientation
  });

  return (
    <Element
      {...separatorProps}
      style={style}
      className={className} />
  );
}

// Support separators inside collections (e.g. menus)
Separator.getCollectionNode = function* (props) {
  yield {
    type: 'separator',
    props,
  };
};
