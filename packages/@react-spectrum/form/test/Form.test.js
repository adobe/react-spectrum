import {cleanup, render} from '@testing-library/react';
import {Form} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

describe('Form', function () {
  afterEach(() => {
    cleanup();
  });

  it('should render a form', () => {
    let {getByRole} = render(
      <Provider theme={theme}>
        <Form />
      </Provider>
    );
    
    let form = getByRole('form');
    expect(form).toBeTruthy();
  });

  it('should render children inside the form', () => {
    let {getByRole} = render(
      <Provider theme={theme}>
        <Form>
          <button>Test</button>
        </Form>
      </Provider>
    );

    let button = getByRole('button');
    expect(button).toBeTruthy();
  });

  it('should attach a optional user provided ref to the form', () => {
    let ref = React.createRef();
    let {getByRole} = render(
      <Provider theme={theme}>
        <Form ref={ref} />
      </Provider>
    );
    
    let form = getByRole('form');
    expect(form).toBe(ref.current.UNSAFE_getDOMNode());
  });
});
