import {Code, styles as codeStyles} from './Code';
import {DisclosureRow} from './DisclosureRow';
import React from 'react';
import {renderHTMLfromMarkdown, setLinks, TComponent, TInterface, Type} from './types';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from './Table';

const GROUPS = {
  Content: [
    'children', 'items', 'defaultItems', 'columns', 'loadingState', 'onLoadMore', 'renderEmptyState', 'dependencies'
  ],
  Selection: [
    'selectionMode', 'selectionBehavior', 'selectedKeys', 'defaultSelectedKeys', 'selectedKey', 'defaultSelectedKey', 'onSelectionChange', 'disabledKeys', 'disabledBehavior', 'disallowEmptySelection', 'shouldSelectOnPressUp', 'shouldFocusWrap', 'shouldFocusOnHover', 'escapeKeyBehavior'
  ],
  Value: [
    'value', 'defaultValue', 'onChange', 'onChangeEnd', 'inputValue', 'defaultInputValue', 'onInputChange', 'formatOptions'
  ],
  Labeling: [
    'label', 'labelPosition', 'labelAlign', 'contextualHelp'
  ],
  Validation: [
    'minValue', 'maxValue', 'step', 'isRequired', 'isInvalid', 'validate', 'validationBehavior', 'necessityIndicator', 'description', 'errorMessage'
  ],
  Overlay: [
    'isOpen', 'defaultOpen', 'onOpenChange', 'shouldCloseOnSelect', 'placement', 'direction', 'align', 'shouldFlip', 'menuWidth'
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
    'name', 'startName', 'endName', 'value', 'formValue', 'type', 'autoComplete', 'form', 'formTarget', 'formNoValidate', 'formMethod', 'formMethod', 'formEncType', 'formAction'
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

const codeStyle = style({font: {default: 'code-xs', lg: 'code-sm'}});

interface PropTableProps {
  component: TComponent,
  links: any,
  showDescription?: boolean
}

export function PropTable({component, links, showDescription}: PropTableProps) {
  let properties = component?.props?.type === 'interface' ? component.props.properties : null;
  if (!properties) {
    return null;
  }

  return (
    <>
      {component.description && showDescription && <div className={style({font: 'body'})}>{renderHTMLfromMarkdown(component.description, {forceInline: false, forceBlock: true})}</div>}
      <GroupedPropTable
        properties={properties}
        links={links}
        propGroups={GROUPS}
        defaultExpanded={DEFAULT_EXPANDED} />
    </>
  );
}

interface GroupedPropTableProps {
  properties: TInterface['properties'],
  links: any,
  propGroups?: {[name: string]: (string | RegExp)[]},
  defaultExpanded?: Set<string>
}

export function GroupedPropTable({properties, links, propGroups = GROUPS, defaultExpanded = DEFAULT_EXPANDED}: GroupedPropTableProps) {
  setLinks(links);

  let [props, groups] = groupProps(properties, propGroups);
  // let properties = Object.values(props).filter(prop => prop.type === 'property' && prop.access !== 'private' && prop.access !== 'protected').reverse();

  // properties.sort((a, b) => a.name.localeCompare(b.name));

  // Default to showing required indicators if some properties are optional but not all.
  // let showRequired = !properties.every(p => p.optional) && !properties.every(p => !p.optional);

  // Show default values by default if any of the properties have one defined.
  let showDefault = Object.values(props).some(p => !!p.default);

  return (
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
      {Object.keys(groups).map((group) => (
        <DisclosureRow key={group} title={group} defaultExpanded={defaultExpanded?.has(group)}>
          <Rows props={groups[group]} showDefault={showDefault} />
        </DisclosureRow>
      ))}
    </Table>
  );
}

function Rows({props, showDefault}: {props: TInterface['properties'], showDefault?: boolean}) {
  let properties = Object.values(props);

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
          <TableCell hideBorder={!!prop.description} styles={prop.default ? undefined : style({display: {default: 'none', sm: '[table-cell]'}})}>
            <strong className={style({font: 'ui', fontWeight: 'bold', display: {sm: 'none'}})}>Default: </strong>
            {prop.default
              ? <span className={codeStyle}><Code lang="tsx">{prop.default}</Code></span>
              : '—'
            }
          </TableCell>
        }
      </TableRow>
      {prop.description && <TableRow>
        <TableCell colSpan={3}>{renderHTMLfromMarkdown(prop.description, {forceInline: true})}</TableCell>
      </TableRow>}
    </React.Fragment>
  ));
}

function groupProps(
  props: TInterface['properties'],
  propGroups: {[name: string]: (string | RegExp)[]} = GROUPS
): [TInterface['properties'], {[name: string]: TInterface['properties']}] {
  props = Object.fromEntries(Object.entries(props).filter(([, prop]) => prop.type === 'property' && prop.access !== 'private' && prop.access !== 'protected'));
  let groups = {};

  // Default groups
  for (let group in propGroups) {
    let groupProps = {};
    for (let propName of propGroups[group]) {
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

        if (propName === 'type' && group === 'Forms' && !props[propName].description?.includes('form')) {
          continue;
        }

        if (propName === 'children' && group === 'Content' && !props.items && !props.columns) {
          continue;
        }

        if (propName === 'target' && props[propName].value.type !== 'identifier') {
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
