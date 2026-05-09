import React from 'react';
import {act, create} from 'react-test-renderer';
import {FocusScope} from './FocusScope';
import {Text} from './Text';

describe('FocusScope', () => {
  it('renders children unchanged', () => {
    let renderer: any;
    act(() => {
      renderer = create(
        <FocusScope>
          <Text testID="child">Hello</Text>
        </FocusScope>
      );
    });
    let host = renderer.root.findAll(
      (n: any) => typeof n.type === 'string' && n.props.testID === 'child'
    )[0];
    expect(host).toBeDefined();
  });

  it('accepts autoFocus, contain, restoreFocus props without throwing', () => {
    expect(() => {
      act(() => {
        create(
          <FocusScope autoFocus contain restoreFocus>
            <Text>Item</Text>
          </FocusScope>
        );
      });
    }).not.toThrow();
  });
});
