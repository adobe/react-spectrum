import BaseOverlay from 'devongovett-react-overlays/lib/Overlay';
import OpenTransition from '../../utils/OpenTransition';
import React from 'react';

export default function Overlay({children, ...props}) {
  return (
    <BaseOverlay
      {...props}
      transition={OpenTransition}>
      <OverlayContainer>
        {children}
      </OverlayContainer>
    </BaseOverlay>
  );
}

function OverlayContainer({arrowOffsetLeft, arrowOffsetTop, children, placement, style, open}) {
  let arrowStyle = {
    top: arrowOffsetTop,
    left: arrowOffsetLeft
  };

  let child = React.Children.only(children);
  style = Object.assign({position: 'absolute'}, style, child.props.style);
  return React.cloneElement(child, {style, arrowStyle, placement, open});
}
