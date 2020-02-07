import {InterfaceBody, InterfaceTable, Type, TypeContext} from './types';
import React from 'react';

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

  let usedLinks = {};
  walkLinks(component.props.properties);

  function walkLinks(obj) {
    walk(obj, (t, k, recurse) => {
      if (t && t.type === 'link') {
        usedLinks[t.id] = links[t.id];
        walkLinks(links[t.id]);
      }

      return recurse(t);
    });
  }

  return (
    <>
      <TypeContext.Provider value={links}>
        <InterfaceTable>
          <InterfaceBody properties={ungrouped} />
          {Object.keys(groups).map(group => (
            <>
              <InterfaceBody header={group} properties={groups[group]} />
            </>
          ))}
        </InterfaceTable>
        {Object.values(usedLinks).map(link => (
          <section id={link.id} data-title={link.name} hidden>
            <Type type={link} />
          </section>
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

function walk(obj, fn, k = null) {
  let recurse = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map((item, i) => walk(item, fn, k));
    } else if (obj && typeof obj === 'object') {
      let res = {};
      for (let key in obj) {
        res[key] = walk(obj[key], fn, key);
      }
      return res;
    } else {
      return obj;
    }
  };

  return fn(obj, k, recurse);
}
