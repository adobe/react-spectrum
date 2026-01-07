import {ActionButton} from './ActionButton';
import {AriaLabelingProps, DOMProps, FocusableRef, FocusableRefValue} from '@react-types/shared';
import {ContentContext, FooterContext, HeadingContext} from './Content';
import {ContextValue, DEFAULT_SLOT, Provider, Dialog as RACDialog, TextContext} from 'react-aria-components';
import {createContext, forwardRef, ReactNode} from 'react';
import {dialogInner} from './Dialog';
import {DialogTrigger, DialogTriggerProps} from './DialogTrigger';
import {filterDOMProps, mergeProps, useLabels} from '@react-aria/utils';
import HelpIcon from '../s2wf-icons/S2_Icon_HelpCircle_20_N.svg';
import InfoIcon from '../s2wf-icons/S2_Icon_InfoCircle_20_N.svg';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeStyles} from '../style/runtime';
import {Placement} from '@react-types/overlays';
import {Popover, PopoverDialogProps} from './Popover';
import {space, style} from '../style' with {type: 'macro'};
import {StyleProps} from './style-utils' with { type: 'macro' };
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ContextualHelpStyleProps {
  /**
   * Indicates whether contents are informative or provides helpful guidance.
   *
   * @default 'help'
   */
  variant?: 'info' | 'help'
}
export interface ContextualHelpProps extends
  Pick<DialogTriggerProps, 'isOpen' | 'defaultOpen' | 'onOpenChange'>,
  Pick<PopoverDialogProps, 'shouldFlip' | 'offset' | 'crossOffset' | 'placement' | 'containerPadding'>,
  ContextualHelpStyleProps, StyleProps, DOMProps, AriaLabelingProps {
  /**
   * The placement of the popover with respect to the action button.
   * @default 'bottom start'
   */
  placement?: Placement,
  /** Contents of the Contextual Help popover. */
  children: ReactNode,
  /**
   * The size of the ActionButton.
   *
   * @default 'XS'
   */
  size?: 'XS' | 'S'
}

const wrappingDiv = style({
  minWidth: 268,
  width: 268,
  padding: 24,
  boxSizing: 'border-box',
  height: 'full'
});

export const ContextualHelpContext = createContext<ContextValue<Partial<ContextualHelpProps>, FocusableRefValue<HTMLButtonElement>>>(null);

/**
 * Contextual help shows a user extra information about the state of an adjacent component, or a total view.
 */
export const ContextualHelp = forwardRef(function ContextualHelp(props: ContextualHelpProps, ref: FocusableRef<HTMLButtonElement>) {
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/s2');
  [props, ref] = useSpectrumContextProps(props, ref, ContextualHelpContext);
  let {
    children,
    defaultOpen,
    containerPadding = 8,
    size = 'XS',
    crossOffset,
    isOpen,
    onOpenChange,
    placement = 'bottom start',
    shouldFlip,
    UNSAFE_className,
    UNSAFE_style,
    styles,
    variant = 'help'
  } = props;

  // In a FieldLabel we're getting the context's aria-labeledby, so we need to
  // manually set the aria-label after useLabels() to keep the order of label
  // then ContextualHelp variant
  let labelProps = useLabels(props);
  let label = stringFormatter.format(`contextualhelp.${variant}`);
  labelProps['aria-label'] = labelProps['aria-label'] ? labelProps['aria-label'] + ' ' + label : label;

  let buttonProps = filterDOMProps(props, {labelable: true});

  return (
    <DialogTrigger
      isOpen={isOpen}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}>
      <ActionButton
        slot={null}
        ref={ref}
        size={size}
        {...mergeProps(buttonProps, labelProps)}
        UNSAFE_style={UNSAFE_style}
        UNSAFE_className={UNSAFE_className}
        styles={styles}
        isQuiet>
        {variant === 'info' ? <InfoIcon /> : <HelpIcon />}
      </ActionButton>
      <Popover
        padding="none"
        placement={placement}
        shouldFlip={shouldFlip}
        containerPadding={containerPadding}
        offset={8}
        crossOffset={crossOffset}
        hideArrow>
        <div
          className={wrappingDiv}>
          <RACDialog className={mergeStyles(dialogInner, style({borderRadius: 'none', margin: 'calc(self(paddingTop) * -1)', padding: 24}))}>
            <Provider
              values={[
                [TextContext, {
                  slots: {
                    [DEFAULT_SLOT]: {}
                  }
                }],
                [HeadingContext, {styles: style({
                  font: 'heading-xs',
                  margin: 0,
                  marginBottom: space(8) // This only makes it 10px on mobile and should be 12px
                })}],
                [ContentContext, {styles: style({
                  font: 'body-sm'
                })}],
                [FooterContext, {styles: style({
                  font: 'body-sm',
                  marginTop: 16
                })}]
              ]}>
              {children}
            </Provider>
          </RACDialog>
        </div>
      </Popover>
    </DialogTrigger>
  );
});
