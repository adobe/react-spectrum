import React from 'react';
import tableStyles from '@adobe/spectrum-css-temp/components/table/vars.css';
import styles from './docs.css';

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
      <PropGroup props={ungrouped} links={links} />
      {Object.keys(groups).map(group => (
        <>
          <h2>{group}</h2>
          <PropGroup props={groups[group]} links={links} />
        </>
      ))}
    </>
  );
}

function PropGroup({props, links}) {
  return (
    <table className={`${tableStyles['spectrum-Table']} ${tableStyles['spectrum-Table--quiet']} ${styles.propTable}`}>
      <thead>
        <tr>
          <td className={tableStyles['spectrum-Table-headCell']}>Name</td>
          <td className={tableStyles['spectrum-Table-headCell']}>Type</td>
          <td className={tableStyles['spectrum-Table-headCell']}>Default</td>
          <td className={tableStyles['spectrum-Table-headCell']}>Required</td>
          <td className={tableStyles['spectrum-Table-headCell']}>Description</td>
        </tr>
      </thead>
      <tbody className={tableStyles['spectrum-Table-body']}>
        {props.map((prop, index) => {
          let type = prop.value.type.toString();
          if (type === 'link') {
            type = links[prop.value.id].name;
          }
          return (
            <tr key={index} className={tableStyles['spectrum-Table-row']}>
              <td className={tableStyles['spectrum-Table-cell']}>{prop.name}</td>
              <td className={tableStyles['spectrum-Table-cell']}>{type}</td>
              <td className={tableStyles['spectrum-Table-cell']}>{prop.default || '-'}</td>
              <td className={tableStyles['spectrum-Table-cell']}>{!prop.optional ? 'true' : null}</td>
              <td className={tableStyles['spectrum-Table-cell']}>{prop.description}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function groupProps(props) {
  props = Object.assign({}, props);
  let groups = {};

  // Default groups
  for (let group in GROUPS) {
    let groupProps = [];
    for (let propName of GROUPS[group]) {
      if (propName instanceof RegExp) {
        for (let key in props) {
          if (propName.test(key)) {
            groupProps.push(props[key]);
            delete props[key];
          }
        }

        continue;
      }

      if (props[propName]) {
        groupProps.push(props[propName]);
        delete props[propName];
      }
    }

    if (groupProps.length) {
      groups[group] = groupProps;
    }
  }

  let ungrouped = Object.values(props);
  return [ungrouped, groups];
}
