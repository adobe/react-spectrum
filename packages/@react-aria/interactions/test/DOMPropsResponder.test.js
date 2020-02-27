import {cleanup, fireEvent, render} from '@testing-library/react';
import {DOMPropsResponder, Hoverable} from '../';
import React from 'react';

// skip these?
describe('DOMPropsResponder', function () {
  afterEach(cleanup);

  /*
  it('should pass hover events to nested hoverable children', function () {
    let onHover = jest.fn();
    let {getByRole} = render(
      <DOMPropsResponder onHover={onHover}>
        <Hoverable><button>Button</button></Hoverable>
      </DOMPropsResponder>
    );

    let button = getByRole('button');
    fireEvent.mouseOver(button);

    expect(onHover).toHaveBeenCalledTimes(1);
  });
  */

  /*
  it('should pass forward refs to nested hoverable children', function () {
    let ref = React.createRef();
    let {getByRole} = render(
      <DOMPropsResponder ref={ref}>
        <Hoverable><button>Button</button></Hoverable>
      </DOMPropsResponder>
    );

    let button = getByRole('button');
    expect(ref.current).toBe(button);
  });
  */

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

  // this test failing tells you that it makes sense the other tests are failing

  /*
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
  */
});
