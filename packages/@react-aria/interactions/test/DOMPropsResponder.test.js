import {cleanup, fireEvent, render} from '@testing-library/react';
import {DOMPropsResponder, Hoverable} from '../';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import {Provider} from '@react-spectrum/provider';
import {DOMPropsResponderContext} from '../src/DOMPropsContext';


// skip these?
describe('DOMPropsResponder', function () {
  afterEach(cleanup);

  let theme = {
    light: themeLight,
    medium: scaleMedium
  };

  it('blah', function () {
    let ref = React.createRef();
    let {getByRole} = render(
      <Provider theme={theme}>
        <DOMPropsResponderContext.Provider value={ref}>
          <Hoverable><button>Button</button></Hoverable>
        </DOMPropsResponderContext.Provider>
      </Provider>
    );

    let button = getByRole('button');
    expect(ref.current).toBe(button);
  });


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

  it('should pass forward refs to nested hoverable children', function () {
    let ref = React.createRef();
    let {getByRole} = render(
      <Provider theme={theme}>
        <DOMPropsResponder ref={ref}>
          <Hoverable><button>Button</button></Hoverable>
        </DOMPropsResponder>
      </Provider>
    );

    let button = getByRole('button');
    console.log("asklfjakl;sjfklasjfkl;aljs;kf", ref.current)
    expect(ref.current).toBe(button);
  });

  // ==============

  // fails
    // not logging trying to register
    // logging: true

    // you pulled the register function out of the domProps ?

    // possible answer: make run, see if what you are supposed to be getting (true or false)
      // make your own register function here and force that value
        // change the name of the test to be pertaining to registering
  it('should not warn if there is a hoverable child', function () {
    let warn = jest.spyOn(global.console, 'warn').mockImplementation();
    render(
      <DOMPropsResponder>
        <button>Button</button>
      </DOMPropsResponder>
    );

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  // passes
    // trying to register logged
    // no true / false logged
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

  // irl trying to register is logged but no true / false logged


});
