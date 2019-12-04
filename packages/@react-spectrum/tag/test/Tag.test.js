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
   Name          | Component         | props
   ${'Tag'}      | ${Tag}            | ${{}}
   ${'V2Tag'}    | ${V2Tag}          | ${{}}
  `('$Name allows custom props to be passed through to the tag', function ({Component, props}) {
    let {container} = render(<Component {...props} data-foo="bar" aria-hidden>Cool Tag</Component>);

    let tag = container.firstElementChild;
    expect(tag).toHaveAttribute('data-foo', 'bar');
    expect(tag).toHaveAttribute('aria-hidden', 'true');
  });

  it.each`
   Name         | Component         | props
   ${'Tag'}     | ${Tag}            | ${{isRemovable: true, onRemove: onRemoveSpy}}
   ${'V2Tag'}   | ${V2Tag}          | ${{closable: true, onClose: onRemoveSpy}}
  `('$Name handles appropriate key down in order to delete tag', function ({Component, props}) {
    let {getByText} = render(<Component {...props}>Cool Tag</Component>);

    let tag = getByText('Cool Tag');

    fireEvent.keyDown(tag, {key: 'Delete', keyCode: 46});
    expect(onRemoveSpy).toHaveBeenCalledWith('Cool Tag', expect.anything());
    onRemoveSpy.mockReset();

    fireEvent.keyDown(tag, {key: 'Backspace', keyCode: 8});
    expect(onRemoveSpy).toHaveBeenCalledWith('Cool Tag', expect.anything());
  });

  it.each`
   Name          | Component         | props
   ${'Tag'}      | ${Tag}            | ${{isDisabled: true, isRemovable: true, onRemove: onRemoveSpy}}
   ${'V2Tag'}    | ${V2Tag}          | ${{disabled: true, closable: true, onClose: onRemoveSpy}}
  `('$Name can be disabled', function ({Component, props}) {
    let {getByText} = render(<Component {...props}>Cool Tag</Component>);

    let tag = getByText('Cool Tag');

    fireEvent.keyDown(tag, {key: 'Delete'});
    expect(onRemoveSpy).not.toHaveBeenCalledWith('Cool Tag', expect.anything());
  });

  it.each`
   Name          | Component         | props
   ${'Tag'}      | ${Tag}            | ${{validationState: 'invalid'}}
  `('$Name can be disabled', function ({Component, props}) {
    let {getByText} = render(<Component {...props}>Cool Tag</Component>);

    let tag = getByText('Cool Tag');
    tag = tag.parentElement;

    expect(tag).toHaveAttribute('aria-invalid', 'true');
  });
});
