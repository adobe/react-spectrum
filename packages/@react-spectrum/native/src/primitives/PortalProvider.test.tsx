import React from 'react';
import {act, create} from 'react-test-renderer';
import {Text} from './Text';
import {PortalProvider, usePortal} from './PortalProvider';

describe('PortalProvider', () => {
  it('renders children', () => {
    let renderer: any;
    act(() => {
      renderer = create(
        <PortalProvider>
          <Text testID="child">Hello</Text>
        </PortalProvider>
      );
    });
    let child = renderer.root.findAll(
      (n: any) => typeof n.type === 'string' && n.props.testID === 'child'
    )[0];
    expect(child).toBeDefined();
  });

  it('exposes mount/unmount via usePortal', () => {
    let portal: ReturnType<typeof usePortal> = null;
    function Capture() {
      portal = usePortal();
      return null;
    }
    act(() => {
      create(
        <PortalProvider>
          <Capture />
        </PortalProvider>
      );
    });
    expect(typeof portal!.mount).toBe('function');
    expect(typeof portal!.unmount).toBe('function');
  });

  it('mounts and renders portal content', () => {
    let portal: ReturnType<typeof usePortal> = null;
    function Capture() {
      portal = usePortal();
      return null;
    }
    let renderer: any;
    act(() => {
      renderer = create(
        <PortalProvider>
          <Capture />
        </PortalProvider>
      );
    });
    act(() => {
      portal!.mount('test-key', <Text testID="portal-content">Mounted</Text>);
    });
    let content = renderer.root.findAll(
      (n: any) => typeof n.type === 'string' && n.props.testID === 'portal-content'
    )[0];
    expect(content).toBeDefined();
  });

  it('unmounts portal content', () => {
    let portal: ReturnType<typeof usePortal> = null;
    function Capture() {
      portal = usePortal();
      return null;
    }
    let renderer: any;
    act(() => {
      renderer = create(
        <PortalProvider>
          <Capture />
        </PortalProvider>
      );
    });
    act(() => {
      portal!.mount('k', <Text testID="rm">Bye</Text>);
    });
    act(() => {
      portal!.unmount('k');
    });
    let content = renderer.root.findAll(
      (n: any) => typeof n.type === 'string' && n.props.testID === 'rm'
    );
    expect(content.length).toBe(0);
  });
});
