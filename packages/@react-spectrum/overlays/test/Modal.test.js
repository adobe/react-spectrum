import {cleanup, fireEvent, render, waitForDomChange} from '@testing-library/react';
import {Modal} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
// eslint-disable-next-line monorepo/no-internal-import
import scaleMedium from '@adobe/spectrum-css/dist/vars/spectrum-medium-unique.css';
// eslint-disable-next-line monorepo/no-internal-import
import themeLight from '@adobe/spectrum-css/dist/vars/spectrum-light-unique.css';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

describe('Modal', function () {
  afterEach(cleanup);

  it('should render nothing if isOpen is not set', function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <Modal>
          <div role="dialog">contents</div>
        </Modal>
      </Provider>
    );

    expect(() => {
      getByRole('dialog');
    }).toThrow();
    expect(document.body).not.toHaveStyle('overflow: hidden');
  });

  it('should render when isOpen is true', async function () {
    let {getByRole} = render(
      <Provider theme={theme}>
        <Modal isOpen>
          <div role="dialog">contents</div>
        </Modal>
      </Provider>
    );

    await waitForDomChange(); // wait for animations
    let dialog = getByRole('dialog');
    expect(dialog).toBeVisible();
    expect(document.body).toHaveStyle('overflow: hidden');
  });

  it('hides the modal when pressing the escape key', async function () {
    let onClose = jest.fn();
    let {getByRole} = render(
      <Provider theme={theme}>
        <Modal isOpen onClose={onClose}>
          <div role="dialog">contents</div>
        </Modal>
      </Provider>
    );
    await waitForDomChange(); // wait for animation
    let dialog = getByRole('dialog');
    fireEvent.keyDown(dialog, {key: 'Escape'});
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('hides the modal when clicking outside', async function () {
    let onClose = jest.fn();
    render(
      <Provider theme={theme}>
        <Modal isOpen onClose={onClose}>
          <div role="dialog">contents</div>
        </Modal>
      </Provider>
    );
    await waitForDomChange(); // wait for animation
    fireEvent.mouseUp(document.body);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
