import React, {type ReactElement} from 'react';
import {act, create, type ReactTestInstance, type ReactTestRenderer} from 'react-test-renderer';
import {Provider} from '../provider/Provider';
import type {NativeProviderProps} from '../provider/types';
import {createMockProviderProps} from './index';

export interface RenderResult {
  root: ReactTestInstance;
  getByTestId(id: string): ReactTestInstance;
  queryByTestId(id: string): ReactTestInstance | null;
  getAllByType(type: string | React.ComponentType<any>): ReactTestInstance[];
  update(ui: ReactElement): void;
  unmount(): void;
  toJSON(): unknown;
}

export interface RenderWithProviderOptions {
  providerProps?: Partial<NativeProviderProps>;
}

function findHostsByTestId(root: ReactTestInstance, id: string): ReactTestInstance[] {
  return root.findAll(node => {
    if (typeof node.type !== 'string') {
      return false;
    }
    let testID = (node.props as {testID?: string} | null)?.testID;
    return testID === id;
  });
}

function wrap(ui: ReactElement, providerProps?: Partial<NativeProviderProps>) {
  let baseProps = createMockProviderProps();
  return (
    <Provider {...baseProps} {...providerProps}>
      {ui}
    </Provider>
  );
}

export function renderWithProvider(
  ui: ReactElement,
  {providerProps}: RenderWithProviderOptions = {}
): RenderResult {
  let renderer: ReactTestRenderer;
  act(() => {
    renderer = create(wrap(ui, providerProps), {
      createNodeMock: element => ({type: element.type, props: element.props})
    });
  });

  let getRoot = () => renderer.root;

  return {
    get root() {
      return getRoot();
    },
    getByTestId(id) {
      let match = findHostsByTestId(getRoot(), id);
      if (match.length === 0) {
        throw new Error(`No host element with testID="${id}"`);
      }
      return match[0];
    },
    queryByTestId(id) {
      let match = findHostsByTestId(getRoot(), id);
      return match[0] ?? null;
    },
    getAllByType(type) {
      return getRoot().findAllByType(type as any);
    },
    update(nextUi) {
      act(() => {
        renderer.update(wrap(nextUi, providerProps));
      });
    },
    unmount() {
      act(() => {
        renderer.unmount();
      });
    },
    toJSON() {
      return renderer.toJSON();
    }
  };
}

export function fireEvent(node: ReactTestInstance, eventName: string, ...args: unknown[]) {
  let handler = (node.props as Record<string, unknown>)[eventName];
  if (typeof handler !== 'function') {
    throw new Error(`No handler ${eventName} on node`);
  }
  let result: unknown;
  act(() => {
    result = (handler as (...a: unknown[]) => unknown)(...args);
  });
  return result;
}

fireEvent.press = (node: ReactTestInstance) =>
  fireEvent(node, 'onPress', {target: {}});
