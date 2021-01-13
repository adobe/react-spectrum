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
import {render} from '@testing-library/react';

function ModalDOM(props) {
  let {modalProps} = useModal();
  return <div data-testid={props.modalId || 'modal'} {...modalProps}>{props.children}</div>;
}

function Modal(props) {
  return (
    <OverlayContainer data-testid={props.providerId || 'modal-provider'}>
      <ModalDOM modalId={props.modalId}>{props.children}</ModalDOM>
    </OverlayContainer>
  );
}

function Example(props) {
  return (
    <OverlayProvider data-testid="root-provider">
      This is the root provider.
      {props.showModal &&
        <Modal>{props.children}</Modal>
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
});
