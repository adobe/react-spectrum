import {cleanup, render} from '@testing-library/react';
import {Overlay} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import scaleMedium from '@spectrum-css/vars/dist/spectrum-medium-unique.css';
import themeLight from '@spectrum-css/vars/dist/spectrum-light-unique.css';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

function ExampleOverlay() {
  return <span data-testid="contents">Overlay</span>;
}

describe('Overlay', function () {
  afterEach(cleanup);

  it('should render nothing if isOpen is not set', function () {
    let overlayRef = React.createRef();
    render(
      <Provider theme={theme}>
        <Overlay ref={overlayRef}>
          <ExampleOverlay />
        </Overlay>
      </Provider>
    );

    expect(overlayRef.current).toBe(null);
  });

  it('should render into a portal in the body', function () {
    let providerRef = React.createRef();
    let overlayRef = React.createRef();
    render(
      <Provider theme={theme} ref={providerRef}>
        <Overlay isOpen ref={overlayRef}>
          <ExampleOverlay />
        </Overlay>
      </Provider>
    );

    expect(overlayRef.current).not.toBe(providerRef.current);
    expect(overlayRef.current.parentNode).toBe(document.body);
    expect(overlayRef.current).toHaveStyle('position: absolute; z-index: 100000');
  });
});
