import {cleanup, fireEvent, render} from '@testing-library/react';
import React, {useRef} from 'react';
import {useOverlayTrigger} from '../';

function Example(props) {
  let ref = useRef();
  useOverlayTrigger({ref, ...props});
  return <div ref={ref} data-testid={props['data-testid'] || 'test'}>{props.children}</div>;
}

describe('useOverlayTrigger', function () {
  afterEach(cleanup);

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

  it('should not close the overlay when the body scrolls', function () {
    let onClose = jest.fn();
    render(<Example isOpen onClose={onClose} />);

    fireEvent.scroll(document.body);
    expect(onClose).not.toHaveBeenCalled();
  });
});
