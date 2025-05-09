import {Code, styles as codeStyles} from './Code';
import {DisclosureRow} from './DisclosureRow';
import React from 'react';
import {renderHTMLfromMarkdown, setLinks, Type} from './types';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from './Table';

const GROUPS = {
  Content: [
    'children', 'items', 'dependencies', 'renderEmptyState'
  ],
  Selection: [
    'selectionMode', 'selectionBehavior', 'selectedKeys', 'defaultSelectedKeys', 'selectedKey', 'defaultSelectedKey', 'onSelectionChange', 'disallowEmptySelection', 'disabledKeys', 'shouldFocusWrap'
  ],
  Value: [
    'value', 'defaultValue', 'onChange', 'onChangeEnd', 'formatOptions'
  ],
  Labeling: [
    'label', 'labelPosition', 'labelAlign', 'contextualHelp'
  ],
  Validation: [
    'minValue', 'maxValue', 'step', 'isRequired', 'isInvalid', 'validate', 'validationBehavior', 'necessityIndicator', 'description', 'errorMessage'
  ],
  Overlay: [
    'isOpen', 'defaultOpen', 'onOpenChange', 'placement', 'direction', 'align', 'shouldFlip', 'menuWidth'
  ],
  Events: [
    /^on[A-Z]/
  ],
  Links: [
    'href', 'hrefLang', 'target', 'rel', 'download', 'ping', 'referrerPolicy', 'routerOptions'
  ],
  Styling: [
    'style', 'className'
  ],
  Forms: [
    'form', 'formTarget', 'formNoValidate', 'formMethod', 'formMethod', 'formEncType', 'formAction', 'name', 'value', 'type', 'autoComplete'
  ],
  Accessibility: [
    'autoFocus', 'role', 'id', 'tabIndex', 'excludeFromTabOrder', 'preventFocusOnPress', /^aria-/
  ],
  Advanced: [
    'UNSAFE_className', 'UNSAFE_style', 'slot'
  ]
};

const DEFAULT_EXPANDED = new Set([
  'Content',
  'Selection',
  'Value'
]);

const codeStyle = style({font: 'code-sm'});

export function PropTable({component, links, showDescription}) {
  setLinks(links);

  let [props, groups] = groupProps(component.props.properties);
  // let properties = Object.values(props).filter(prop => prop.type === 'property' && prop.access !== 'private' && prop.access !== 'protected').reverse();

  // properties.sort((a, b) => a.name.localeCompare(b.name));

  // Default to showing required indicators if some properties are optional but not all.
  // let showRequired = !properties.every(p => p.optional) && !properties.every(p => !p.optional);

  // Show default values by default if any of the properties have one defined.
  let showDefault = Object.values(props).some(p => !!p.default);

  return (
    <>
      {component.description && showDescription && <p className={style({font: 'body'})}>{renderHTMLfromMarkdown(component.description, {forceInline: false})}</p>}
      {/* <InterfaceType properties={component.props.properties} showRequired isComponent name={component.name} /> */}
      <Table>
        <TableHeader>
          <tr>
            <TableColumn>Name</TableColumn>
            <TableColumn>Type</TableColumn>
            {showDefault && <TableColumn>Default</TableColumn>}
            {/* <TableColumn>Description</TableColumn> */}
          </tr>
        </TableHeader>
        <TableBody>
          <Rows props={props} showDefault={showDefault} />
        </TableBody>
        {Object.keys(groups).map((group, i) => (
          <DisclosureRow key={group} title={group} defaultExpanded={DEFAULT_EXPANDED.has(group)}>
            {/* <InterfaceType properties={groups[group]} showRequired isComponent name={component.name} /> */}
            <Rows props={groups[group]} showDefault={showDefault} />
          </DisclosureRow>
        ))}
      </Table>
    </>
  );
}

function Rows({props, showDefault}) {
  let properties = Object.values(props);

  // properties.sort((a, b) => a.name.localeCompare(b.name));

  return properties.map((prop, index) => (
    <React.Fragment key={index}>
      <TableRow>
        <TableCell role="rowheader" hideBorder={!!prop.description}>
          <code className={codeStyle}>
            <span className={codeStyles.attribute}>{prop.name}</span>
          </code>
          {/* {!prop.optional && showRequired
            ? <Asterisk size="XXS" UNSAFE_className={styles.requiredIcon} aria-label="Required" />
            : null
          } */}
        </TableCell>
        <TableCell hideBorder={!!prop.description}>
          <code className={codeStyle}>
            <Type type={prop.value} />
          </code>
        </TableCell>
        {showDefault &&
          <TableCell hideBorder={!!prop.description} styles={prop.default ? null : style({display: {default: 'none', sm: '[table-cell]'}})}>
            <strong className={style({font: 'body', fontWeight: 'bold', display: {sm: 'none'}})}>Default: </strong>
            {prop.default
              ? <Code lang="tsx">{prop.default}</Code>
              : '—'
            }
          </TableCell>
        }
        {/* <TableCell>{renderHTMLfromMarkdown(prop.description, {forceInline: false})}</TableCell> */}
      </TableRow>
      {prop.description && <TableRow>
        <TableCell colSpan={3}>{renderHTMLfromMarkdown(prop.description, {forceInline: true})}</TableCell>
      </TableRow>}
    </React.Fragment>
  ));
}

function groupProps(props) {
  props = Object.fromEntries(Object.entries(props).filter(([, prop]) => prop.type === 'property' && prop.access !== 'private' && prop.access !== 'protected'));
  let groups = {};

  // Default groups
  for (let group in GROUPS) {
    let groupProps = {};
    for (let propName of GROUPS[group]) {
      if (propName instanceof RegExp) {
        for (let key in props) {
          // eslint-disable-next-line max-depth
          if (propName.test(key)) {
            groupProps[key] = props[key];
            delete props[key];
          }
        }

        continue;
      }

      if (props[propName]) {
        if (propName === 'id' && props[propName].value.type !== 'string') {
          continue;
        }

        if (propName === 'value' && ((group === 'Value' && !props.defaultValue) || (group === 'Forms' && props[propName].value.type !== 'string'))) {
          continue;
        }

        if (propName === 'type' && group === 'Forms' && !props[propName].description.includes('form')) {
          continue;
        }

        if (propName === 'children' && group === 'Content' && !props.items) {
          continue;
        }

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
