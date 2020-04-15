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

import ChevronRight from '@spectrum-icons/workflow/ChevronRight';
import {InterfaceType, TypeContext} from './types';
import React from 'react';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

const GROUPS = {
  Events: [
    /^on[A-Z]/
  ],
  Layout: [
    'flex', 'flexGrow', 'flexShrink', 'flexDirection', 'flexWrap', 'flexBasis', 'alignItems', 'alignContent', 'alignSelf', 'justifyItems', 'justifyContent', 'justifySelf', 'order', 'flexOrder',
    'gridTemplateColumns', 'gridTemplateRows', 'gridTemplateAreas', 'gridArea', 'gridColumn', 'gridRow', 'gridGap', 'gridColumnGap', 'gridRowGap', 'gridAutoFlow', 'gridAutoColumns', 'gridAutoRows',
    'gridColumnStart', 'gridColumnEnd', 'gridRowStart', 'gridRowEnd', 'slot',
    'overflow'
  ],
  Spacing: [
    'margin', 'marginTop', 'marginLeft', 'marginRight', 'marginBottom', 'marginStart', 'marginEnd', 'marginX', 'marginY',
    'padding', 'paddingTop', 'paddingLeft', 'paddingRight', 'paddingBottom', 'paddingStart', 'paddingEnd', 'paddingX', 'paddingY'
  ],
  Sizing: [
    'width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'maxHeight'
  ],
  Background: [
    'background', 'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat',
    'opacity' // ???
  ],
  Borders: [
    'border',
    'borderX',
    'borderY',
    'borderStyle',
    'borderTop',
    'borderLeft',
    'borderRight',
    'borderTop',
    'borderBottom',
    'borderWidth', 'borderStartWidth', 'borderEndWidth', 'borderLeftWidth', 'borderRightWidth', 'borderTopWidth', 'borderBottomWidth', 'borderXWidth', 'borderYWidth',
    'borderColor', 'borderStartColor', 'borderEndColor', 'borderLeftColor', 'borderRightColor', 'borderTopColor', 'borderBottomColor', 'borderXColor', 'borderYColor',
    'borderRadius', 'borderTopStartRadius', 'borderTopEndRadius', 'borderBottomStartRadius', 'borderBottomEndRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'
  ],
  Shadows: [
    'boxShadow',
    'textShadow'
  ],
  Positioning: [
    'position', 'top', 'bottom', 'left', 'right', 'start', 'end', 'zIndex', 'isHidden', 'hidden', 'display'
  ],
  Typography: [
    'font',
    'fontFamily',
    'fontSize',
    'fontStyle',
    'textAlign',
    'verticalAlign',
    'lineHeight',
    'letterSpacing',
    'color'
  ],
  Accessibility: [
    'role', 'id', 'tabIndex', /^aria-/
  ]
};

export function PropTable({component, links}) {
  let [ungrouped, groups] = groupProps(component.props.properties);

  return (
    <>
      <TypeContext.Provider value={links}>
        <InterfaceType properties={ungrouped} showRequired showDefault />
        {Object.keys(groups).map(group => (
          <details>
            <summary className={typographyStyles['spectrum-Heading4']}>
              <ChevronRight size="S" />
              {group}
            </summary>
            <InterfaceType properties={groups[group]} showRequired showDefault />
          </details>
        ))}
      </TypeContext.Provider>
    </>
  );
}

function groupProps(props) {
  props = Object.assign({}, props);
  let groups = {};

  // Default groups
  for (let group in GROUPS) {
    let groupProps = {};
    for (let propName of GROUPS[group]) {
      if (propName instanceof RegExp) {
        for (let key in props) {
          if (propName.test(key)) {
            groupProps[key] = props[key];
            delete props[key];
          }
        }

        continue;
      }

      if (props[propName]) {
        groupProps[propName] = props[propName];
        delete props[propName];
      }
    }

    if (Object.keys(groupProps).length) {
      groups[group] = groupProps;
    }
  }

  return [props, groups];
}
