import {Button} from '@react-spectrum/button';
import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {ToastProvider, useToastProvider} from '../';
import {triggerPress} from '@react-spectrum/test-utils';

function RenderToastButton() {
  let toastContext = useToastProvider();

  return (
    <div>
      <Button
        onPress={() => toastContext.neutral('Toast is default', {})}
        variant="primary">
          Show Default Toast
      </Button>
    </div>
  );
}

function renderComponent(contents) {
  return render(<ToastProvider>
    {contents}
  </ToastProvider>);
}

describe('Toast', function () {
  afterEach(() => {
    cleanup();
  });

  it('Renders a button that triggers a toast via the provider', function () {
    let {queryAllByRole, getByRole} = renderComponent(<RenderToastButton />);
    let button = getByRole('button');

    expect(queryAllByRole('presentation').length).toBe(0);
    triggerPress(button);
    expect(queryAllByRole('presentation').length).toBe(1);
  });
});
