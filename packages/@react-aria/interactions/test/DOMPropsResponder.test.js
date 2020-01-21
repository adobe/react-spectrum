import {cleanup, fireEvent, render} from '@testing-library/react';
import {DOMPropsResponder, Hoverable} from '../';
import React from 'react';

describe('HoverResponder', function () {
  afterEach(cleanup);

  it('should handle hover events on nested hoverable children', function () {
    let onHover = jest.fn();
    let {getByRole} = render(
      <DOMPropsResponder onHover={onHover}>
        <div>
          <Hoverable><button>Button</button></Hoverable>
        </div>
      </DOMPropsResponder>
    );

    let button = getByRole('button');
    fireEvent.mouseOver(button);
    fireEvent.mouseEnter(button);

    expect(onHover).toHaveBeenCalledTimes(1);
  });

  it('should handle forward refs to nested hoverable children', function () {
    let ref = React.createRef();
    let {getByRole} = render(
      <DOMPropsResponder ref={ref}>
        <div>
          <Hoverable><button>Button</button></Hoverable>
        </div>
      </DOMPropsResponder>
    );

    let button = getByRole('button');
    expect(ref.current).toBe(button);
  });

  it('should warn if there is no hoverable child', function () {
    let warn = jest.spyOn(global.console, 'warn').mockImplementation();
    render(
      <DOMPropsResponder>
        <div>
          <button>Button</button>
        </div>
      </DOMPropsResponder>
    );

    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('should not warn if there is a hoverable child', function () {
    let warn = jest.spyOn(global.console, 'warn').mockImplementation();
    render(
      <DOMPropsResponder>
        <div>
          <Hoverable><button>Button</button></Hoverable>
        </div>
      </DOMPropsResponder>
    );

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
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
    fireEvent.mouseEnter(button);

    expect(onHover).toHaveBeenCalledTimes(1);
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });
});
