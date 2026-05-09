import React from 'react';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {Flex} from './Flex';

describe('Flex', () => {
  it('renders children with flex class', () => {
    let {getByTestId} = renderWithProvider(
      <Flex testID="f">
        <></>
      </Flex>
    );
    expect(getByTestId('f').props.className).toContain('flex');
  });

  it('applies direction via style', () => {
    let {getByTestId} = renderWithProvider(<Flex direction="column" testID="f" />);
    let collected: Record<string, unknown> = {};
    let walk = (s: unknown) => {
      if (s == null) {
        return;
      }
      if (Array.isArray(s)) {
        s.forEach(walk);
      } else if (typeof s === 'object') {
        Object.assign(collected, s);
      }
    };
    walk(getByTestId('f').props.style);
    expect(collected.flexDirection).toBe('column');
  });
});
