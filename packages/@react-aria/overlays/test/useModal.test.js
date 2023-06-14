/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {OverlayContainer, OverlayProvider, useModal} from '..';
import React from 'react';
import {render} from '@react-spectrum/test-utils';

function ModalDOM(props) {
  let {modalProps} = useModal();
  return <div data-testid={props.modalId || 'modal'} {...modalProps}>{props.children}</div>;
}

function Modal(props) {
  return (
    <OverlayContainer portalContainer={props.container} data-testid={props.providerId || 'modal-provider'}>
      <ModalDOM modalId={props.modalId}>{props.children}</ModalDOM>
    </OverlayContainer>
  );
}

function Example(props) {
  return (
    <OverlayProvider data-testid="root-provider">
      This is the root provider.
      {props.showModal &&
        <Modal container={props.container}>{props.children}</Modal>
      }
    </OverlayProvider>
  );
}

describe('useModal', function () {
  it('should set aria-hidden on parent providers on mount and remove on unmount', function () {
    let res = render(<Example />);
    let rootProvider = res.getByTestId('root-provider');

    expect(rootProvider).not.toHaveAttribute('aria-hidden');

    res.rerender(<Example showModal />);

    let modalProvider = res.getByTestId('modal-provider');

    expect(rootProvider).toHaveAttribute('aria-hidden', 'true');
    expect(modalProvider).not.toHaveAttribute('aria-hidden');

    res.rerender(<Example />);
    expect(rootProvider).not.toHaveAttribute('aria-hidden');
  });

  it('should work with nested modals', function () {
    let res = render(<Example />);
    let rootProvider = res.getByTestId('root-provider');

    expect(rootProvider).not.toHaveAttribute('aria-hidden');

    res.rerender(<Example showModal />);

    let modalProvider = res.getByTestId('modal-provider');

    expect(rootProvider).toHaveAttribute('aria-hidden', 'true');
    expect(modalProvider).not.toHaveAttribute('aria-hidden');

    res.rerender(
      <Example showModal>
        <Modal providerId="inner-modal-provider" modalId="inner-modal" />
      </Example>
    );

    let innerModalProvider = res.getByTestId('inner-modal-provider');

    expect(rootProvider).toHaveAttribute('aria-hidden', 'true');
    expect(modalProvider).toHaveAttribute('aria-hidden');
    expect(innerModalProvider).not.toHaveAttribute('aria-hidden');

    res.rerender(<Example showModal />);
    expect(rootProvider).toHaveAttribute('aria-hidden', 'true');
    expect(modalProvider).not.toHaveAttribute('aria-hidden');

    res.rerender(<Example />);
    expect(rootProvider).not.toHaveAttribute('aria-hidden');
  });

  it('can specify a different container from the default document.body', function () {
    let res = render(
      <div id="alternateContainer" data-testid="alternate-container">
        <Example container={document.getElementById('alternateContainer')} />
      </div>
    );
    let rootProvider = res.getByTestId('root-provider');

    expect(rootProvider).not.toHaveAttribute('aria-hidden');

    res.rerender(
      <div id="alternateContainer" data-testid="alternate-container">
        <Example showModal container={document.getElementById('alternateContainer')} />
      </div>
    );

    let modalProvider = res.getByTestId('modal-provider');

    expect(rootProvider).toHaveAttribute('aria-hidden', 'true');
    expect(modalProvider).not.toHaveAttribute('aria-hidden');

    res.rerender(
      <div id="alternateContainer" data-testid="alternate-container">
        <Example showModal container={document.getElementById('alternateContainer')}>
          <Modal providerId="inner-modal-provider" modalId="inner-modal">Inner</Modal>
        </Example>
      </div>
    );

    let innerModalProvider = res.getByTestId('inner-modal-provider');

    expect(rootProvider).toHaveAttribute('aria-hidden', 'true');
    expect(modalProvider).toHaveAttribute('aria-hidden');
    expect(innerModalProvider).not.toHaveAttribute('aria-hidden');

    res.rerender(
      <div id="alternateContainer" data-testid="alternate-container">
        <Example container={document.getElementById('alternateContainer')} />
      </div>
    );
    expect(rootProvider).not.toHaveAttribute('aria-hidden');
  });

  describe('error state', function () {
    const consoleError = console.error;
    beforeEach(() => {
      console.error = jest.fn();
    });

    afterEach(() => {
      console.error = consoleError;
    });
    it('if inside another container, throws an error', function () {
      let res = render(
        <div id="alternateContainer" data-testid="alternate-container">
          <Example container={document.getElementById('alternateContainer')}>
            <div id="nestedContainer" />
          </Example>
        </div>
      );
      let rootProvider = res.getByTestId('root-provider');

      expect(rootProvider).not.toHaveAttribute('aria-hidden');

      res.rerender(
        <div id="alternateContainer" data-testid="alternate-container">
          <Example showModal container={document.getElementById('alternateContainer')}>
            <div id="nestedContainer" />
          </Example>
        </div>
      );

      let modalProvider = res.getByTestId('modal-provider');

      expect(rootProvider).toHaveAttribute('aria-hidden', 'true');
      expect(modalProvider).not.toHaveAttribute('aria-hidden');
      expect(() =>
        res.rerender(
          <div id="alternateContainer" data-testid="alternate-container">
            <Example showModal container={document.getElementById('alternateContainer')}>
              <div id="nestedContainer" />
              <Modal
                container={document.getElementById('nestedContainer')}
                providerId="inner-modal-provider"
                modalId="inner-modal">
                Inner
              </Modal>
            </Example>
          </div>
        )
      ).toThrow();
      expect.extend({
        toHaveBeenNthCalledWithError(received, index, arg) {
          return {
            pass: received.mock.calls[index - 1][0].toString().includes(arg),
            message: () => `expected ${received.mock.calls[0][0]} to include ${arg}`
          };
        }
      });
      expect(console.error).toHaveBeenNthCalledWithError(
        1,
          'An OverlayContainer must not be inside another container. Please change the portalContainer prop.'
      );
    });
  });
});
