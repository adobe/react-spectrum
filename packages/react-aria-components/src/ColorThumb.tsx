import {Color} from '@react-types/color';
import {filterDOMProps} from '@react-aria/utils';
import {HoverEvents} from '@react-types/shared';
import {mergeProps} from 'react-aria';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes, InputHTMLAttributes, RefObject, useContext} from 'react';
import {RenderProps, useRenderProps} from './utils';
import {useFocusRing} from '@react-aria/focus';
import {useHover} from '@react-aria/interactions';

interface ColorState {
  getDisplayColor(): Color,
  isDragging: boolean
}

interface InternalColorThumbContextValue {
  state: ColorState,
  thumbProps: HTMLAttributes<HTMLElement>,
  inputXRef: RefObject<HTMLInputElement>,
  inputYRef?: RefObject<HTMLInputElement>,
  xInputProps: InputHTMLAttributes<HTMLInputElement>,
  yInputProps?: InputHTMLAttributes<HTMLInputElement>,
  isDisabled?: boolean
}

export const InternalColorThumbContext = createContext<InternalColorThumbContextValue | null>(null);

export interface ColorThumbRenderProps {
  /**
   * The selected color, excluding the alpha channel.
   */
  color: Color,
  /**
   * Whether this thumb is currently being dragged.
   * @selector [data-dragging]
   */
  isDragging: boolean,
  /**
   * Whether the thumb is currently hovered with a mouse.
   * @selector [data-hovered]
   */
  isHovered: boolean,
  /**
   * Whether the thumb is currently focused.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the thumb is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the thumb is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean
}

export interface ColorThumbProps extends HoverEvents, RenderProps<ColorThumbRenderProps> {}

function ColorThumb(props: ColorThumbProps, ref: ForwardedRef<HTMLDivElement>) {
  let {state, thumbProps, inputXRef, inputYRef, xInputProps, yInputProps, isDisabled = false} = useContext(InternalColorThumbContext)!;
  let {focusProps, isFocused, isFocusVisible} = useFocusRing();
  let {hoverProps, isHovered} = useHover(props);

  let renderProps = useRenderProps({
    ...props,
    defaultClassName: 'react-aria-ColorThumb',
    defaultStyle: {
      ...thumbProps.style,
      backgroundColor: state.getDisplayColor().toString()
    },
    values: {
      color: state.getDisplayColor(),
      isHovered,
      isDragging: state.isDragging,
      isFocused,
      isFocusVisible,
      isDisabled
    }
  });

  let DOMProps = filterDOMProps(props as any);
  delete DOMProps.id;

  return (
    <div
      {...mergeProps(thumbProps, hoverProps, DOMProps)}
      {...renderProps}
      ref={ref}
      data-hovered={isHovered || undefined}
      data-dragging={state.isDragging || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={isDisabled || undefined}>
      <input ref={inputXRef} {...xInputProps} {...focusProps} />
      {yInputProps && <input ref={inputYRef} {...yInputProps} {...focusProps} />}
      {renderProps.children}
    </div>
  );
}

/**
 * A color thumb appears within a ColorArea, ColorSlider, or ColorWheel and allows a user to drag to adjust the color value.
 */
const _ColorThumb = forwardRef(ColorThumb);
export {_ColorThumb as ColorThumb};
