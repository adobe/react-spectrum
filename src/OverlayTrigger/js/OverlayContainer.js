import React from 'react';

export default function OverlayContainer({arrowOffsetLeft, arrowOffsetTop, children, placement, style, open}) {
  style.position = 'absolute';
  let arrowStyle = {
    top: arrowOffsetTop,
    left: arrowOffsetLeft
  };

  return (
    <div style={style}>
      {React.cloneElement(React.Children.only(children), {arrowStyle, placement, open})}
    </div>
  );
}
