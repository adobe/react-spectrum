import {cleanup, render} from '@testing-library/react';
import {fireEvent} from '@testing-library/react';
import React from 'react';
import {Tag} from '../';
import {Tag as V2Tag} from '@react/react-spectrum/TagList';


describe('Tag', function () {
  let onRemoveSpy = jest.fn();
  afterEach(() => {
    cleanup();
    onRemoveSpy.mockClear();
  });

  it.each`
   Component        | props
    ${Tag}          | ${{}}
    ${V2Tag}        | ${{}}
  `('v2/3 parity allows custom props to be passed through to the tag', function ({Component, props}) {
    let {container} = render(<Component {...props} data-foo="bar" aria-hidden name="s">Cool Tag</Component>);

    let tag = container.firstElementChild;
    expect(tag).toHaveAttribute('data-foo', 'bar');
    expect(tag).toHaveAttribute('aria-hidden', 'true');
    expect(tag).toHaveAttribute('name', 's');
  });

  it('handles key down', function () {
    const props = {isRemovable: true, onRemove: onRemoveSpy};
    let {getByText} = render(<Tag {...props}>Cool Tag</Tag>);

    let tag = getByText('Cool Tag');

    fireEvent.keyDown(tag, {key: 'Delete'});
    expect(onRemoveSpy).toHaveBeenCalledWith('Cool Tag', expect.anything());
  });
});
