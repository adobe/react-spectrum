import {AriaLabelingProps, HoverEvents, ValueBase} from '@react-types/shared';
import {Color, parseColor, useColorPickerState} from '@react-stately/color';
import {ColorSwatchContext} from './ColorSwatch';
import {composeRenderProps, ContextValue, RenderProps, StyleRenderProps, useContextProps} from './utils';
import {filterDOMProps} from '@react-aria/utils';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ListBox, ListBoxItem, ListBoxItemRenderProps, ListBoxRenderProps} from './ListBox';
import React, {createContext, ForwardedRef, forwardRef, ReactNode, useContext, useEffect, useMemo} from 'react';
import {useLocale, useLocalizedStringFormatter} from 'react-aria';

export interface ColorSwatchPickerRenderProps extends Omit<ListBoxRenderProps, 'isDropTarget'> {}
export interface ColorSwatchPickerProps extends ValueBase<string | Color | null, Color>, AriaLabelingProps, StyleRenderProps<ColorSwatchPickerRenderProps> {
  /** The children of the ColorSwatchPicker. */
  children?: ReactNode,
  /**
   * Whether the items are arranged in a stack or grid.
   * @default 'grid'
   */
  layout?: 'grid' | 'stack'
}

export const ColorSwatchPickerContext = createContext<ContextValue<ColorSwatchPickerProps, HTMLDivElement>>(null);
const ColorMapContext = createContext<Map<string, Color> | null>(null);

function ColorSwatchPicker(props: ColorSwatchPickerProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, ColorSwatchPickerContext);
  let state = useColorPickerState(props);
  let colorMap = useMemo(() => new Map(), []);
  let formatter = useLocalizedStringFormatter(intlMessages, 'react-aria-components');

  return (
    <ListBox
      {...filterDOMProps(props, {labelable: true})}
      ref={ref}
      className={props.className || 'react-aria-ColorSwatchPicker'}
      style={props.style}
      aria-label={props['aria-label'] || (!props['aria-labelledby'] ? formatter.format('colorSwatchPicker') : undefined)}
      layout={props.layout || 'grid'}
      selectionMode="single"
      selectedKeys={[state.color.toString('hexa')]}
      onSelectionChange={(keys) => {
        // single select, 'all' cannot occur. appease typescript.
        if (keys !== 'all') {
          state.setColor(colorMap.get([...keys][0]));
        }
      }}
      disallowEmptySelection>
      <ColorMapContext.Provider value={colorMap}>
        {props.children}
      </ColorMapContext.Provider>
    </ListBox>
  );
}

/**
 * A ColorSwatchPicker displays a list of color swatches and allows a user to select one of them.
 */
let _ColorSwatchPicker = forwardRef(ColorSwatchPicker);
export {_ColorSwatchPicker as ColorSwatchPicker};

export interface ColorSwatchPickerItemRenderProps extends Omit<ListBoxItemRenderProps, 'selectionMode' | 'selectionBehavior'> {
  /** The color of the swatch. */
  color: Color
}

export interface ColorSwatchPickerItemProps extends RenderProps<ColorSwatchPickerItemRenderProps>, HoverEvents {
  /** The color of the swatch. */
  color: string | Color | null,
  /** Whether the color swatch is disabled. */
  isDisabled?: boolean
}

function ColorSwatchPickerItem(props: ColorSwatchPickerItemProps, ref: ForwardedRef<HTMLDivElement>) {
  let propColor = props.color || '#0000';
  let color = useMemo(() => typeof propColor === 'string' ? parseColor(propColor) : propColor, [propColor]);
  let {locale} = useLocale();
  let map = useContext(ColorMapContext)!;
  useEffect(() => {
    let key = color.toString('hexa');
    map.set(key, color);
    return () => {
      map.delete(key);
    };
  }, [color, map]);

  let wrap = (v) => {
    if (typeof v === 'function') {
      return (renderProps) => v({...renderProps, color});
    }
    return v;
  };

  return (
    <ListBoxItem
      {...props}
      ref={ref}
      id={color.toString('hexa')}
      textValue={color.getColorName(locale)}
      className={wrap(props.className || 'react-aria-ColorSwatchPickerItem')}
      style={wrap(props.style)}>
      {composeRenderProps(wrap(props.children), children => (
        <ColorSwatchContext.Provider value={{color}}>
          {children}
        </ColorSwatchContext.Provider>
      ))}
    </ListBoxItem>
  );
}

let _ColorSwatchPickerItem = forwardRef(ColorSwatchPickerItem);
export {_ColorSwatchPickerItem as ColorSwatchPickerItem};
