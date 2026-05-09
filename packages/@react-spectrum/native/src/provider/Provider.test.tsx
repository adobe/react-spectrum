import React from 'react';
import {act, create} from 'react-test-renderer';
import {darkTheme, defaultTheme, lightTheme} from '../theme';
import {Provider, useProvider, useProviderProps} from './Provider';

function readContext() {
  let captured: ReturnType<typeof useProvider> | null = null;
  function Capture() {
    captured = useProvider();
    return null;
  }
  act(() => {
    create(
      <Provider colorScheme="light" scale="medium" theme={defaultTheme}>
        <Capture />
      </Provider>
    );
  });
  return captured!;
}

describe('Provider', () => {
  it('exposes colorScheme via context', () => {
    let ctx = readContext();
    expect(ctx.colorScheme).toBe('light');
  });

  it('exposes scale via context', () => {
    let ctx = readContext();
    expect(ctx.scale).toBe('medium');
  });

  it('exposes theme via context', () => {
    let ctx = readContext();
    expect(ctx.theme).toBe(defaultTheme);
  });

  it('nested provider overrides colorScheme', () => {
    let captured: ReturnType<typeof useProvider> | null = null;
    function Capture() {
      captured = useProvider();
      return null;
    }
    act(() => {
      create(
        <Provider colorScheme="light" theme={lightTheme}>
          <Provider colorScheme="dark" theme={darkTheme}>
            <Capture />
          </Provider>
        </Provider>
      );
    });
    expect(captured!.colorScheme).toBe('dark');
    expect(captured!.theme).toBe(darkTheme);
  });

  it('propagates isDisabled to children via useProviderProps', () => {
    let merged: {isDisabled?: boolean} | null = null;
    function Capture() {
      merged = useProviderProps({});
      return null;
    }
    act(() => {
      create(
        <Provider isDisabled theme={defaultTheme}>
          <Capture />
        </Provider>
      );
    });
    expect(merged!.isDisabled).toBe(true);
  });

  it('useProviderProps: child prop takes precedence over provider', () => {
    let merged: {isRequired?: boolean} | null = null;
    function Capture() {
      merged = useProviderProps({isRequired: false});
      return null;
    }
    act(() => {
      create(
        <Provider isRequired theme={defaultTheme}>
          <Capture />
        </Provider>
      );
    });
    expect(merged!.isRequired).toBe(false);
  });
});
