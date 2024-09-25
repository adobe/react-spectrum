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

import {AriaLabelingProps, DOMProps, DOMRef, StyleProps} from '@react-types/shared';
import {Button, UNSTABLE_DisclosureGroup as DisclosureGroup, DisclosureGroupProps, DisclosurePanelProps, DisclosureProps, Heading, UNSTABLE_Disclosure as RACDisclosure, UNSTABLE_DisclosurePanel as RACDisclosurePanel} from 'react-aria-components';
import ChevronLeftMedium from '@spectrum-icons/ui/ChevronLeftMedium';
import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import React, {forwardRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/accordion/vars.css';
import {useLocale} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

export interface SpectrumAccordionProps extends Omit<DisclosureGroupProps, 'className' | 'style' | 'children'>, StyleProps, DOMProps, AriaLabelingProps {
  /** The disclosures within the accordion group. */
  children: React.ReactNode
}

function Accordion(props: SpectrumAccordionProps, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let {styleProps} = useStyleProps(props);
  let domRef = useDOMRef(ref);
  return (
    <DisclosureGroup
      {...props}
      {...styleProps}
      ref={domRef}
      className={classNames(styles, 'spectrum-Accordion', styleProps.className)}>
      {props.children}
    </DisclosureGroup>
  );
}

export interface SpectrumDisclosureProps extends Omit<DisclosureProps, 'className' | 'style' | 'children'>, AriaLabelingProps  {
  /** The contents of the disclosure. The first child should be the header, and the second child should be the panel. */
  children: React.ReactNode
}

function Disclosure(props: SpectrumDisclosureProps, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let domRef = useDOMRef(ref);
  return (
    <RACDisclosure
      {...props}
      ref={domRef}
      className={({isExpanded, isDisabled}) => classNames(styles, 'spectrum-Accordion-item', {
        'is-expanded': isExpanded,
        'is-disabled': isDisabled
      })}>
      {props.children}
    </RACDisclosure>
  );
}

export interface SpectrumDisclosurePanelProps extends Omit<DisclosurePanelProps, 'className' | 'style' | 'children'>, DOMProps, AriaLabelingProps {
  /** The contents of the accordion panel. */
  children: React.ReactNode
}

function DisclosurePanel(props: SpectrumDisclosurePanelProps, ref: DOMRef<HTMLDivElement>) {
  let domRef = useDOMRef(ref);
  return (
    <RACDisclosurePanel ref={domRef} className={classNames(styles, 'spectrum-Accordion-itemContent')} {...props}>
      {props.children}
    </RACDisclosurePanel>
  );
}

export interface SpectrumDisclosureHeaderProps extends DOMProps, AriaLabelingProps {
  /** 
   * The heading level of the disclosure header.
   * @default 3
   */
  level?: number,
  /** The contents of the disclosure header. */
  children: React.ReactNode
}

function DisclosureHeader(props: SpectrumDisclosureHeaderProps, ref: DOMRef<HTMLHeadingElement>) {
  let {level = 3} = props;
  let {direction} = useLocale();
  let domRef = useDOMRef(ref);
  return (
    <Heading ref={domRef} level={level} className={classNames(styles, 'spectrum-Accordion-itemHeading')}>
      <Button
        slot="trigger"
        className={({isHovered, isFocusVisible}) => classNames(styles, 'spectrum-Accordion-itemHeader', {
          'is-hovered': isHovered,
          'focus-ring': isFocusVisible
        })}>
        {direction === 'ltr' ? (
          <ChevronRightMedium
            aria-hidden="true"
            UNSAFE_className={classNames(styles, 'spectrum-Accordion-itemIndicator')} />
              ) : (
                <ChevronLeftMedium
                  aria-hidden="true"
                  UNSAFE_className={classNames(styles, 'spectrum-Accordion-itemIndicator')} />
              )}
        {props.children}
      </Button>
    </Heading>
  );
}

/** A group of disclosures that can be expanded and collapsed. */
const _Accordion = forwardRef(Accordion) as (props: SpectrumAccordionProps & {ref?: DOMRef<HTMLDivElement>}) => ReturnType<typeof Accordion>;
export {_Accordion as Accordion};

/** A collapsible section of content composed of a heading that expands and collapses a panel. */
const _Disclosure = forwardRef(Disclosure) as (props: SpectrumDisclosureProps & {ref?: DOMRef<HTMLDivElement>}) => ReturnType<typeof Disclosure>;
export {_Disclosure as Disclosure};

/** The panel that contains the content of an disclosure. */
const _DisclosurePanel = forwardRef(DisclosurePanel) as (props: SpectrumDisclosurePanelProps & {ref?: DOMRef<HTMLDivElement>}) => ReturnType<typeof DisclosurePanel>;
export {_DisclosurePanel as DisclosurePanel};

/** The heading of the disclosure. */
const _DisclosureHeader = forwardRef(DisclosureHeader) as (props: SpectrumDisclosureHeaderProps & {ref?: DOMRef<HTMLDivElement>}) => ReturnType<typeof DisclosureHeader>;
export {_DisclosureHeader as DisclosureHeader};
