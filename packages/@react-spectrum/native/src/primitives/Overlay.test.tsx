import React from 'react';
import {act, create} from 'react-test-renderer';
import {Provider} from '../provider/Provider';
import {defaultTheme} from '../theme';
import {Overlay} from './Overlay';
import {Text} from './Text';

function render(ui: React.ReactElement) {
  let renderer: any;
  act(() => {
    renderer = create(<Provider theme={defaultTheme}>{ui}</Provider>);
  });
  return renderer;
}

function findHost(renderer: any) {
  return renderer.root.findAll(
    (n: any) =>
      typeof n.type === 'string' &&
      typeof n.props.className === 'string' &&
      n.props.className.includes('absolute')
  )[0];
}

describe('Overlay', () => {
  it('renders children', () => {
    let r = render(
      <Overlay>
        <Text testID="child">Content</Text>
      </Overlay>
    );
    let child = r.root.findAll(
      (n: any) => typeof n.type === 'string' && n.props.testID === 'child'
    )[0];
    expect(child).toBeDefined();
  });

  it('has absolute positioning class', () => {
    let r = render(<Overlay />);
    expect(findHost(r).props.className).toContain('absolute');
  });

  it('defaults pointerEvents to box-none', () => {
    let r = render(<Overlay />);
    expect(findHost(r).props.pointerEvents).toBe('box-none');
  });

  it('sets accessibilityViewIsModal', () => {
    let r = render(<Overlay accessibilityViewIsModal />);
    expect(findHost(r).props.accessibilityViewIsModal).toBe(true);
  });

  it('overrides pointerEvents', () => {
    let r = render(<Overlay pointerEvents="auto" />);
    expect(findHost(r).props.pointerEvents).toBe('auto');
  });
});
