import {cleanup, fireEvent, render} from '@testing-library/react';
import {Hoverable} from '../';
import React from 'react';

describe('Hoverable', function () {
  afterEach(cleanup);

  it('should apply hover events to child element', function () {
    let onHover = jest.fn();
    let {getByRole} = render(
      <Hoverable onHover={onHover}>
        <button>Button</button>
      </Hoverable>
    );

    let button = getByRole('button');
    fireEvent.mouseOver(button);
    fireEvent.mouseEnter(button);

    expect(onHover).toHaveBeenCalledTimes(1);
  });

  it('should should merge with existing props, not overwrite', function () {
    let onHover = jest.fn();
    let onMouseEnter = jest.fn();
    let {getByRole} = render(
      <Hoverable onHover={onHover}>
        <button onMouseEnter={onMouseEnter}>Button</button>
      </Hoverable>
    );

    let button = getByRole('button');
    fireEvent.mouseOver(button);
    fireEvent.mouseEnter(button);

    expect(onHover).toHaveBeenCalledTimes(1);
    expect(onMouseEnter).toHaveBeenCalledTimes(1);
  });
});
