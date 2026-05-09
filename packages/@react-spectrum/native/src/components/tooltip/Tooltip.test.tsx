import React from 'react';
import {act} from 'react-test-renderer';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {Text} from '../../primitives';
import {Tooltip} from './Tooltip';

describe('Tooltip', () => {
  it('opens on long press, closes on press out', () => {
    let {root} = renderWithProvider(
      <Tooltip testID="trigger" tip="Help">
        <Text>Info</Text>
      </Tooltip>
    );
    let trigger = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).testID === 'trigger'
    )[0];

    let isPopoverOpen = () => {
      let modal = root.findAll(
        n =>
          typeof n.type === 'string' &&
          (n.type === 'Modal' || n.type === 'RNModal') &&
          (n.props as any).visible === true
      );
      return modal.length > 0;
    };

    expect(isPopoverOpen()).toBe(false);
    act(() => {
      trigger.props.onLongPress({});
    });
    expect(isPopoverOpen()).toBe(true);
    act(() => {
      trigger.props.onPressOut({});
    });
    expect(isPopoverOpen()).toBe(false);
  });
});
