import {ForwardedRef, HTMLAttributes, ImgHTMLAttributes, createContext, forwardRef} from 'react';
import {Heading as RACHeading, HeadingProps, Header as RACHeader, useContextProps} from 'react-aria-components';
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
