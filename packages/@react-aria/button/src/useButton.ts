/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  HTMLAttributes,
  InputHTMLAttributes,
  RefObject
} from 'react';
import {AriaButtonProps} from '@react-types/button';
import {filterDOMProps} from '@react-aria/utils';
import {mergeProps} from '@react-aria/utils';
import {useFocusable} from '@react-aria/focus';
import {usePress} from '@react-aria/interactions';


export interface ButtonAria<T> {
  /** Props for the button element. */
  buttonProps: T,
  /** Whether the button is currently pressed. */
  isPressed: boolean
}

/**
 * Provides the behavior and accessibility implementation for a button component. Handles mouse, keyboard, and touch interactions,
 * focus behavior, and ARIA props for both native button elements and custom element types.
 * @param props - Props to be applied to the button.
 * @param ref - A ref to a DOM element for the button.
 */

/* eslint-disable no-redeclare */
function useButton(props: AriaButtonProps<'a'>, ref: RefObject<HTMLAnchorElement>): ButtonAria<AnchorHTMLAttributes<HTMLAnchorElement>>;
function useButton(props: AriaButtonProps<'area'>, ref: RefObject<HTMLAreaElement>): ButtonAria<HTMLAttributes<HTMLAreaElement>>;
function useButton(props: AriaButtonProps<'audio'>, ref: RefObject<HTMLAudioElement>): ButtonAria<HTMLAttributes<HTMLAudioElement>>;
function useButton(props: AriaButtonProps<'base'>, ref: RefObject<HTMLBaseElement>): ButtonAria<HTMLAttributes<HTMLBaseElement>>;
function useButton(props: AriaButtonProps<'br'>, ref: RefObject<HTMLBRElement>): ButtonAria<HTMLAttributes<HTMLBRElement>>;
function useButton(props: AriaButtonProps<'button'>, ref: RefObject<HTMLButtonElement>): ButtonAria<ButtonHTMLAttributes<HTMLButtonElement>>;
function useButton(props: AriaButtonProps<'canvas'>, ref: RefObject<HTMLCanvasElement>): ButtonAria<HTMLAttributes<HTMLCanvasElement>>;
function useButton(props: AriaButtonProps<'data'>, ref: RefObject<HTMLDataElement>): ButtonAria<HTMLAttributes<HTMLDataElement>>;
function useButton(props: AriaButtonProps<'details'>, ref: RefObject<HTMLDetailsElement>): ButtonAria<HTMLAttributes<HTMLDetailsElement>>;
function useButton(props: AriaButtonProps<'dialog'>, ref: RefObject<HTMLDialogElement>): ButtonAria<HTMLAttributes<HTMLDialogElement>>;
function useButton(props: AriaButtonProps<'div'>, ref: RefObject<HTMLDivElement>): ButtonAria<HTMLAttributes<HTMLDivElement>>;
function useButton(props: AriaButtonProps<'embed'>, ref: RefObject<HTMLEmbedElement>): ButtonAria<HTMLAttributes<HTMLEmbedElement>>;
function useButton(props: AriaButtonProps<'fieldset'>, ref: RefObject<HTMLFieldSetElement>): ButtonAria<HTMLAttributes<HTMLFieldSetElement>>;
function useButton(props: AriaButtonProps<'form'>, ref: RefObject<HTMLFormElement>): ButtonAria<HTMLAttributes<HTMLFormElement>>;
function useButton(props: AriaButtonProps<'h1'>, ref: RefObject<HTMLHeadingElement>): ButtonAria<HTMLAttributes<HTMLHeadingElement>>;
function useButton(props: AriaButtonProps<'h2'>, ref: RefObject<HTMLHeadingElement>): ButtonAria<HTMLAttributes<HTMLHeadingElement>>;
function useButton(props: AriaButtonProps<'h3'>, ref: RefObject<HTMLHeadingElement>): ButtonAria<HTMLAttributes<HTMLHeadingElement>>;
function useButton(props: AriaButtonProps<'h4'>, ref: RefObject<HTMLHeadingElement>): ButtonAria<HTMLAttributes<HTMLHeadingElement>>;
function useButton(props: AriaButtonProps<'h5'>, ref: RefObject<HTMLHeadingElement>): ButtonAria<HTMLAttributes<HTMLHeadingElement>>;
function useButton(props: AriaButtonProps<'h6'>, ref: RefObject<HTMLHeadingElement>): ButtonAria<HTMLAttributes<HTMLHeadingElement>>;
function useButton(props: AriaButtonProps<'hr'>, ref: RefObject<HTMLHRElement>): ButtonAria<HTMLAttributes<HTMLHRElement>>;
function useButton(props: AriaButtonProps<'iframe'>, ref: RefObject<HTMLIFrameElement>): ButtonAria<HTMLAttributes<HTMLIFrameElement>>;
function useButton(props: AriaButtonProps<'img'>, ref: RefObject<HTMLImageElement>): ButtonAria<HTMLAttributes<HTMLImageElement>>;
function useButton(props: AriaButtonProps<'input'>, ref: RefObject<HTMLInputElement>): ButtonAria<InputHTMLAttributes<HTMLInputElement>>;
function useButton(props: AriaButtonProps<'label'>, ref: RefObject<HTMLLabelElement>): ButtonAria<HTMLAttributes<HTMLLabelElement>>;
function useButton(props: AriaButtonProps<'legend'>, ref: RefObject<HTMLLegendElement>): ButtonAria<HTMLAttributes<HTMLLegendElement>>;
function useButton(props: AriaButtonProps<'li'>, ref: RefObject<HTMLLIElement>): ButtonAria<HTMLAttributes<HTMLLIElement>>;
function useButton(props: AriaButtonProps<'link'>, ref: RefObject<HTMLLinkElement>): ButtonAria<HTMLAttributes<HTMLLinkElement>>;
function useButton(props: AriaButtonProps<'map'>, ref: RefObject<HTMLMapElement>): ButtonAria<HTMLAttributes<HTMLMapElement>>;
function useButton(props: AriaButtonProps<'menu'>, ref: RefObject<HTMLMenuElement>): ButtonAria<HTMLAttributes<HTMLMenuElement>>;
function useButton(props: AriaButtonProps<'meta'>, ref: RefObject<HTMLMetaElement>): ButtonAria<HTMLAttributes<HTMLMetaElement>>;
function useButton(props: AriaButtonProps<'meter'>, ref: RefObject<HTMLMeterElement>): ButtonAria<HTMLAttributes<HTMLMeterElement>>;
function useButton(props: AriaButtonProps<'object'>, ref: RefObject<HTMLObjectElement>): ButtonAria<HTMLAttributes<HTMLObjectElement>>;
function useButton(props: AriaButtonProps<'ol'>, ref: RefObject<HTMLOListElement>): ButtonAria<HTMLAttributes<HTMLOListElement>>;
function useButton(props: AriaButtonProps<'optgroup'>, ref: RefObject<HTMLOptGroupElement>): ButtonAria<HTMLAttributes<HTMLOptGroupElement>>;
function useButton(props: AriaButtonProps<'option'>, ref: RefObject<HTMLOptionElement>): ButtonAria<HTMLAttributes<HTMLOptionElement>>;
function useButton(props: AriaButtonProps<'output'>, ref: RefObject<HTMLOutputElement>): ButtonAria<HTMLAttributes<HTMLOutputElement>>;
function useButton(props: AriaButtonProps<'p'>, ref: RefObject<HTMLParagraphElement>): ButtonAria<HTMLAttributes<HTMLParagraphElement>>;
function useButton(props: AriaButtonProps<'param'>, ref: RefObject<HTMLParamElement>): ButtonAria<HTMLAttributes<HTMLParamElement>>;
function useButton(props: AriaButtonProps<'picture'>, ref: RefObject<HTMLPictureElement>): ButtonAria<HTMLAttributes<HTMLPictureElement>>;
function useButton(props: AriaButtonProps<'pre'>, ref: RefObject<HTMLPreElement>): ButtonAria<HTMLAttributes<HTMLPreElement>>;
function useButton(props: AriaButtonProps<'progress'>, ref: RefObject<HTMLProgressElement>): ButtonAria<HTMLAttributes<HTMLProgressElement>>;
function useButton(props: AriaButtonProps<'select'>, ref: RefObject<HTMLSelectElement>): ButtonAria<HTMLAttributes<HTMLSelectElement>>;
function useButton(props: AriaButtonProps<'slot'>, ref: RefObject<HTMLSlotElement>): ButtonAria<HTMLAttributes<HTMLSlotElement>>;
function useButton(props: AriaButtonProps<'source'>, ref: RefObject<HTMLSourceElement>): ButtonAria<HTMLAttributes<HTMLSourceElement>>;
function useButton(props: AriaButtonProps<'span'>, ref: RefObject<HTMLSpanElement>): ButtonAria<HTMLAttributes<HTMLSpanElement>>;
function useButton(props: AriaButtonProps<'style'>, ref: RefObject<HTMLStyleElement>): ButtonAria<HTMLAttributes<HTMLStyleElement>>;
function useButton(props: AriaButtonProps<'svg'>, ref: RefObject<SVGElement>): ButtonAria<HTMLAttributes<SVGElement>>;
function useButton(props: AriaButtonProps<'table'>, ref: RefObject<HTMLTableElement>): ButtonAria<HTMLAttributes<HTMLTableElement>>;
function useButton(props: AriaButtonProps<'td'>, ref: RefObject<HTMLTableDataCellElement>): ButtonAria<HTMLAttributes<HTMLTableDataCellElement>>;
function useButton(props: AriaButtonProps<'template'>, ref: RefObject<HTMLTemplateElement>): ButtonAria<HTMLAttributes<HTMLTemplateElement>>;
function useButton(props: AriaButtonProps<'textarea'>, ref: RefObject<HTMLTextAreaElement>): ButtonAria<HTMLAttributes<HTMLTextAreaElement>>;
function useButton(props: AriaButtonProps<'tfoot'>, ref: RefObject<HTMLTableSectionElement>): ButtonAria<HTMLAttributes<HTMLTableSectionElement>>;
function useButton(props: AriaButtonProps<'th'>, ref: RefObject<HTMLTableHeaderCellElement>): ButtonAria<HTMLAttributes<HTMLTableHeaderCellElement>>;
function useButton(props: AriaButtonProps<'thead'>, ref: RefObject<HTMLTableSectionElement>): ButtonAria<HTMLAttributes<HTMLTableSectionElement>>;
function useButton(props: AriaButtonProps<'time'>, ref: RefObject<HTMLTimeElement>): ButtonAria<HTMLAttributes<HTMLTimeElement>>;
function useButton(props: AriaButtonProps<'title'>, ref: RefObject<HTMLTitleElement>): ButtonAria<HTMLAttributes<HTMLTitleElement>>;
function useButton(props: AriaButtonProps<'track'>, ref: RefObject<HTMLTrackElement>): ButtonAria<HTMLAttributes<HTMLTrackElement>>;
function useButton(props: AriaButtonProps<'ul'>, ref: RefObject<HTMLUListElement>): ButtonAria<HTMLAttributes<HTMLUListElement>>;
function useButton(props: AriaButtonProps<'video'>, ref: RefObject<HTMLVideoElement>): ButtonAria<HTMLAttributes<HTMLVideoElement>>;
function useButton(props: AriaButtonProps<ElementType>, ref: RefObject<HTMLElement>): ButtonAria<HTMLElement>;
function useButton(props: AriaButtonProps<ElementType>, ref: RefObject<any>): ButtonAria<any> {
  let {
    elementType = 'button',
    isDisabled,
    onPress,
    onPressStart,
    onPressEnd,
    onPressChange,
    // @ts-ignore
    onClick: deprecatedOnClick,
    href,
    target,
    rel,
    type = 'button'
  } = props;
  let additionalProps;
  if (elementType !== 'button') {
    additionalProps = {
      role: 'button',
      tabIndex: isDisabled ? undefined : 0,
      href: elementType === 'a' && isDisabled ? undefined : href,
      target: elementType === 'a' ? target : undefined,
      type: elementType === 'input' ? type : undefined,
      disabled: elementType === 'input' ? isDisabled : undefined,
      'aria-disabled': !isDisabled || elementType === 'input' ? undefined : isDisabled,
      rel: elementType === 'a' ? rel : undefined
    };
  }

  let {pressProps, isPressed} = usePress({
    onPressStart,
    onPressEnd,
    onPressChange,
    onPress,
    isDisabled,
    ref
  });

  let {focusableProps} = useFocusable(props, ref);
  let buttonProps = mergeProps(focusableProps, pressProps);
  buttonProps = mergeProps(buttonProps, filterDOMProps(props, {labelable: true}));

  return {
    isPressed, // Used to indicate press state for visual
    buttonProps: mergeProps(buttonProps, {
      'aria-haspopup': props['aria-haspopup'],
      'aria-expanded': props['aria-expanded'],
      'aria-controls': props['aria-controls'],
      'aria-pressed': props['aria-pressed'],
      disabled: isDisabled,
      type,
      ...(additionalProps || {}),
      onClick: (e) => {
        if (deprecatedOnClick) {
          deprecatedOnClick(e);
          console.warn('onClick is deprecated, please use onPress');
        }
      }
    })
  };
}

export {useButton};
