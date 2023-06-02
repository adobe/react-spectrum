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

import {fireEvent, render} from '@react-spectrum/test-utils';
import React, {useRef} from 'react';
import {useOverlayPosition} from '../';

function Example({triggerTop = 250, ...props}) {
  let targetRef = useRef();
  let containerRef = useRef();
  let overlayRef = useRef();
  let {overlayProps, placement, arrowProps} = useOverlayPosition({targetRef, containerRef, overlayRef, arrowSize: 8, ...props});
  let style = {width: 300, height: 200, ...overlayProps.style};
  return (
    <React.Fragment>
      <div ref={targetRef} data-testid="trigger" style={{left: 10, top: triggerTop, width: 100, height: 100}}>Trigger</div>
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
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {configurable: true, value: 768});
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {configurable: true, value: 500});
  });

  it('should position the overlay relative to the trigger', function () {
    let res = render(<Example />);
    let overlay = res.getByTestId('overlay');
    let arrow = res.getByTestId('arrow');

    expect(overlay).toHaveStyle(`
      position: absolute;
      z-index: 100000;
      left: 12px;
      top: 350px;
      max-height: 406px;
    `);

    expect(overlay).toHaveTextContent('placement: bottom');
    // Arrow should be placed in the center of the button aka trigger left + trigger width / 2 - overlay left.
    expect(arrow).toHaveStyle(`
      left: 48px;
    `);
  });

  it('should position the overlay relative to the trigger at top', function () {
    let res = render(<Example placement="top" />);
    let overlay = res.getByTestId('overlay');
    let arrow = res.getByTestId('arrow');

    expect(overlay).toHaveStyle(`
      position: absolute;
      z-index: 100000;
      left: 12px;
      bottom: 518px;
      max-height: 238px;
    `);

    expect(overlay).toHaveTextContent('placement: top');
    expect(arrow).toHaveStyle(`
      left: 48px;
    `);
  });

  it('should update the position on window resize', function () {
    let res = render(<Example triggerTop={400} />);
    let overlay = res.getByTestId('overlay');

    expect(overlay).toHaveStyle(`
      left: 12px;
      top: 500px;
      max-height: 256px;
    `);

    expect(overlay).toHaveTextContent('placement: bottom');

    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {configurable: true, value: 1000});
    fireEvent(window, new Event('resize'));

    expect(overlay).toHaveStyle(`
      left: 12px;
      top: 500px;
      max-height: 488px;
    `);

    expect(overlay).toHaveTextContent('placement: bottom');
  });

  it('should update the position on props change', function () {
    let res = render(<Example />);
    let overlay = res.getByTestId('overlay');

    expect(overlay).toHaveStyle(`
      left: 12px;
      top: 350px;
      max-height: 406px;
    `);

    res.rerender(<Example offset={20} />);

    expect(overlay).toHaveStyle(`
      left: 12px;
      top: 370px;
      max-height: 386px;
    `);
  });

  it('should update the overlay\'s maxHeight by the given one if it\'s smaller than available viewport height.', function () {
    let res = render(<Example maxHeight={450} />);
    let overlay = res.getByTestId('overlay');

    expect(overlay).toHaveStyle(`
      left: 12px;
      top: 350px;
      max-height: 406px;
    `);

    res.rerender(<Example maxHeight={150} />);

    expect(overlay).toHaveStyle(`
      left: 12px;
      top: 350px;
      max-height: 150px;
    `);
  });

  it('should close the overlay when the trigger scrolls', function () {
    let onClose = jest.fn();
    let res = render(
      <div data-testid="scrollable">
        <Example isOpen onClose={onClose} />
      </div>
    );

    let scrollable = res.getByTestId('scrollable');
    fireEvent.scroll(scrollable);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should not close the overlay when an adjacent scrollable region scrolls', function () {
    let onClose = jest.fn();
    let res = render(
      <div>
        <Example isOpen onClose={onClose} />
        <div data-testid="scrollable">test</div>
      </div>
    );

    let scrollable = res.getByTestId('scrollable');
    fireEvent.scroll(scrollable);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should close the overlay when the body scrolls', function () {
    let onClose = jest.fn();
    render(<Example isOpen onClose={onClose} />);

    fireEvent.scroll(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close the overlay when the document scrolls', function () {
    let onClose = jest.fn();
    render(<Example isOpen onClose={onClose} />);

    fireEvent.scroll(document);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should close the overlay when target is window in a scroll event', function () {
    let onClose = jest.fn();
    render(<Example isOpen onClose={onClose} />);

    fireEvent.scroll(window);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('useOverlayPosition with positioned container', () => {
  let stubs = [];
  let realGetBoundingClientRect = window.HTMLElement.prototype.getBoundingClientRect;
  let realGetComputedStyle = window.getComputedStyle;
  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {configurable: true, value: 768});
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {configurable: true, value: 500});
    stubs.push(
      jest.spyOn(window.HTMLElement.prototype, 'offsetParent', 'get').mockImplementation(function () {
        // Make sure container is is the offsetParent of overlay
        if (this.attributes.getNamedItem('data-testid')?.value === 'overlay') {
          return document.querySelector('[data-testid="container"]');
        } else {
          return null;
        }
      }),
      jest.spyOn(window.HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
        if (this.attributes.getNamedItem('data-testid')?.value === 'container') {
          // Say, overlay is positioned somewhere
          return {
            top: 150,
            left: 0,
            width: 400,
            height: 400
          };
        } else {
          return realGetBoundingClientRect.apply(this);
        }
      }),
      jest.spyOn(window, 'getComputedStyle').mockImplementation(element => {
        if (element.attributes.getNamedItem('data-testid')?.value === 'container') {
          const sty = realGetComputedStyle(element);
          sty.position = 'relative';
          return sty;
        } else {
          return realGetComputedStyle(element);
        }
      })
    );
  });

  afterEach(() => {
    stubs.forEach(stub => stub.mockReset());
    stubs.length = 0;
  });

  it('should position the overlay relative to the trigger', function () {
    let res = render(<Example />);
    let overlay = res.getByTestId('overlay');
    let arrow = res.getByTestId('arrow');

    // Usually top is at 350, but because container is already offset by 150,
    // top should only be 200.
    expect(overlay).toHaveStyle(`
      position: absolute;
      z-index: 100000;
      left: 12px;
      top: 200px;
      max-height: 406px;
    `);

    expect(overlay).toHaveTextContent('placement: bottom');
    expect(arrow).toHaveStyle(`
      left: 48px;
    `);
  });

  it('should position the overlay relative to the trigger at top', function () {
    let res = render(<Example placement="top" />);
    let overlay = res.getByTestId('overlay');
    let arrow = res.getByTestId('arrow');

    // Expect bottom to be at 300; the top of the trigger is 250; container positioned
    // at 150, so relative to container it is 100, from the bottom of the container
    // of height 400 is 300.
    expect(overlay).toHaveStyle(`
      position: absolute;
      z-index: 100000;
      left: 12px;
      bottom: 300px;
      max-height: 238px;
    `);

    expect(overlay).toHaveTextContent('placement: top');
    expect(arrow).toHaveStyle(`
      left: 48px;
    `);
  });
});
