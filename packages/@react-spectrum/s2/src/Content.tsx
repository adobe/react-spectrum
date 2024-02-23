import {ForwardedRef, HTMLAttributes, ImgHTMLAttributes, createContext, forwardRef} from 'react';
import {Heading as RACHeading, HeadingProps, Header as RACHeader, useContextProps} from 'react-aria-components';

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

function Header(props: HTMLAttributes<HTMLElement>, ref: ForwardedRef<HTMLElement>) {
  [props, ref] = useContextProps(props, ref, HeaderContext);
  if (props.hidden) {
    return null;
  }

  return <RACHeader {...props} ref={ref} />;
}

const _Header = forwardRef(Header);
export {_Header as Header};

export const ContentContext = createContext<ContextValue<HTMLAttributes<HTMLElement>, HTMLDivElement>>({});

function Content(props: HTMLAttributes<HTMLElement>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ContentContext);
  if (props.hidden) {
    return null;
  }
  return <div {...props} ref={ref} />;
}

const _Content = forwardRef(Content);
export {_Content as Content};

export const FooterContext = createContext<ContextValue<HTMLAttributes<HTMLElement>, HTMLElement>>({});

function Footer(props: HTMLAttributes<HTMLElement>, ref: ForwardedRef<HTMLElement>) {
  [props, ref] = useContextProps(props, ref, FooterContext);
  if (props.hidden) {
    return null;
  }
  return <footer {...props} ref={ref} />;
}

const _Footer = forwardRef(Footer);
export {_Footer as Footer};

export const ImageContext = createContext<ContextValue<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>>({});

function Image(props: ImgHTMLAttributes<HTMLImageElement>, ref: ForwardedRef<HTMLImageElement>) {
  [props, ref] = useContextProps(props, ref, ImageContext);
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

  return <img alt={props.alt} {...props} ref={ref} />;
}

const _Image = forwardRef(Image);
export {_Image as Image};
