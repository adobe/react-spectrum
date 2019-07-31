import {cleanup, fireEvent, render} from '@testing-library/react';
import React, {useRef} from 'react';
import {useOverlayPosition} from '../';

function Example({triggerTop = 250, ...props}) {
  let triggerRef = useRef();
  let containerRef = useRef();
  let overlayRef = useRef();
  let {overlayProps, placement, arrowProps} = useOverlayPosition({triggerRef, containerRef, overlayRef, ...props});
  let style = {width: 300, height: 200, ...overlayProps.style};
  return (
    <React.Fragment>
      <div ref={triggerRef} data-testid="trigger" style={{left: 10, top: triggerTop, width: 100, height: 100}}>Trigger</div>
      <div ref={containerRef} data-testid="container" style={{width: 600, height: 600}}>
        <div ref={overlayRef} data-testid="overlay" style={style}>
          <div data-testid="arrow" {...arrowProps} />
          placement: {placement}
        </div>
      </div>
    </React.Fragment>
  );
}

HTMLElement.prototype.getBoundingClientRect = function () {
  return {
    left: parseInt(this.style.left, 10) || 0,
    top: parseInt(this.style.top, 10) || 0,
    width: parseInt(this.style.width, 10) || 0,
    height: parseInt(this.style.width, 10) || 0
  };
};

describe('useOverlayPosition', function () {
  afterEach(cleanup);

  it('should position the overlay relative to the trigger', function () {
    let res = render(<Example />);
    let overlay = res.getByTestId('overlay');
    let arrow = res.getByTestId('arrow');

    expect(overlay).toHaveStyle(`
      position: absolute;
      z-index: 100000;
      left: 0px;
      top: 350px;
      max-height: 418px;
    `);

    expect(overlay).toHaveTextContent('placement: bottom');
    expect(arrow).toHaveStyle(`
      left: 60px;
    `);
  });

  it('should update the position on window resize', function () {
    let res = render(<Example triggerTop={400} />);
    let overlay = res.getByTestId('overlay');

    expect(overlay).toHaveStyle(`
      left: 0px;
      top: 100px;
      max-height: 668px;
    `);

    expect(overlay).toHaveTextContent('placement: top');

    let innerHeight = window.innerHeight;
    window.innerHeight = 1000;
    fireEvent(window, new Event('resize'));

    expect(overlay).toHaveStyle(`
      left: 0px;
      top: 500px;
      max-height: 500px;
    `);

    expect(overlay).toHaveTextContent('placement: bottom');
    window.innerHeight = innerHeight;
  });

  it('should update the position on props change', function () {
    let res = render(<Example />);
    let overlay = res.getByTestId('overlay');

    expect(overlay).toHaveStyle(`
      left: 0px;
      top: 350px;
      max-height: 418px;
    `);

    res.rerender(<Example offset={20} />);

    expect(overlay).toHaveStyle(`
      left: 0px;
      top: 370px;
      max-height: 398px;
    `);
  });
});
