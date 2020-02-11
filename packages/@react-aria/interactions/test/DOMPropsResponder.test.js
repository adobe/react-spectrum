import {cleanup, fireEvent, render} from '@testing-library/react';
import {DOMPropsResponder, Hoverable} from '../';
import React from 'react';

describe('HoverResponder', function () {
  afterEach(cleanup);

  it('should handle hover events on nested hoverable children', function () {
    let onHover = jest.fn();
    let {getByRole} = render(
      <DOMPropsResponder>
        <div>
          <Hoverable onHover={onHover}>
            <button>Button</button>
          </Hoverable>
        </div>
      </DOMPropsResponder>
    );

    let button = getByRole('button');
    fireEvent.mouseOver(button);

    expect(onHover).toHaveBeenCalledTimes(1);
  });

  it('should handle forward refs to nested hoverable children', function () {
    let ref = React.createRef();
    let {getByRole} = render(
      <DOMPropsResponder>
        <div>
          <Hoverable ref={ref}>
            <button>Button</button>
          </Hoverable>
        </div>
      </DOMPropsResponder>
    );

    let button = getByRole('button');
    expect(ref.current).toBe(button);
  });

  it('should merge with existing props, not overwrite', function () {
    let onHover = jest.fn();
    let onMouseEnter = jest.fn();
    let {getByRole} = render(
      <DOMPropsResponder>
        <div>
          <Hoverable onHover={onHover}>
            <button onMouseEnter={onMouseEnter}>Button</button>
          </Hoverable>
        </div>
      </DOMPropsResponder>
    );

    let button = getByRole('button');
    fireEvent.mouseOver(button);

    expect(onHover).toHaveBeenCalledTimes(1);
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });
});
