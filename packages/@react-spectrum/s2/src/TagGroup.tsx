import {
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagGroupProps as AriaTagGroupProps,
  TagList,
  TagListProps,
  TagProps as AriaTagProps,
  TextContext,
  composeRenderProps,
  Provider
} from 'react-aria-components';
import {StyleProps, field, focusRing, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {FieldLabel, HelpText} from './Field';
import {FormContext, useFormProps} from './Form';
import {SpectrumLabelableProps, DOMRef} from '@react-types/shared';
import {ClearButton} from './ClearButton';
import {fontRelative, style} from '../style/spectrum-theme' with { type: 'macro' };
import {pressScale} from './pressScale';
import {createContext, useContext, useRef, forwardRef, ReactNode} from 'react';
import {useDOMRef} from '@react-spectrum/utils';
import {Text} from './Content';
import {IconContext} from './Icon';
import {centerBaseline} from './CenterBaseline';
import {forwardRefType} from './types';

// Get types from RSP and extend those?

export interface TagProps extends Omit<AriaTagProps, 'children' | 'style' | 'className'> {
  /** The children of the tag. */
  children?: ReactNode
}

export interface TagGroupProps<T> extends Omit<AriaTagGroupProps, 'children' | 'style' | 'className'>, Pick<TagListProps<T>, 'items' | 'children' | 'renderEmptyState'>, Omit<SpectrumLabelableProps, 'isRequired' | 'necessityIndicator' | 'contextualHelp'>, StyleProps {
  /** A description for the tag group. */
  description?: ReactNode,
  /**
   * The size of the tag group.
   *
   * @default "M"
   */
  size?: 'S' | 'M' | 'L',
  /** Whether the tags are displayed in an emphasized style. */
  isEmphasized?: boolean,
  /** Provides content to display when there are no items in the tag group. */
  renderEmptyState?: () => ReactNode
}

const TagGroupContext = createContext<TagGroupProps<any>>({});

function TagGroup<T extends object>(
  {
    label,
    description,
    items,
    labelPosition = 'top',
    labelAlign = 'start',
    children,
    renderEmptyState,
    isEmphasized,
    UNSAFE_className = '',
    UNSAFE_style,
    ...props
  }: TagGroupProps<T>,
  ref: DOMRef<HTMLDivElement>
) {
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let {size = 'M'} = props;
  let domRef = useDOMRef(ref);

  // TODO collapse behavior, need a custom collection render so we can limit the number of children
  // but this isn't possible yet
  return (
    <AriaTagGroup
      {...props}
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + style(field(), getAllowedOverrides())({
        size: props.size,
        labelPosition: labelPosition,
        isInForm: !!formContext
      }, props.styles)}>
      <FieldLabel
        size={size}
        labelPosition={labelPosition}
        labelAlign={labelAlign}>
        {label}
      </FieldLabel>
      <div
        className={style({
          gridArea: 'input',
          display: 'flex',
          flexWrap: 'wrap',
          // TODO: what should this gap be?
          gap: 16
        })}>
        <FormContext.Provider value={{...formContext, size}}>
          <Provider
            values={[
              [TextContext, undefined],
              [TagGroupContext, {size, isEmphasized}]
            ]}>
            <TagList
              items={items}
              renderEmptyState={renderEmptyState}
              className={({isEmpty}) => style({
                marginX: {
                  default: -4, // use negative number when theme TS is ready
                  isEmpty: 0
                },
                fontFamily: 'sans'
              })({isEmpty})}>
              {children}
            </TagList>
          </Provider>
        </FormContext.Provider>
      </div>
      <HelpText
        size={size}
        description={description} />
    </AriaTagGroup>
  );
}

/** Tags allow users to categorize content. They can represent keywords or people, and are grouped to describe an item or a search request. */
let _TagGroup = /*#__PURE__*/ (forwardRef as forwardRefType)(TagGroup);
export {_TagGroup as TagGroup};

const tagStyles = style({
  ...focusRing(),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'sans',
  fontWeight: 'medium',
  fontSize: 'control',
  height: 'control',
  transition: 'default',
  backgroundColor: {
    default: 'gray-100',
    isSelected: {
      default: 'neutral',
      isEmphasized: 'accent'
    },
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonFace',
      isSelected: 'Highlight'
    }
  },
  color: {
    default: 'neutral',
    isSelected: {
      default: 'gray-25',
      isEmphasized: 'white'
    },
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonText',
      isSelected: 'HighlightText',
      isDisabled: 'GrayText'
    }
  },
  borderStyle: 'none',
  paddingStart: {
    default: 'edge-to-text'
  },
  paddingEnd: {
    default: 'edge-to-text',
    allowsRemoving: 0
  },
  paddingY: 0,
  margin: 4,
  borderRadius: 'control',
  cursor: {
    default: 'default',
    isLink: 'pointer'
  },
  '--iconMargin': {
    type: 'marginTop',
    value: {
      default: fontRelative(-2)
    }
  },
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

export function Tag({children, ...props}: TagProps) {
  let textValue = typeof children === 'string' ? children : undefined;
  let {size = 'M', isEmphasized} = useContext(TagGroupContext);
  let ref = useRef(null);
  let isLink = props.href != null;
  return (
    <AriaTag
      textValue={textValue}
      {...props}
      ref={ref}
      style={pressScale(ref)}
      className={renderProps => tagStyles({...renderProps, size, isEmphasized, isLink})} >
      {composeRenderProps(children, (children, {allowsRemoving, isDisabled}) => (
        <>
          <div
            className={style({
              display: 'flex',
              alignItems: 'center',
              gap: 'text-to-visual',
              forcedColorAdjust: 'none',
              backgroundColor: 'transparent'
            })}>
            <Provider
              values={[
                [TextContext, {className: style({paddingY: '--labelPadding', order: 1})}],
                [IconContext, {
                  render: centerBaseline({slot: 'icon', className: style({order: 0})}),
                  styles: style({size: fontRelative(20), marginStart: '--iconMargin', flexShrink: 0})
                }]
              ]}>
              {typeof children === 'string' ? <Text>{children}</Text> : children}
            </Provider>
          </div>
          {allowsRemoving && (
            <ClearButton
              slot="remove"
              size={size}
              isDisabled={isDisabled} />
          )}
        </>
      ))}
    </AriaTag>
  );
}
