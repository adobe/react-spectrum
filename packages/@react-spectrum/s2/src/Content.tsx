/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ForwardedRef, HTMLAttributes, ImgHTMLAttributes, createContext, forwardRef} from 'react';
import {Heading as RACHeading, HeadingProps, Header as RACHeader, useContextProps, Text as TextAria, Keyboard as KeyboardAria} from 'react-aria-components';
import {DOMRef} from '@react-types/shared';
import {useDOMRef} from '@react-spectrum/utils';

// TODO: export these types from RAC?
interface SlottedValue<T> {
  slots?: Record<string | symbol, T>
}

export type SlottedContextValue<T> = SlottedValue<T> | T | null | undefined;
export type ContextValue<T, E extends Element> = SlottedContextValue<WithRef<T, E>>;
export type WithRef<T, E> = T & {ref?: ForwardedRef<E>};

export const HeadingContext = createContext<ContextValue<HeadingProps, HTMLHeadingElement>>({});

// Wrapper around RAC Heading to unmount when hidden.
function Heading(props: HeadingProps, ref: ForwardedRef<HTMLHeadingElement>) {
  [props, ref] = useContextProps(props, ref, HeadingContext);
  if (props.hidden) {
    return null;
  }

  return <RACHeading {...props} ref={ref} />;
}

const _Heading = forwardRef(Heading);
export {_Heading as Heading};

export const HeaderContext = createContext<ContextValue<HTMLAttributes<HTMLElement>, HTMLElement>>({});

function Header(props: HTMLAttributes<HTMLElement>, ref: DOMRef) {
  let domRef = useDOMRef(ref);
  [props, domRef] = useContextProps(props, domRef, HeaderContext);
  if (props.hidden) {
    return null;
  }

  return <RACHeader {...props} ref={domRef} />;
}

const _Header = forwardRef(Header);
export {_Header as Header};

export const ContentContext = createContext<ContextValue<HTMLAttributes<HTMLElement>, HTMLDivElement>>({});

function Content(props: HTMLAttributes<HTMLElement>, ref: DOMRef<HTMLDivElement>) {
  let domRef = useDOMRef(ref);
  [props, domRef] = useContextProps(props, domRef, ContentContext);
  if (props.hidden) {
    return null;
  }
  return <div {...props} ref={domRef} />;
}

const _Content = forwardRef(Content);
export {_Content as Content};

export const TextContext = createContext<ContextValue<HTMLAttributes<HTMLElement>, HTMLDivElement>>({});

function Text(props: HTMLAttributes<HTMLElement>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, TextContext);
  if (props.hidden) {
    return null;
  }
  return <TextAria {...props} ref={ref} />;
}

const _Text = forwardRef(Text);
export {_Text as Text};

export const KeyboardContext = createContext<ContextValue<HTMLAttributes<HTMLElement>, HTMLDivElement>>({});

function Keyboard(props: HTMLAttributes<HTMLElement>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, KeyboardContext);
  if (props.hidden) {
    return null;
  }
  return <KeyboardAria {...props} ref={ref} />;
}

const _Keyboard = forwardRef(Keyboard);
export {_Keyboard as Keyboard};

export const FooterContext = createContext<ContextValue<HTMLAttributes<HTMLElement>, HTMLElement>>({});

function Footer(props: HTMLAttributes<HTMLElement>, ref: DOMRef) {
  let domRef = useDOMRef(ref);
  [props, domRef] = useContextProps(props, domRef, FooterContext);
  if (props.hidden) {
    return null;
  }
  return <footer {...props} ref={domRef} />;
}

const _Footer = forwardRef(Footer);
export {_Footer as Footer};

export const ImageContext = createContext<ContextValue<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>>({});

function Image(props: ImgHTMLAttributes<HTMLImageElement>, ref: DOMRef<HTMLImageElement>) {
  let domRef = useDOMRef(ref);
  [props, domRef] = useContextProps(props, domRef, ImageContext);
  if (props.hidden) {
    return null;
  }

  if (props.alt == null) {
    console.warn(
      'The `alt` prop was not provided to an image. ' +
      'Add `alt` text for screen readers, or set `alt=""` prop to indicate that the image ' +
      'is decorative or redundant with displayed text and should not be announced by screen readers.'
    );
  }

  return <img alt={props.alt} {...props} ref={domRef} />;
}

const _Image = forwardRef(Image);
export {_Image as Image};
