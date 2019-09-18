import {cleanup, fireEvent, render} from '@testing-library/react';
import {Pressable} from '../';
import React from 'react';

describe('Pressable', function () {
  afterEach(cleanup);

  it('should apply press events to child element', function () {
    let onPress = jest.fn();
    let {getByRole} = render(
      <Pressable onPress={onPress}>
        <button>Button</button>
      </Pressable>
    );

    let button = getByRole('button');
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    fireEvent.click(button);

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should should merge with existing props, not overwrite', function () {
    let onPress = jest.fn();
    let onClick = jest.fn();
    let {getByRole} = render(
      <Pressable onPress={onPress}>
        <button onClick={onClick}>Button</button>
      </Pressable>
    );

    let button = getByRole('button');
    fireEvent.mouseDown(button);
    fireEvent.mouseUp(button);
    fireEvent.click(button);

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
