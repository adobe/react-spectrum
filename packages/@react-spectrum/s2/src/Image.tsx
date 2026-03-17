import {ColorSchemeContext} from './Provider';
import {ContextValue, SlotProps} from 'react-aria-components';
import {createContext, ForwardedRef, forwardRef, HTMLAttributeReferrerPolicy, JSX, ReactNode, useCallback, useContext, useMemo, useReducer, useRef, version} from 'react';
import {DefaultImageGroup, ImageGroup} from './ImageCoordinator';
import {loadingStyle, useIsSkeleton, useLoadingAnimation} from './Skeleton';
import {mergeStyles} from '../style/runtime';
import {style} from '../style' with {type: 'macro'};
import {StyleString} from '../style/types';
import {UnsafeStyles} from './style-utils';
import {useLayoutEffect} from '@react-aria/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ImageSource {
  /**
   * A comma-separated list of image URLs and descriptors.
   * [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source#srcset).
   */
  srcSet?: string | undefined,
  /**
   * The color scheme for this image source. Unlike `media`, this respects the `Provider` color scheme setting.
   */
  colorScheme?: 'light' | 'dark',
  /**
   * A media query describing when the source should render.
   * [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source#media).
   */
  media?: string | undefined,
  /**
   * A list of source sizes that describe the final rendered width of the image.
   * [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source#sizes).
   */
  sizes?: string | undefined,
  /**
   * The mime type of the image.
   * [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source#type).
   */
  type?: string | undefined,
  /**
   * The intrinsic width of the image.
   * [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source#width).
   */
  width?: number,
  /**
   * The intrinsic height of the image.
   * [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/source#height).
   */
  height?: number
}

export interface ImageProps extends UnsafeStyles, SlotProps {
  /** The URL of the image or a list of conditional sources. */
  src?: string | ImageSource[],
  // TODO
  // srcSet?: string,
  // sizes?: string,
  /** Accessible alt text for the image. */
  alt?: string,
  /**
   * Indicates if the fetching of the image must be done using a CORS request.
   * [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin).
   */
  crossOrigin?: 'anonymous' | 'use-credentials',
  /**
   * Whether the browser should decode images synchronously or asynchronously.
   * [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#decoding).
   */
  decoding?: 'async' | 'auto' | 'sync',
  /**
   * Provides a hint of the relative priority to use when fetching the image.
   * [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#fetchpriority).
   */
  fetchPriority?: 'high' | 'low' | 'auto',
  /**
   * Whether the image should be loaded immediately or lazily when scrolled into view.
   * [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#loading).
   */
  loading?: 'eager' | 'lazy',
  /**
   * A string indicating which referrer to use when fetching the resource.
   * [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#referrerpolicy).
   */
  referrerPolicy?: HTMLAttributeReferrerPolicy,
  /**
   * The intrinsic width of the image.
   * [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#width).
   */
  width?: number,
  /**
   * The intrinsic height of the image.
   * [See MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#height).
   */
  height?: number,
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StyleString,
  /** A function that is called to render a fallback when the image fails to load. */
  renderError?: () => ReactNode,
  /**
   * A group of images to coordinate between, matching the group passed to the `<ImageCoordinator>` component.
   * If not provided, the default image group is used.
   */
  group?: ImageGroup,
  /**
   * Associates the image with a microdata object.
   * See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/itemprop).
   */
  itemProp?: string
}

interface ImageContextValue extends ImageProps {
  hidden?: boolean
}

export const ImageContext = createContext<ContextValue<Partial<ImageContextValue>, HTMLDivElement>>(null);

type ImageState = 'loading' | 'loaded' | 'revealed' | 'error';
interface State {
  state: ImageState,
  src: string,
  startTime: number,
  loadTime: number
}

type Action = 
  | {type: 'update', src: string}
  | {type: 'loaded'}
  | {type: 'revealed'}
  | {type: 'error'};

function createState(src: string): State {
  return {
    state: 'loading',
    src,
    startTime: Date.now(),
    loadTime: 0
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'update': {
      return {
        state: 'loading',
        src: action.src,
        startTime: Date.now(),
        loadTime: 0
      };
    }
    case 'loaded':
    case 'error': {
      return {
        ...state,
        state: action.type
      };
    }
    case 'revealed': {
      return {
        ...state,
        state: 'revealed',
        loadTime: Date.now() - state.startTime
      };
    }
    default:
      return state;
  }
}

const wrapperStyles = style({
  backgroundColor: 'gray-100',
  overflow: 'hidden'
});

const imgStyles = style({
  display: 'block',
  width: 'full',
  height: 'full',
  objectFit: 'inherit',
  objectPosition: 'inherit',
  opacity: {
    default: 0,
    isRevealed: 1
  },
  transition: {
    default: 'none',
    isTransitioning: 'opacity'
  },
  transitionDuration: 500
});

/**
 * An image with support for skeleton loading and custom error states.
 */
export const Image = forwardRef(function Image(props: ImageProps, domRef: ForwardedRef<HTMLDivElement>): JSX.Element | null {
  [props, domRef] = useSpectrumContextProps(props, domRef, ImageContext);

  let {
    src: srcProp = '',
    styles,
    UNSAFE_className = '',
    UNSAFE_style,
    renderError,
    group = DefaultImageGroup,
    // TODO
    // srcSet,
    // sizes,
    alt,
    crossOrigin,
    decoding,
    fetchPriority,
    loading,
    referrerPolicy,
    slot,
    width,
    height,
    itemProp
  } = props;
  let hidden = (props as ImageContextValue).hidden;
  let colorScheme = useContext(ColorSchemeContext);
  let cacheKey = useMemo(() => typeof srcProp === 'object' ? JSON.stringify(srcProp) : srcProp, [srcProp]);
  
  let {revealAll, register, unregister, load} = useContext(group);
  let [{state, src: lastCacheKey, loadTime}, dispatch] = useReducer(reducer, cacheKey, createState);

  if (cacheKey !== lastCacheKey && !hidden) {
    dispatch({type: 'update', src: cacheKey});
  }

  if (state === 'loaded' && revealAll && !hidden) {
    dispatch({type: 'revealed'});
  }

  let imgRef = useRef<HTMLImageElement | null>(null);
  useLayoutEffect(() => {
    if (hidden) {
      return;
    }

    register(cacheKey);
    return () => {
      unregister(cacheKey);
    };
  }, [hidden, register, unregister, cacheKey]);

  let onLoad = useCallback(() => {
    load(cacheKey);
    dispatch({type: 'loaded'});
  }, [load, cacheKey]);

  let onError = useCallback(() => {
    dispatch({type: 'error'});
    unregister(cacheKey);
  }, [unregister, cacheKey]);

  let isSkeleton = useIsSkeleton();
  let isAnimating = isSkeleton || state === 'loading' || state === 'loaded';
  let animation = useLoadingAnimation(isAnimating);
  useLayoutEffect(() => {
    if (hidden) {
      return;
    }

    // In React act environments, run immediately.
    // @ts-ignore
    let isTestEnv = typeof IS_REACT_ACT_ENVIRONMENT === 'boolean' ? IS_REACT_ACT_ENVIRONMENT : typeof jest !== 'undefined';
    let runTask = isTestEnv ? fn => fn() : queueMicrotask;

    // If the image is already loaded, update state immediately instead of waiting for onLoad.
    let img = imgRef.current;
    if (state === 'loading' && img?.complete) {
      if (img.naturalWidth === 0 && img.naturalHeight === 0) {
        // Queue a microtask so we don't hit React's update limit.
        // TODO: is this necessary?
        runTask(onError);
      } else {
        runTask(onLoad);
      }
    }

    animation(domRef.current);
  });

  if (props.alt == null && process.env.NODE_ENV !== 'production') {
    console.warn(
      'The `alt` prop was not provided to an image. ' +
      'Add `alt` text for screen readers, or set `alt=""` prop to indicate that the image ' +
      'is decorative or redundant with displayed text and should not be announced by screen readers.'
    );
  }

  let errorState = !isSkeleton && state === 'error' && renderError?.();
  let isRevealed = state === 'revealed' && !isSkeleton;
  let isTransitioning = isRevealed && loadTime > 200;
  return useMemo(() => {
    let img = (
      <img
        {...getFetchPriorityProp(fetchPriority)}
        src={typeof srcProp === 'string' && srcProp ? srcProp : undefined}
        alt={alt}
        crossOrigin={crossOrigin}
        decoding={decoding}
        loading={loading}
        referrerPolicy={referrerPolicy}
        width={width}
        height={height}
        ref={imgRef}
        itemProp={itemProp}
        onLoad={onLoad}
        onError={onError}
        className={imgStyles({isRevealed, isTransitioning})} />
    );

    if (Array.isArray(srcProp)) {
      img = (
        <picture className={style({objectFit: 'inherit', objectPosition: 'inherit'})}>
          {srcProp.map((source, i) => {
            let {colorScheme: sourceColorScheme, ...sourceProps} = source;
            if (sourceColorScheme) {
              if (!colorScheme || colorScheme === 'light dark') {
                return (
                  <source
                    key={i}
                    {...sourceProps}
                    media={`${source.media ? `${source.media} and ` : ''}(prefers-color-scheme: ${sourceColorScheme})`} />
                );
              }

              return sourceColorScheme === colorScheme
                ? <source key={i} {...sourceProps} />
                : null;
            } else {
              return <source key={i} {...sourceProps} />;
            }
          })}
          {img}
        </picture>
      );
    }

    return hidden ? null : (
      <div
        ref={domRef}
        slot={slot || undefined}
        style={UNSAFE_style}
        className={UNSAFE_className + mergeStyles(wrapperStyles, styles) + ' '  + (isAnimating ? loadingStyle : '')}>
        {errorState}
        {!errorState && img}
      </div>
    );
  }, [slot, hidden, domRef, UNSAFE_style, UNSAFE_className, styles, isAnimating, errorState, alt, crossOrigin, decoding, fetchPriority, loading, referrerPolicy, width, height, onLoad, onError, isRevealed, isTransitioning, srcProp, itemProp, colorScheme]);
});

function getFetchPriorityProp(fetchPriority?: 'high' | 'low' | 'auto'): Record<string, string | undefined> {
  const pieces = version.split('.');
  const major = parseInt(pieces[0], 10);
  if (major >= 19) {
    return {fetchPriority};
  }
  return {fetchpriority: fetchPriority};
}
