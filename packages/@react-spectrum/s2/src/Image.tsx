import {ContextValue, SlotProps} from 'react-aria-components';
import {createContext, ForwardedRef, forwardRef, HTMLAttributeReferrerPolicy, ReactNode, useCallback, useContext, useMemo, useReducer, useRef} from 'react';
import {DefaultImageGroup, ImageGroup} from './ImageCoordinator';
import {loadingStyle, SkeletonContext, useLoadingAnimation} from './Skeleton';
import {mergeStyles} from '../style/runtime';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {StyleString} from '../style/types';
import {UnsafeStyles} from './style-utils';
import {useLayoutEffect} from '@react-aria/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

interface ImageProps extends UnsafeStyles, SlotProps {
  src?: string,
  // TODO
  srcSet?: string,
  sizes?: string,
  alt?: string,
  crossOrigin?: 'anonymous' | 'use-credentials',
  decoding?: 'async' | 'auto' | 'sync',
  // Only supported in React 19...
  // fetchPriority?: 'high' | 'low' | 'auto',
  loading?: 'eager' | 'lazy',
  referrerPolicy?: HTMLAttributeReferrerPolicy,
  styles?: StyleString,
  renderError?: () => ReactNode,
  group?: ImageGroup
}

interface ImageContextValue extends ImageProps {
  hidden?: boolean
}

export const ImageContext = createContext<ContextValue<ImageContextValue, HTMLDivElement>>(null);

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

const imageStyles = style({
  backgroundColor: 'gray-100',
  overflow: 'hidden'
});

function Image(props: ImageProps, domRef: ForwardedRef<HTMLDivElement>) {
  [props, domRef] = useSpectrumContextProps(props, domRef, ImageContext);

  let {
    src = '',
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
    loading,
    referrerPolicy
  } = props;
  let hidden = (props as ImageContextValue).hidden;
  
  let {revealAll, register, unregister, load} = useContext(group);
  let [{state, src: lastSrc, loadTime}, dispatch] = useReducer(reducer, src, createState);

  if (src !== lastSrc && !hidden) {
    dispatch({type: 'update', src});
  }

  if (state === 'loaded' && revealAll && !hidden) {
    dispatch({type: 'revealed'});
  }

  let imgRef = useRef<HTMLImageElement | null>(null);
  useLayoutEffect(() => {
    if (hidden) {
      return;
    }

    register(src);
    return () => {
      unregister(src);
    };
  }, [hidden, register, unregister, src]);

  let isSkeleton = useContext(SkeletonContext);
  let isAnimating = isSkeleton || state === 'loading' || state === 'loaded';
  let animation = useLoadingAnimation(isAnimating);
  useLayoutEffect(() => {
    if (hidden) {
      return;
    }

    // If the image is already loaded, update state immediately instead of waiting for onLoad.
    if (state === 'loading' && imgRef.current?.complete) {
      // Queue a microtask so we don't hit React's update limit.
      // TODO: is this necessary?
      queueMicrotask(onLoad);
    }

    animation(domRef.current);
  });

  let onLoad = useCallback(() => {
    load(src);
    dispatch({type: 'loaded'});
  }, [load, src]);

  let onError = useCallback(() => {
    dispatch({type: 'error'});
    unregister(src);
  }, [unregister, src]);

  if (props.alt == null) {
    console.warn(
      'The `alt` prop was not provided to an image. ' +
      'Add `alt` text for screen readers, or set `alt=""` prop to indicate that the image ' +
      'is decorative or redundant with displayed text and should not be announced by screen readers.'
    );
  }

  let errorState = !isSkeleton && state === 'error' && renderError?.();
  let isRevealed = state === 'revealed' && !isSkeleton;
  let transition = isRevealed && loadTime > 200 ? 'opacity 500ms' : undefined;
  return useMemo(() => hidden ? null : (
    <div
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + mergeStyles(imageStyles, styles) + ' '  + (isAnimating ? loadingStyle : '')}>
      {errorState}
      {!errorState && (
        <img
          src={src}
          alt={alt}
          crossOrigin={crossOrigin}
          decoding={decoding}
          loading={loading}
          referrerPolicy={referrerPolicy}
          ref={imgRef}
          onLoad={onLoad}
          onError={onError}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'inherit',
            objectPosition: 'inherit',
            opacity: isRevealed ? 1 : 0,
            transition
          }} />
        )}
    </div>
  ), [hidden, domRef, UNSAFE_style, UNSAFE_className, styles, isAnimating, errorState, src, alt, crossOrigin, decoding, loading, referrerPolicy, onLoad, onError, isRevealed, transition]);
}

const _Image = forwardRef(Image);
export {_Image as Image};
