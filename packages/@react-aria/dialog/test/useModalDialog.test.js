import {cleanup, render} from '@testing-library/react';
import {ModalProvider, useModalDialog, useModalProvider} from '../';
import React from 'react';
import ReactDOM from 'react-dom';

function ProviderExample(props) {
  let {modalProviderProps} = useModalProvider();
  return <div {...modalProviderProps} data-testid={props['data-testid']}>{props.children}</div>;
}

function ModalDOM(props) {
  let {modalProps} = useModalDialog();
  return <div {...modalProps} data-testid={props.modalId || 'modal'}>{props.children}</div>;
}

function Portal(props) {
  return ReactDOM.createPortal(props.children, document.body);
}

function Modal(props) {
  return (
    <Portal>
      <ModalProvider>
        <ProviderExample data-testid={props.providerId || 'modal-provider'}>
          <ModalDOM modalId={props.modalId}>{props.children}</ModalDOM>
        </ProviderExample>
      </ModalProvider>
    </Portal>
  );
}

function Example(props) {
  return (
    <ModalProvider>
      <ProviderExample data-testid="root-provider">
        This is the root provider.
        {props.showModal &&
          <Modal>{props.children}</Modal>
        }
      </ProviderExample>
    </ModalProvider>
  );
}

describe('useModalDialog', function () {
  afterEach(cleanup);

  it('should set aria-hidden on parent providers on mount and remove on unmount', function () {
    let res = render(<Example />);
    let rootProvider = res.getByTestId('root-provider');

    expect(rootProvider).not.toHaveAttribute('aria-hidden');

    res.rerender(<Example showModal />);

    let modalProvider = res.getByTestId('modal-provider');
    let modal = res.getByTestId('modal');

    expect(rootProvider).toHaveAttribute('aria-hidden', 'true');
    expect(modalProvider).not.toHaveAttribute('aria-hidden');
    expect(modal).toHaveAttribute('aria-modal', 'true');

    res.rerender(<Example />);
    expect(rootProvider).not.toHaveAttribute('aria-hidden');
  });

  it('should work with nested modals', function () {
    let res = render(<Example />);
    let rootProvider = res.getByTestId('root-provider');

    expect(rootProvider).not.toHaveAttribute('aria-hidden');

    res.rerender(<Example showModal />);

    let modalProvider = res.getByTestId('modal-provider');
    let modal = res.getByTestId('modal');

    expect(rootProvider).toHaveAttribute('aria-hidden', 'true');
    expect(modalProvider).not.toHaveAttribute('aria-hidden');
    expect(modal).toHaveAttribute('aria-modal', 'true');

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
