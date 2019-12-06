import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {StatusLight} from '../';
import V2StatusLight from '@react/react-spectrum/StatusLight';


describe('StatusLight', function () {

  afterEach(() => {
    cleanup();
  });

  it.each`
    Name               | Component        | props
    ${'StatusLight'}   | ${StatusLight}   | ${{}}
    ${'V2StatusLight'} | ${V2StatusLight} | ${{}}
  `('$Name default', function ({Component, props}) {
    let {getByText} = render(<Component {...props} id="status-light">StatusLight of Love</Component>);

    let statuslight = getByText('StatusLight of Love');
    expect(statuslight).toHaveAttribute('id', 'status-light');
  });

  it.each`
    Name               | Component        | props
    ${'StatusLight'}   | ${StatusLight}   | ${{variant: 'celery'}}
    ${'V2StatusLight'} | ${V2StatusLight} | ${{variant: 'celery'}}
  `('$Name supports variant and aria-label', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props} id="status-light" aria-label="StatusLight of Love" />);

    let statuslight = getByLabelText('StatusLight of Love');
    expect(statuslight).toHaveAttribute('id', 'status-light');
  });

  // V2 does not have a warning
  it.each`
    Name               | Component        | props
    ${'StatusLight'}   | ${StatusLight}   | ${{variant: 'celery'}}
  `('$Name warns user if no label is provided', function ({Component, props}) {
    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Component {...props} id="status-light" />);
    expect(spyWarn).toHaveBeenCalledWith('If no children are provided, an aria-label must be specified');
  });

  it.each`
    Name               | Component        | props
    ${'StatusLight'}   | ${StatusLight}   | ${{isDisabled: true}}
    ${'V2StatusLight'} | ${V2StatusLight} | ${{disabled: true}}
  `('$Name disabled, its css only, so this just makes sure it does not blow up', function ({Component, props}) {
    let {getByText} = render(<Component {...props} id="status-light">StatusLight of Love</Component>);

    let statuslight = getByText('StatusLight of Love');
    expect(statuslight).toHaveAttribute('id', 'status-light');
  });

  it.each`
    Name               | Component        | props
    ${'StatusLight'}   | ${StatusLight}   | ${{}}
  `('$Name forwards ref', function ({Component, props}) {
    let ref = React.createRef();
    let {getByText} = render(<Component {...props} ref={ref}>StatusLight of Love</Component>);

    let statuslight = getByText('StatusLight of Love');
    expect(statuslight).toBe(ref.current.UNSAFE_getDOMNode());
  });
});
