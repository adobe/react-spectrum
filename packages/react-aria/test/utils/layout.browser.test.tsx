/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {BoxChangeEvent, DOMAnchorBox, DOMBox, DOMResizableBox} from '../../src/utils/layout';
import {commands, server} from 'vitest/browser';
import {createPortal} from 'react-dom';
import {describe, expect, it, vi} from 'vitest';
import {Key, Model, Precision} from '@react-types/shared';
import React, {
  createContext,
  createRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import {render} from 'vitest-browser-react';
import {shadowDOM} from 'react-stately/private/flags/flags';
import {SyntheticEventTarget} from '../../src/utils/events';
import {TestContainer} from '@react-aria/test-utils';
import {useId} from '../../src/utils/useId';
import {useLayoutEffect} from '../../src/utils/useLayoutEffect';
import {useObjectRef} from '../../src/utils/useObjectRef';

vi.mock('react-stately/private/flags/flags', () => ({
  shadowDOM: vi.fn(() => false),
  enableShadowDOM: vi.fn(),
  tableNestedRows: vi.fn(() => false),
  enableTableNestedRows: vi.fn()
}));

declare module 'vitest/browser' {
  interface BrowserCommands {
    pinchZoom: (scale: number) => Promise<void>;
  }
}

export const STYLESHEET = Object.freeze(`
  .container { width: 100px; height: 100px; }
  .content { width: 100%; height: 100%; min-width: 1px; min-height: 1px; }

  .box { margin: 10px; border: 5px solid; padding: 20px; }
  .box-fractional { margin: 10.5px; border: 5.5px solid; padding: 20.5px; }

  .scroll-y { height: 300vh; }
  .scroll-x { width: 300vw; }

  .display-none { display: none; }
  .flow-root { display: flow-root; }

  .overflow-scroll { overflow: scroll; }
  .overflow-auto { overflow: auto; }

  .gutter-stable { scrollbar-gutter: stable; }
  .gutter-both-edges { scrollbar-gutter: stable both-edges; }

  .scale { transform: scale(2); }
  .scale-origin { transform: scale(2); transform-origin: 0 0; }
  .translate { transform: translate(10px, 20px); }

  .anchor { anchor-name: --anchor; }
`);

interface ShadowRootProps extends React.PropsWithChildren {
  mode: ShadowRootMode;
  className?: string;
}

interface DocumentProps extends React.PropsWithChildren {
  doctype: string;
  width?: number;
  height?: number;
  zoom?: number;
}

interface BoxOptions {
  model?: Model;
  transform?: boolean;
  precision?: Precision;
}

class TestBench extends TestContainer {
  constructor(type: string, key: Key) {
    super(type);

    let window = this.getWindow();
    let iframe = this.getRootNode();
    let document = this.getDocument();

    iframe.dataset.testId = String(key);

    let sheet = new window.CSSStyleSheet();
    sheet.replaceSync(STYLESHEET.trim());

    document.adoptedStyleSheets.push(sheet);

    this.reset();
  }

  public override reset(): void {
    let document = this.getDocument();

    super.reset();

    if (parseInt(React.version, 10) < 19) {
      document.documentElement.remove();
    }
  }
}

const ShadowRootContext = createContext<ShadowRoot | null>(null);

const ShadowRoot = forwardRef<HTMLDivElement, ShadowRootProps>((props, forwardedRef) => {
  let ref = useObjectRef(forwardedRef);
  let [root, setRoot] = useState<ShadowRoot | null>(null);

  useLayoutEffect(() => {
    let host = ref.current!;

    let root = host.attachShadow({mode: props.mode});
    let styles = host.ownerDocument.adoptedStyleSheets;

    root.adoptedStyleSheets.push(...styles);
    setRoot(root);
  }, [ref, props.mode]);

  return (
    <div className={props.className} ref={ref}>
      <ShadowRootContext.Provider value={root} children={props.children} />
    </div>
  );
});

const Shadow = forwardRef<null, React.PropsWithChildren>((props, ref) => {
  let ctx = React.useContext(ShadowRootContext);

  useImperativeHandle(ref, () => null, []);

  if (ctx == null) return null;

  return createPortal(props.children, ctx);
});

const Document = forwardRef<Document, DocumentProps>((props, ref) => {
  let {width = 300, height = 300, zoom = 1} = props;

  let id = useId();

  let bench = useMemo(() => {
    return new TestBench(props.doctype, id);
  }, [props.doctype, id]);

  useImperativeHandle(ref, () => {
    return bench.getDocument();
  }, [bench]);

  useLayoutEffect(() => {
    let iframe = bench.getRootNode();
    iframe.width = String(width);
    iframe.height = String(height);
    iframe.style.zoom = String(zoom);

    return () => bench.remove();
  }, [width, height, zoom, bench]);

  // @ts-expect-error
  return createPortal(props.children, bench.getDocument());
});

function waitForBoxChange(
  box: SyntheticEventTarget<BoxChangeEvent>
): Promise<BoxChangeEvent | null> {
  let resolver = Promise.withResolvers<BoxChangeEvent | null>();
  let signal = AbortSignal.timeout(100);

  function onChange(event: BoxChangeEvent) {
    box.removeEventListener('react-aria-boxchange', onChange);
    setTimeout(resolver.resolve, 0, event);
  }

  function onAbort() {
    box.removeEventListener('react-aria-boxchange', onChange);
    resolver.resolve(null);
  }

  signal.addEventListener('abort', onAbort);
  box.addEventListener('react-aria-boxchange', onChange);

  return resolver.promise;
}

function getNativeViewportRect(document: Document, options: BoxOptions = {}): DOMRect {
  let {model = 'border-box', precision = 'sub-pixel'} = options;

  let rect = new DOMRect();

  let ownerWindow = document.defaultView!;
  let visualViewport = ownerWindow.visualViewport;

  let sentinel = document.createElement('div');
  sentinel.style.all = 'initial';
  sentinel.style.display = 'block';
  sentinel.style.position = 'fixed';
  sentinel.style.inset = '0';
  document.documentElement.append(sentinel);

  try {
    rect = DOMRect.fromRect(sentinel.getBoundingClientRect());
  } finally {
    sentinel.remove();
  }

  if (model === 'padding-box' && visualViewport != null) {
    let left = Math.max(rect.left, visualViewport.offsetLeft);
    let top = Math.max(rect.top, visualViewport.offsetTop);
    let right = Math.min(rect.right, visualViewport.offsetLeft + visualViewport.width);
    let bottom = Math.min(rect.bottom, visualViewport.offsetTop + visualViewport.height);

    rect = new DOMRect(left, top, right - left, bottom - top);
  }

  if (precision === 'pixel') {
    return new DOMRect(
      Math.round(rect.x),
      Math.round(rect.y),
      Math.round(rect.width),
      Math.round(rect.height)
    );
  }

  if (precision === 'device-pixel') {
    return new DOMRect(
      rect.x * (ownerWindow.devicePixelRatio || 1),
      rect.y * (ownerWindow.devicePixelRatio || 1),
      rect.width * (ownerWindow.devicePixelRatio || 1),
      rect.height * (ownerWindow.devicePixelRatio || 1)
    );
  }

  return rect;
}

function getNativeBoundingRect(element: HTMLElement, options: BoxOptions = {}): DOMRect {
  let {model = 'border-box', precision = 'sub-pixel', transform = true} = options;

  let rect = new DOMRect();

  let ownerWindow = element.ownerDocument.defaultView!;
  let ownerDocument = element.ownerDocument;

  let sentinel = ownerDocument.createElement('div');
  sentinel.style.all = 'initial';
  sentinel.style.display = 'block';

  try {
    if (!transform) {
      element.style.setProperty('transform', 'none', 'important');
    }

    if (model === 'padding-box') {
      element.style.setProperty('position', 'relative');
      sentinel.style.position = 'absolute';
      sentinel.style.inset = '0';
      element.append(sentinel);
    } else if (model === 'content-box') {
      sentinel.style.width = '100%';
      sentinel.style.height = '100%';
      element.prepend(sentinel);
    } else if (model === 'margin-box') {
      sentinel.style.display = 'grid';
      sentinel.style.width = 'max-content';
      element.replaceWith(sentinel);
      sentinel.append(element);
    }

    if (model === 'border-box') {
      rect = DOMRect.fromRect(element.getBoundingClientRect());
    } else {
      rect = DOMRect.fromRect(sentinel.getBoundingClientRect());
    }
  } finally {
    sentinel.replaceWith(...sentinel.childNodes);
    element.style.removeProperty('position');
    element.style.removeProperty('transform');
  }

  if (precision === 'pixel') {
    return new DOMRect(
      Math.round(rect.x),
      Math.round(rect.y),
      Math.round(rect.width),
      Math.round(rect.height)
    );
  }

  if (precision === 'device-pixel') {
    return new DOMRect(
      rect.x * (ownerWindow.devicePixelRatio || 1),
      rect.y * (ownerWindow.devicePixelRatio || 1),
      rect.width * (ownerWindow.devicePixelRatio || 1),
      rect.height * (ownerWindow.devicePixelRatio || 1)
    );
  }

  return rect;
}

function supportsCDP(): boolean {
  return server.browser === 'chromium';
}

function supportsAnchorPositioning(): boolean {
  return CSS.supports('top: anchor(--react-aria top)');
}

function supportsAnchorTransforms(): boolean {
  let sentinel = document.createElement('div');
  sentinel.style.position = 'absolute';
  sentinel.style.top = '0';
  sentinel.style.left = '0';
  sentinel.style.width = '10px';
  sentinel.style.height = '10px';
  sentinel.style.transform = 'translate(100px, 0)';
  sentinel.style.anchorName = '--react-aria-sentinel';

  let target = document.createElement('div');
  target.style.position = 'fixed';
  target.style.left = 'anchor(--react-aria-sentinel left)';
  target.style.top = '0';
  target.style.width = '10px';
  target.style.height = '10px';

  document.body.append(sentinel, target);

  try {
    let sentinelRect = sentinel.getBoundingClientRect();
    let targetRect = target.getBoundingClientRect();

    return Math.abs(targetRect.left - sentinelRect.left) < 0.01;
  } finally {
    sentinel.remove();
    target.remove();
  }
}

function supportsScrollbarGutters(): boolean {
  let sentinel = document.createElement('div');
  sentinel.style.position = 'absolute';
  sentinel.style.width = '100px';
  sentinel.style.height = '100px';
  sentinel.style.overflow = 'scroll';
  document.body.append(sentinel);

  try {
    return sentinel.offsetWidth > sentinel.clientWidth;
  } finally {
    sentinel.remove();
  }
}

describe('DOMBox', () => {
  describe('supports element box models', () => {
    it('should return the border-box for border-box model', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {model: 'border-box'});
      let actual = new DOMBox(ref.current!, {model: 'border-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should return the border-box for the root', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="container box" ref={ref}>
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {model: 'border-box'});
      let actual = new DOMBox(ref.current!, {model: 'border-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should return the padding-box for padding-box model', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {model: 'padding-box'});
      let actual = new DOMBox(ref.current!, {model: 'padding-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should return the padding-box for the root', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="container box" ref={ref}>
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {model: 'padding-box'});
      let actual = new DOMBox(ref.current!, {model: 'padding-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should return the content-box for content-box model', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {model: 'content-box'});
      let actual = new DOMBox(ref.current!, {model: 'content-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should return the content-box for the root', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="container box" ref={ref}>
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {model: 'content-box'});
      let actual = new DOMBox(ref.current!, {model: 'content-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should return the margin-box for margin-box model', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body className="flow-root">
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {model: 'margin-box'});
      let actual = new DOMBox(ref.current!, {model: 'margin-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should return an empty rect for an unrendered element', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box display-none" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = new DOMRect();
      let actual = new DOMBox(ref.current!);

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });
  });

  describe('supports document box models', () => {
    it('should return the border-box for border-box model', async () => {
      let ref = createRef<Document>();

      await render(
        <Document doctype="html" ref={ref}>
          <html lang="en-US">
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = getNativeViewportRect(ref.current!);
      let actual = new DOMBox(ref.current!, {model: 'border-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should return the padding-box for padding-box model', async () => {
      let ref = createRef<Document>();

      await render(
        <Document doctype="html" ref={ref}>
          <html lang="en-US">
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = getNativeViewportRect(ref.current!);
      let actual = new DOMBox(ref.current!, {model: 'padding-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should return the viewport size for an unrendered root', async () => {
      let ref = createRef<Document>();

      await render(
        <Document doctype="html" ref={ref}>
          <html lang="en-US" className="display-none">
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let ownerWindow = ref.current!.defaultView!;

      let expected = new DOMRect(0, 0, ownerWindow.innerWidth, ownerWindow.innerHeight);
      let actual = new DOMBox(ref.current!);

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });
  });

  describe('supports pixel precisions', () => {
    it('should return the rounded element rect for pixel precision', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box-fractional" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let unrounded = getNativeBoundingRect(ref.current!, {precision: 'sub-pixel'});
      let expected = getNativeBoundingRect(ref.current!, {precision: 'pixel'});
      let actual = new DOMBox(ref.current!, {precision: 'pixel'});

      expect(unrounded.x).not.toBe(expected.x);
      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should return the rounded document rect for pixel precision', async () => {
      let ref = createRef<Document>();

      await render(
        <Document doctype="html" width={300.5} height={300.5} zoom={1.1} ref={ref}>
          <html lang="en-US">
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );
      let unrounded = getNativeViewportRect(ref.current!, {precision: 'sub-pixel'});
      let expected = getNativeViewportRect(ref.current!, {precision: 'pixel'});
      let actual = new DOMBox(ref.current!, {precision: 'pixel'});

      if (server.browser !== 'webkit') {
        expect(unrounded.width).not.toBe(expected.width);
        expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
      }
    });

    it('should return the scaled element rect for device-pixel precision', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      try {
        Object.defineProperty(ref.current!.ownerDocument.defaultView!, 'devicePixelRatio', {
          value: 2,
          configurable: true
        });

        let unrounded = getNativeBoundingRect(ref.current!, {precision: 'sub-pixel'});
        let expected = getNativeBoundingRect(ref.current!, {precision: 'device-pixel'});
        let actual = new DOMBox(ref.current!, {precision: 'device-pixel'});

        expect(unrounded.x).not.toBe(expected.x);
        expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
      } finally {
        Object.defineProperty(ref.current!.ownerDocument.defaultView!, 'devicePixelRatio', {
          value: 1,
          configurable: true
        });
      }
    });

    it('should return the scaled document rect for device-pixel precision', async () => {
      let ref = createRef<Document>();

      await render(
        <Document doctype="html" ref={ref}>
          <html lang="en-US">
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      try {
        Object.defineProperty(ref.current!.defaultView!, 'devicePixelRatio', {
          value: 2,
          configurable: true
        });

        let unscaled = getNativeViewportRect(ref.current!, {precision: 'sub-pixel'});
        let expected = getNativeViewportRect(ref.current!, {precision: 'device-pixel'});
        let actual = new DOMBox(ref.current!, {precision: 'device-pixel'});

        expect(unscaled.width).not.toBe(expected.width);
        expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
      } finally {
        Object.defineProperty(ref.current!.defaultView!, 'devicePixelRatio', {
          value: 1,
          configurable: true
        });
      }
    });
  });

  describe('supports transform removal', () => {
    it('should return the transformed border-box for border-box model', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box scale" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {model: 'border-box'});
      let actual = new DOMBox(ref.current!, {model: 'border-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should return the transformed padding-box for padding-box model', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box scale" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {model: 'padding-box'});
      let actual = new DOMBox(ref.current!, {model: 'padding-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should return the transformed content-box for content-box model', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box scale" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {model: 'content-box'});
      let actual = new DOMBox(ref.current!, {model: 'content-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should return the transformed margin-box for margin-box model', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="flow-root scale">
                <div className="container box" ref={ref}>
                  <div className="content" />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {model: 'margin-box'});
      let actual = new DOMBox(ref.current!, {model: 'margin-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should return the transformed content-box for an SVG element', async () => {
      let ref = createRef<SVGSVGElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <svg className="container box scale" ref={ref}>
                <foreignObject width="100%" height="100%" />
              </svg>
            </body>
          </html>
        </Document>
      );

      let expected = DOMRect.fromRect(ref.current!.firstElementChild!.getBoundingClientRect());
      let actual = new DOMBox(ref.current!, {model: 'content-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should strip a transform for border-box model', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box scale" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let transformed = getNativeBoundingRect(ref.current!, {transform: true});
      let expected = getNativeBoundingRect(ref.current!, {transform: false});
      let actual = new DOMBox(ref.current!, {transform: false});

      expect(transformed.width).not.toBe(expected.width);
      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should strip a transform for padding-box model', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="scale">
                <div className="container box translate" ref={ref}>
                  <div className="content" />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let transformed = getNativeBoundingRect(ref.current!, {
        model: 'padding-box',
        transform: true
      });
      let expected = getNativeBoundingRect(ref.current!, {model: 'padding-box', transform: false});
      let actual = new DOMBox(ref.current!, {model: 'padding-box', transform: false});

      expect(transformed.x).not.toBe(expected.x);
      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should strip a transform with an origin', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box scale-origin" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let transformed = getNativeBoundingRect(ref.current!, {transform: true});
      let expected = getNativeBoundingRect(ref.current!, {transform: false});
      let actual = new DOMBox(ref.current!, {transform: false});

      expect(transformed.width).not.toBe(expected.width);
      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should strip a translate transform', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box translate" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let transformed = getNativeBoundingRect(ref.current!, {transform: true});
      let expected = getNativeBoundingRect(ref.current!, {transform: false});
      let actual = new DOMBox(ref.current!, {transform: false});

      expect(transformed.x).not.toBe(expected.x);
      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should not strip an inherited transform', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="scale">
                <div className="container box translate" ref={ref}>
                  <div className="content" />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let transformed = getNativeBoundingRect(ref.current!, {transform: true});
      let expected = getNativeBoundingRect(ref.current!, {transform: false});
      let actual = new DOMBox(ref.current!, {transform: false});

      expect(transformed.x).not.toBe(expected.x);
      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });
  });

  describe('supports shadow DOM (disabled)', () => {
    beforeAll(() => vi.mocked(shadowDOM).mockReturnValue(false));

    it('should strip an inherited transform of a shadow host', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <ShadowRoot mode="open" className="scale">
                <Shadow>
                  <div className="container box translate" ref={ref}>
                    <div className="content" />
                  </div>
                </Shadow>
              </ShadowRoot>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {transform: false});
      let actual = new DOMBox(ref.current!, {transform: false});

      expect(actual.boundingRect.width).toBe(expected.width / 2);
      expect(actual.boundingRect.toJSON()).not.toEqual(expected.toJSON());
    });
  });

  describe('supports shadow DOM (enabled)', () => {
    beforeAll(() => vi.mocked(shadowDOM).mockReturnValue(true));
    afterAll(() => vi.mocked(shadowDOM).mockReturnValue(false));

    it('should not strip an inherited transform of a shadow host', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <ShadowRoot mode="open" className="scale">
                <Shadow>
                  <div className="container box translate" ref={ref}>
                    <div className="content" />
                  </div>
                </Shadow>
              </ShadowRoot>
            </body>
          </html>
        </Document>
      );

      let transformed = getNativeBoundingRect(ref.current!, {transform: true});
      let expected = getNativeBoundingRect(ref.current!, {transform: false});
      let actual = new DOMBox(ref.current!, {transform: false});

      expect(transformed.x).not.toBe(expected.x);
      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });
  });

  describe.skipIf(!supportsCDP())('supports document pinch zoom', () => {
    beforeAll(async () => {
      await commands.pinchZoom(2);

      let viewport = getNativeViewportRect(window.top?.document!, {model: 'padding-box'});

      expect(viewport.width).toBeLessThan(window.top?.innerWidth!);
    });

    afterAll(async () => {
      await commands.pinchZoom(1);
    });

    it('should return the unpinched border-box for border-box model', async () => {
      let expected = getNativeViewportRect(window.top?.document!, {model: 'border-box'});
      let actual = new DOMBox(window.top?.document!, {model: 'border-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should return the pinched padding-box for padding-box model', async () => {
      let expected = getNativeViewportRect(window.top?.document!, {model: 'padding-box'});
      let actual = new DOMBox(window.top?.document!, {model: 'padding-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });
  });

  describe.skipIf(!supportsScrollbarGutters())('supports scrollbar gutters', () => {
    it('should exclude a scrollbar gutter', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box overflow-scroll" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {model: 'padding-box'});
      let actual = new DOMBox(ref.current!, {model: 'padding-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should exclude a rtl scrollbar gutter', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box overflow-scroll" dir="rtl" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {model: 'padding-box'});
      let actual = new DOMBox(ref.current!, {model: 'padding-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should exclude a stable scrollbar gutter', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box overflow-auto gutter-stable" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {model: 'padding-box'});
      let actual = new DOMBox(ref.current!, {model: 'padding-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should exclude a both-edges scrollbar gutter', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box overflow-auto gutter-both-edges" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {model: 'padding-box'});
      let actual = new DOMBox(ref.current!, {model: 'padding-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should not exclude the viewport scrollbar gutter for the root', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="box" ref={ref}>
            <body>
              <div className="content scroll-y" />
            </body>
          </html>
        </Document>
      );

      let ownerWindow = ref.current!.ownerDocument.defaultView!;
      let viewport = getNativeViewportRect(ref.current!.ownerDocument);

      expect(viewport.width).toBeLessThan(ownerWindow.innerWidth);

      let expected = getNativeBoundingRect(ref.current!, {model: 'padding-box'});
      let actual = new DOMBox(ref.current!, {model: 'padding-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should not exclude the viewport scrollbar gutter for the body', async () => {
      let ref = createRef<HTMLBodyElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body className="box overflow-scroll" ref={ref}>
              <div className="content scroll-y" />
            </body>
          </html>
        </Document>
      );

      let ownerWindow = ref.current!.ownerDocument.defaultView!;
      let viewport = getNativeViewportRect(ref.current!.ownerDocument);

      expect(viewport.width).toBeLessThan(ownerWindow.innerWidth);

      let expected = getNativeBoundingRect(ref.current!, {model: 'padding-box'});
      let actual = new DOMBox(ref.current!, {model: 'padding-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should exclude the viewport scrollbar gutter', async () => {
      let ref = createRef<Document>();

      await render(
        <Document doctype="html" ref={ref}>
          <html lang="en-US">
            <body>
              <div className="content scroll-y" />
            </body>
          </html>
        </Document>
      );

      let ownerWindow = ref.current!.defaultView!;
      let viewport = getNativeViewportRect(ref.current!);

      expect(viewport.width).toBeLessThan(ownerWindow.innerWidth);

      let expected = getNativeViewportRect(ref.current!);
      let actual = new DOMBox(ref.current!);

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should exclude a stable viewport scrollbar gutter', async () => {
      let ref = createRef<Document>();

      await render(
        <Document doctype="html" ref={ref}>
          <html lang="en-US" className="gutter-stable">
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let ownerWindow = ref.current!.defaultView!;
      let viewport = getNativeViewportRect(ref.current!);

      expect(viewport.width).toBeLessThan(ownerWindow.innerWidth);

      let expected = getNativeViewportRect(ref.current!);
      let actual = new DOMBox(ref.current!);

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should exclude a both-edges viewport scrollbar gutter', async () => {
      let ref = createRef<Document>();

      await render(
        <Document doctype="html" ref={ref}>
          <html lang="en-US" className="gutter-both-edges">
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let ownerWindow = ref.current!.defaultView!;
      let viewport = getNativeViewportRect(ref.current!);

      expect(viewport.width).toBeLessThan(ownerWindow.innerWidth);

      let expected = getNativeViewportRect(ref.current!);
      let actual = new DOMBox(ref.current!);

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should exclude a transformed scrollbar gutter', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box overflow-scroll scale" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeBoundingRect(ref.current!, {model: 'padding-box'});
      let actual = new DOMBox(ref.current!, {model: 'padding-box'});

      expect(actual.boundingRect.toJSON()).toEqual(expected.toJSON());
    });
  });
});

describe('DOMResizableBox', () => {
  describe('supports element resize events', () => {
    it('should dispatch a change event for border-box model', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let box = new DOMResizableBox(ref.current!, {model: 'border-box'});

      ref.current!.style.width = '200px';
      let event = await waitForBoxChange(box);

      let expected = getNativeBoundingRect(ref.current!, {model: 'border-box'});

      expect(event).not.toBeNull();
      expect(event!.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should dispatch a change event for content-box model', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let box = new DOMResizableBox(ref.current!, {model: 'content-box'});

      ref.current!.style.width = '200px';
      let event = await waitForBoxChange(box);

      let expected = getNativeBoundingRect(ref.current!, {model: 'content-box'});

      expect(event).not.toBeNull();
      expect(event!.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should dispatch a change event on every resize', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let box = new DOMResizableBox(ref.current!);

      ref.current!.style.width = '200px';
      let first = await waitForBoxChange(box);

      ref.current!.style.width = '300px';
      let second = await waitForBoxChange(box);

      let expected = getNativeBoundingRect(ref.current!);

      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect(second!.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should not dispatch a change event on connect', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let box = new DOMResizableBox(ref.current!);

      let event = await waitForBoxChange(box);

      expect(event).toBeNull();
    });

    it('should not dispatch a change event when not resized', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      ref.current!.style.width = '100px';

      let box = new DOMResizableBox(ref.current!);

      ref.current!.style.width = '200px';
      ref.current!.style.width = '100px';
      let event = await waitForBoxChange(box);

      expect(event).toBeNull();
    });
  });

  describe('supports document resize events', () => {
    it('should dispatch a change event for border-box model', async () => {
      let ref = createRef<Document>();

      await render(
        <Document doctype="html" ref={ref}>
          <html lang="en-US">
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let box = new DOMResizableBox(ref.current!, {model: 'border-box'});

      ref.current!.defaultView!.frameElement!.setAttribute('width', '400');

      let event = await waitForBoxChange(box);
      let expected = getNativeViewportRect(ref.current!);

      expect(event).not.toBeNull();
      expect(event!.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should dispatch a change event on every resize', async () => {
      let ref = createRef<Document>();

      await render(
        <Document doctype="html" ref={ref}>
          <html lang="en-US">
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let iframe = ref.current?.defaultView?.frameElement!;

      let box = new DOMResizableBox(ref.current!);

      iframe.setAttribute('width', '400');
      let first = await waitForBoxChange(box);

      iframe.setAttribute('width', '500');
      let second = await waitForBoxChange(box);

      let expected = getNativeViewportRect(ref.current!);

      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect(second!.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should not dispatch a change event on connect', async () => {
      let ref = createRef<Document>();

      await render(
        <Document doctype="html" ref={ref}>
          <html lang="en-US">
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let box = new DOMResizableBox(ref.current!);
      let event = await waitForBoxChange(box);

      expect(event).toBeNull();
    });

    it('should not dispatch a change event when not resized', async () => {
      let ref = createRef<Document>();

      await render(
        <Document doctype="html" ref={ref}>
          <html lang="en-US">
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let frameElement = ref.current!.defaultView!.frameElement!;

      frameElement.setAttribute('width', '300');

      let box = new DOMResizableBox(ref.current!);

      frameElement.setAttribute('width', '400');
      frameElement.setAttribute('width', '300');
      let event = await waitForBoxChange(box);

      expect(event).toBeNull();
    });
  });

  describe('supports event details', () => {
    it('should have the resolved box options', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let box = new DOMResizableBox(ref.current!, {precision: 'pixel', transform: false});

      ref.current!.style.width = '200px';
      let event = await waitForBoxChange(box);

      expect(event).not.toBeNull();
      expect(event!.type).toBe('react-aria-boxchange');
      expect(event!.target).toBe(box);
      expect(event!.detail).toEqual({model: 'border-box', precision: 'pixel', transform: false});
    });
  });
});

describe.skipIf(!supportsAnchorPositioning())('DOMAnchorBox', () => {
  describe('supports element position events', () => {
    it('should dispatch a change event on resize', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let box = new DOMAnchorBox(ref.current!);

      ref.current!.style.width = '200px';
      let event = await waitForBoxChange(box);

      let expected = getNativeBoundingRect(ref.current!);

      expect(event).not.toBeNull();
      expect(event!.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should dispatch a change event on move', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let box = new DOMAnchorBox(ref.current!);

      ref.current!.style.marginLeft = '50px';
      let event = await waitForBoxChange(box);

      let expected = getNativeBoundingRect(ref.current!);

      expect(event).not.toBeNull();
      expect(event!.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should dispatch a change event on scroll', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto" ref={scrollRef}>
                <div className="content scroll-y" />
                <div className="container box" ref={ref}>
                  <div className="content" />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let box = new DOMAnchorBox(ref.current!);

      function onChange() {}

      box.addEventListener('react-aria-boxchange', onChange);
      await waitForBoxChange(box);

      scrollRef.current!.scrollTop = 50;
      let event = await waitForBoxChange(box);

      box.removeEventListener('react-aria-boxchange', onChange);

      let expected = getNativeBoundingRect(ref.current!);

      expect(event).not.toBeNull();
      expect(event!.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should dispatch a change event on every move', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let box = new DOMAnchorBox(ref.current!);

      ref.current!.style.marginLeft = '50px';
      let first = await waitForBoxChange(box);

      ref.current!.style.marginLeft = '100px';
      let second = await waitForBoxChange(box);

      let expected = getNativeBoundingRect(ref.current!);

      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect(second!.boundingRect.toJSON()).toEqual(expected.toJSON());
    });

    it('should not dispatch a change event on connect', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let box = new DOMAnchorBox(ref.current!);
      let event = await waitForBoxChange(box);

      expect(event).toBeNull();
    });

    it('should not disconnect an existing anchor', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box anchor" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let box = new DOMAnchorBox(ref.current!);
      let ownerWindow = ref.current!.ownerDocument.defaultView!;

      let style = ownerWindow.getComputedStyle(ref.current!);
      let anchorName = style.getPropertyValue('anchor-name');

      function onChange() {}

      box.addEventListener('react-aria-boxchange', onChange);

      let connectedAnchorName = style.getPropertyValue('anchor-name');

      box.removeEventListener('react-aria-boxchange', onChange);

      let disconnectedAnchorName = style.getPropertyValue('anchor-name');

      expect(anchorName).toBe('--anchor');
      expect(connectedAnchorName).toMatch(/^--anchor, --react-aria-anchor-\d+$/);
      expect(disconnectedAnchorName).toBe(anchorName);
    });
  });

  describe('supports event details', () => {
    it('should have the resolved box options', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let box = new DOMAnchorBox(ref.current!, {precision: 'pixel', transform: false});

      ref.current!.style.marginLeft = '50px';
      let event = await waitForBoxChange(box);

      expect(event).not.toBeNull();
      expect(event!.type).toBe('react-aria-boxchange');
      expect(event!.target).toBe(box);
      expect(event!.detail).toEqual({model: 'border-box', precision: 'pixel', transform: false});
    });
  });

  describe('supports resource management', () => {
    it('should share a sentinel when targeting the same element', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let ownerDocument = ref.current?.ownerDocument!;

      let first = new DOMAnchorBox(ref.current!);
      let second = new DOMAnchorBox(ref.current!);

      function onChange() {}

      first.addEventListener('react-aria-boxchange', onChange);
      second.addEventListener('react-aria-boxchange', onChange);

      expect(ownerDocument.querySelectorAll('[id^="react-aria-anchor-"]')).toHaveLength(1);

      first.removeEventListener('react-aria-boxchange', onChange);

      ref.current!.style.marginLeft = '50px';
      let event = await waitForBoxChange(second);

      expect(event).not.toBeNull();
      expect(ownerDocument.querySelectorAll('[id^="react-aria-anchor-"]')).toHaveLength(1);

      second.removeEventListener('react-aria-boxchange', onChange);

      expect(ownerDocument.querySelector('[id^="react-aria-anchor-"]')).toBeNull();
      expect(ref.current!.style.getPropertyValue('anchor-name')).toBe('');
    });
  });

  describe.skipIf(!supportsAnchorTransforms())('supports transforms', () => {
    it('should dispatch a change event on transform', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container box" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let box = new DOMAnchorBox(ref.current!);

      function onChange() {}

      box.addEventListener('react-aria-boxchange', onChange);
      await waitForBoxChange(box);

      ref.current!.classList.add('translate');
      let event = await waitForBoxChange(box);

      box.removeEventListener('react-aria-boxchange', onChange);

      let expected = getNativeBoundingRect(ref.current!);

      expect(event).not.toBeNull();
      expect(event!.boundingRect.toJSON()).toEqual(expected.toJSON());
    });
  });

  describe('supports shadow DOM (disabled)', () => {
    beforeAll(() => vi.mocked(shadowDOM).mockReturnValue(false));

    it('should not dispatch a change event on scroll', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <ShadowRoot mode="open">
                <Shadow>
                  <div className="container overflow-auto" ref={scrollRef}>
                    <div className="content scroll-y" />
                    <div className="container box" ref={ref}>
                      <div className="content" />
                    </div>
                  </div>
                </Shadow>
              </ShadowRoot>
            </body>
          </html>
        </Document>
      );

      let box = new DOMAnchorBox(ref.current!);

      function onChange() {}

      box.addEventListener('react-aria-boxchange', onChange);
      await waitForBoxChange(box);

      scrollRef.current!.scrollTop = 50;
      let event = await waitForBoxChange(box);

      box.removeEventListener('react-aria-boxchange', onChange);

      expect(event).toBeNull();
    });
  });

  describe('supports shadow DOM (enabled)', () => {
    beforeAll(() => vi.mocked(shadowDOM).mockReturnValue(true));
    afterAll(() => vi.mocked(shadowDOM).mockReturnValue(false));

    it('should dispatch a change event on scroll', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <ShadowRoot mode="open">
                <Shadow>
                  <div className="container overflow-auto" ref={scrollRef}>
                    <div className="content scroll-y" />
                    <div className="container box" ref={ref}>
                      <div className="content" />
                    </div>
                  </div>
                </Shadow>
              </ShadowRoot>
            </body>
          </html>
        </Document>
      );

      let box = new DOMAnchorBox(ref.current!);

      function onChange() {}

      box.addEventListener('react-aria-boxchange', onChange);
      await waitForBoxChange(box);

      scrollRef.current!.scrollTop = 50;
      let event = await waitForBoxChange(box);

      box.removeEventListener('react-aria-boxchange', onChange);

      let expected = getNativeBoundingRect(ref.current!);

      expect(event).not.toBeNull();
      expect(event!.boundingRect.toJSON()).toEqual(expected.toJSON());
    });
  });
});
