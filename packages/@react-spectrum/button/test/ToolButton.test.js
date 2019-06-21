import {cleanup, fireEvent, render} from '@testing-library/react';
import React from 'react';
import {ToolButton} from '../';
import V2Button from '@react/react-spectrum/Button';

let FakeIcon = (props) => <svg {...props}><path d="M 10,150 L 70,10 L 130,150 z" /></svg>;

describe('ToolButton', function () {
  let onPressSpy = jest.fn();

  afterEach(() => {
    cleanup();
    onPressSpy.mockClear();
  });

  it.each`
    Component        | props
    ${ToolButton}    | ${{onPress: onPressSpy, icon: <FakeIcon role="status" />}}
    ${V2Button}      | ${{variant: 'action', onClick: onPressSpy, icon: <FakeIcon role="status" />}}
  `('v2/3 parity handles defaults', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);

    let button = getByRole('button');
    fireEvent.click(button);
    expect(onPressSpy).toHaveBeenCalledTimes(1);

    let icon = getByRole('status');
    expect(icon).not.toBeNull();
  });

  it.each`
    Component        | props
    ${ToolButton}    | ${{icon: <FakeIcon role="status" />}}
    ${V2Button}      | ${{variant: 'action', icon: <FakeIcon role="status" />}}
  `('v2/3 parity allows custom props to be passed through to the button', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} data-foo="bar" aria-hidden name="s" />);

    let button = getByRole('button');
    expect(button).toHaveAttribute('data-foo', 'bar');
    expect(button).toHaveAttribute('aria-hidden', 'true');
    expect(button).toHaveAttribute('name', 's');
  });

  it('accepts an icon as a child', function () {
    let {getByRole} = render(<ToolButton><FakeIcon role="status" /></ToolButton>);

    let icon = getByRole('status');
    expect(icon).not.toBeNull();
  });

  it.each`
    Component        | props
    ${ToolButton}    | ${{onPress: onPressSpy, holdAffordance: true, icon: <FakeIcon role="status" />}}
    ${V2Button}      | ${{variant: 'action', onClick: onPressSpy, holdAffordance: true, icon: <FakeIcon role="status" />}}
  `('v2/3 parity hold affordance', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);

    let button = getByRole('button');
    let holdAffordance = getByRole('presentation');
    expect(holdAffordance).not.toBeNull();
    fireEvent.click(button);
    expect(onPressSpy).toHaveBeenCalledTimes(1);

    let icon = getByRole('status');
    expect(icon).not.toBeNull();
  });
});
