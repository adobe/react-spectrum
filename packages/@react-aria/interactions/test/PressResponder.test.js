import {cleanup, fireEvent, render} from '@testing-library/react';
import {Pressable, PressResponder} from '../';
import React from 'react';

describe('PressResponder', function () {
  afterEach(cleanup);

  it('should handle press events on nested pressable children', function () {
    let onPress = jest.fn();
    let {getByRole} = render(
      <PressResponder onPress={onPress}>
        <div>
          <Pressable><button>Button</button></Pressable>
        </div>
      </PressResponder>
    );

    let button = getByRole('button');
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    fireEvent.click(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should handle forward refs to nested pressable children', function () {
    let ref = React.createRef();
    let {getByRole} = render(
      <PressResponder ref={ref}>
        <div>
          <Pressable><button>Button</button></Pressable>
        </div>
      </PressResponder>
    );

    let button = getByRole('button');
    expect(ref.current).toBe(button);
  });

  it('should warn if there is no pressable child', function () {
    let warn = jest.spyOn(global.console, 'warn').mockImplementation();
    render(
      <PressResponder>
        <div>
          <button>Button</button>
        </div>
      </PressResponder>
    );

    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('should not warn if there is a pressable child', function () {
    let warn = jest.spyOn(global.console, 'warn').mockImplementation();
    render(
      <PressResponder>
        <div>
          <Pressable><button>Button</button></Pressable>
        </div>
      </PressResponder>
    );

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('should should merge with existing props, not overwrite', function () {
    let onPress = jest.fn();
    let onClick = jest.fn();
    let {getByRole} = render(
      <PressResponder>
        <div>
          <Pressable onPress={onPress}>
            <button onClick={onClick}>Button</button>
          </Pressable>
        </div>
      </PressResponder>
    );

    let button = getByRole('button');
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    fireEvent.click(button);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
