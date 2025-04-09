"use client";

import { Children, cloneElement, createContext, Fragment, isValidElement, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { LinkButton, Text, Button, ToggleButtonGroup, ToggleButton, Divider, ActionButtonGroup, ActionButton, TooltipTrigger, Tooltip, MenuTrigger, Menu, MenuItem, Picker, PickerItem, ContextualHelp, Heading, Content, Switch, NumberField, Footer, TextField, SegmentedControl, SegmentedControlItem, NotificationBadge, Avatar } from '@react-spectrum/s2';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
import Copy from '@react-spectrum/s2/icons/Copy';
import Link from '@react-spectrum/s2/icons/Link';
import More from '@react-spectrum/s2/icons/More';
import ExportTo from '@react-spectrum/s2/icons/ExportTo';
import { Key } from "react-aria-components";
import { IconPicker } from "./IconPicker";

const Context = createContext({
  component: 'div',
  name: 'Button',
  importSource: '',
  controls: {},
  props: {},
  setProps: (v: any) => {}
});

export function VisualExampleClient({component, name, importSource, controls, children, initialProps = {}}) {
  let [props, setProps] = useState(() => {
    let props = {};
    for (let name in controls) {
      let defaultValue = controls[name].default;
      props[name] = defaultValue;
    }

    Object.assign(props, initialProps);
    return props;
  });

  useEffect(() => {
    let params = new URLSearchParams(location.search);
    let newProps = {...props};
    for (let name in controls) {
      try {
        let param = params.get(name);
        if (param) {
          newProps[name] = JSON.parse(param);
        }
      } catch {
        // ignore
      }
    }
    setProps(newProps);
  }, []);

  return (
    <Context.Provider value={{component: component || Button, name, importSource: importSource, controls, props, setProps}}>
      {children}
    </Context.Provider>
  );
}

function getBackgroundColor(staticColor) {
  if (staticColor === 'black') {
    return 'linear-gradient(to right,#ddd6fe,#fbcfe8)';
  } else if (staticColor === 'white') {
    return 'linear-gradient(to right,#0f172a,#334155)';
  }
  return undefined;
}

export function Output() {
  let {component: Component, props} = useContext(Context);
  return (
    <div className={style({display: 'flex', justifyContent: 'center', alignItems: 'center', width: 'full', overflow: 'auto', gridArea: 'example', borderRadius: 'lg', font: 'ui', padding: 24, boxSizing: 'border-box'})} style={{background: getBackgroundColor(props.staticColor)}}>
      {isValidElement(Component) ? cloneElement(Component, props) : renderComponent(Component, props)}
    </div>
  );
}

function renderComponent(Component, props) {
  let children = props.children;
  if (children?.iconJSX || children?.avatar || children?.badge) {
    children = (
      <>
        {children.avatar ? <Avatar src="https://i.imgur.com/xIe7Wlb.png" /> : children.iconJSX}
        {children.text && <Text>{children.text}</Text>}
        {children.badge && <NotificationBadge value={12} />}
      </>
    );
  } else if (children?.text != null) {
    children = children.text;
  }

  return <Component {...props}>{children}</Component>
}

export function CodeOutput({code}) {
  let {name, importSource, props, controls} = useContext(Context);
  let codeRef = useRef<Element | null>(null);
  return (
    <div className={style({backgroundColor: 'layer-2', borderRadius: 'lg', padding: 16, position: 'relative'})}>
      <div className={style({display: 'flex', justifyContent: 'end', position: 'absolute', right: 0, paddingX: 16})}>
        <ActionButtonGroup
          orientation="vertical"
          isQuiet
          density="regular"
          size="S">
          <TooltipTrigger placement="end">
            <ActionButton aria-label="Copy code" onPress={() => navigator.clipboard.writeText(codeRef.current!.textContent!)}>
              <Copy />
            </ActionButton>
            <Tooltip>
              Copy code
            </Tooltip>
          </TooltipTrigger>
          <MenuTrigger>
          <TooltipTrigger placement="end">
            <ActionButton aria-label="Share">
              <More />
            </ActionButton>
            <Tooltip>
              Share
            </Tooltip>
          </TooltipTrigger>
          <Menu>
            <MenuItem onAction={() => {
              let url = new URL(location.href);
              for (let prop in props) {
                if (props[prop] != null) {
                  url.searchParams.set(prop, JSON.stringify(props[prop]));
                }
              }
              navigator.clipboard.writeText(url.toString());
            }}>
              <Link />
              <Text slot="label">Copy Link</Text>
            </MenuItem>
            <MenuItem>
              <ExportTo />
              <Text slot="label">Open in CodeSandbox</Text>
            </MenuItem>
            <MenuItem>
              <ExportTo />
              <Text slot="label">Open in StackBlitz</Text>
            </MenuItem>
          </Menu>
          </MenuTrigger>
        </ActionButtonGroup>
      </div>
      <pre ref={codeRef} className={style({borderRadius: 'lg', font: 'code-sm', whiteSpace: 'pre-wrap'})}>
        <code>
          {importSource ? renderImports(name, importSource, props) : null}
          {code || renderElement(name, props, controls)}
        </code>
      </pre>
    </div>
  );
}

export function CodeProps() {
  let {props, controls} = useContext(Context);
  let renderedProps = Object.keys(props).filter(prop => prop !== 'children').map(prop => renderProp(prop, props[prop], controls[prop])).filter(Boolean);
  return renderedProps;
}

function renderElement(name, props, controls) {
  let start = <>&lt;<span className={style({color: 'red-1000'})}>{name}</span></>;
  let renderedProps = Object.keys(props).filter(prop => prop !== 'children').map(prop => renderProp(prop, props[prop], controls?.[prop])).filter(Boolean);
  let newlines = name.length + countChars(renderedProps) > 40;
  if (newlines) {
    renderedProps = renderedProps.map((p, i) => <Fragment key={i}>{'\n '}{p}</Fragment>);
  }
  if (props.children) {
    let end = <>&lt;/<span className={style({color: 'red-1000'})}>{name}</span>&gt;</>;
    let children = renderChildren(props.children);
    if (typeof children !== 'string') {
      newlines = true;
    }
    return <>{start}{renderedProps}&gt;{newlines ? '\n  ' : null}{children}{newlines ? '\n' : null}{end}</>
  }

  return <>{start}{renderedProps} /&gt;</>;
}

function renderChildren(children) {
  if (children?.icon || children?.avatar || children?.badge) {
    let result: ReactNode = null;
    if (children.avatar) {
      result = renderElement('Avatar', {src: 'https://i.imgur.com/xIe7Wlb.png'}, null);
    } else if (children.icon) {
      result = renderElement(children.icon.replace(/^(\d)/, '_$1'), {}, null);
    }

    if (children.text) {
      let text = renderElement('Text', {children: children.text}, null);
      result = <>{result}{result ? '\n  ' : null}{text}</>;
    }

    if (children.badge) {
      let badge = renderElement('NotificationBadge', {value: 12}, null);
      result = <>{result}{result ? '\n  ' : null}{badge}</>;
    }
    
    return result
  } else if (children?.text) {
    return children.text;
  }

  return children;
}

function countChars(element) {
  if (typeof element === 'string') {
    return element.length;
  } else if (Array.isArray(element)) {
    return element.reduce((p, i) => p + countChars(i), 0);
  } else if (element && typeof element === 'object' && element.props) {
    return countChars(element.props.children);
  }
  return 0;
}

function renderProp(name, value, control) {
  if (value === control?.default) {
    return null;
  }

  let propName = <span className={style({color: 'indigo-1000'})}>{name}</span>;
  let propValue: any = null;
  if (typeof value === 'string') {
    propValue = <span className={style({color: 'green-1000'})}>"{value}"</span>;
  } else if (typeof value === 'number') {
    propValue = <>{'{'}<span className={style({color: 'pink-1000'})}>{String(value)}</span>{'}'}</>;
  } else if (typeof value === 'boolean') {
    if (value === false && control?.optional) {
      return null;
    }
    propValue = value === false ? <>{'{'}<span className={style({color: 'magenta-1000'})}>{String(value)}</span>{'}'}</> : null;
  } else if (value == null) {
    return null;
  } else if (typeof value === 'object') {
    propValue = <>{'{'}{renderValue(value)}{'}'}</>;
  }

  if (propValue) {
    propValue = <>={propValue}</>;
  }

  return <Fragment key={name}> {propName}{propValue}</Fragment>
}

function renderValue(value) {
  switch (typeof value) {
    case 'string':
      return <span className={style({color: 'green-1000'})}>"{value}"</span>;
    case 'number':
      return <span className={style({color: 'pink-1000'})}>{String(value)}</span>;
    case 'boolean':
      return <span className={style({color: 'magenta-1000'})}>{String(value)}</span>;
    case 'object':
      if (value == null) {
        return <span className={style({color: 'magenta-1000'})}>{String(value)}</span>;
      }
      let entries = Object.entries(value);
      return <>{'{'}{entries.map(([name, value], i) => {
        let result = <><span className={style({color: 'indigo-1000'})}>{name}</span>: {renderValue(value)}</>;
        if (i < entries.length - 1) {
          result = <>{result}, </>;
        }
        return <Fragment key={i}>{result}</Fragment>;
      })}{'}'}</>;
  }
}

function renderImports(name, importSource, props) {
  let imports: ReactNode[] = [];
  let components = [name];
  if (props.children?.avatar) {
    components.push('Avatar');
  }
  if (props.children?.badge) {
    components.push('NotificationBadge');
  }

  if (components.length > 1 || props.children?.icon) {
    components.push('Text');
  }
  
  imports.push(renderImport(components.join(', '), importSource));

  if (props.children?.icon && !props.children?.avatar) {
    imports.push('\n', renderImport(props.children.icon.replace(/^(\d)/, '_$1'), `@react-spectrum/s2/icons/${props.children.icon}`, true));
  }
  
  imports.push('\n\n');
  return imports;
}

function renderImport(name, from, isDefault = false) {
  return <Fragment key={from}><span className={style({color: 'magenta-1000'})}>import</span> {isDefault ? null : '{'}{name}{isDefault ? null : '}'} <span className={style({color: 'magenta-1000'})}>from</span> <span className={style({color: 'green-1000'})}>'{from}'</span>;</Fragment>
}

export function Control({name}) {
  let {controls, props, setProps} = useContext(Context);
  let control = controls[name];
  let value = props[name];
  let onChange = (value) => {
    setProps(props => ({...props, [name]: value}));
  };

  switch (control.value.type) {
    case 'boolean':
      return <BooleanControl control={control} value={value} onChange={onChange} />;
    case 'union':
      return <UnionControl control={control} value={value} onChange={onChange} />;
    case 'number':
      return <NumberControl control={control} value={value} onChange={onChange} />;
    case 'identifier':
      if (control.value.name === 'Intl.NumberFormatOptions') {
        return <NumberFormatControl control={control} value={value} onChange={onChange} />;
      }
      if (name === 'contextualHelp') {
        return <ContextualHelpControl control={control} value={value} onChange={onChange} />;
      }
      if (control.value.name === 'ReactNode') {
        return <ChildrenControl control={control} value={value} onChange={onChange} />;
      }
      break;
    case 'string':
      return <StringControl control={control} value={value} onChange={onChange} />;
    default:
      console.warn(control)
  }
}

function BooleanControl({control, value, onChange}) {
  return (
    <Wrapper control={control}>
      <Switch isSelected={value || false} onChange={onChange} aria-label={control.name} />
    </Wrapper>
  );
  // return (
  //   <Wrapper control={control}>
  //     <ToggleButton isSelected={value || false} onChange={onChange} styles={style({width: 'fit'})}>{String(value || false)}</ToggleButton>
  //   </Wrapper>
  // );
}

function UnionControl({control, value, onChange}) {
  if (control.value.elements.reduce((p, v) => p + v.value).length > 30) {
    return (
      <Picker label={control.name} contextualHelp={<PropContextualHelp control={control} />} selectedKey={value} onSelectionChange={onChange} styles={style({width: 160})}>
        {control.value.elements.map(element => (
          <PickerItem key={element.value} id={element.value}>{element.value}</PickerItem>
        ))}
      </Picker>
    );
  }

  return (
    <Wrapper control={control}>
      <ToggleButtonGroup aria-label={control.name} disallowEmptySelection={!control.optional || !!control.default} selectedKeys={[value]} onSelectionChange={keys => onChange([...keys][0])} density="compact" styles={style({marginY: 4})}>
        {control.value.elements.map(element => (
          <ToggleButton key={element.value} id={element.value}>{element.value}</ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Wrapper>
  );
}

function Wrapper({control, children}) {
  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 4})}>
      <span className={style({font: 'control', color: 'neutral-subdued'})({})}>{control.name}&nbsp;{control.description ? <div style={{display: 'inline-flex'}}><PropContextualHelp control={control} /></div> : null}</span>
      {children}
    </div>
  );
}

function PropContextualHelp({control}) {
  if (!control.description) {
    return null;
  }

  return (
    <ContextualHelp variant="info" size="XS">
      <Heading>{control.name}</Heading>
      <Content>{control.description}</Content>
      <Footer><code className={style({font: 'code-xs'})}>{control.valueType}</code></Footer>
    </ContextualHelp>
  );
}

function NumberControl({control, value, onChange}) {
  return (
    <NumberField
      label={control.name}
      contextualHelp={<PropContextualHelp control={control} />}
      value={value}
      onChange={onChange}
      styles={style({width: 120})} />
  );
}

function NumberFormatControl({control, value, onChange}) {
  return (
    <Picker
      label={control.name}
      contextualHelp={<PropContextualHelp control={control} />}
      selectedKey={value?.style || 'decimal'}
      onSelectionChange={id => {
        switch (id) {
          case 'decimal':
            onChange({style: 'decimal'});
            break;
          case 'percent':
            onChange({style: 'percent'});
            break;
          case 'currency':
            onChange({style: 'currency', currency: 'USD'});
            break;
          case 'unit':
            onChange({style: 'unit', unit: 'inch'});
            break;
        }
      }}
      styles={style({width: 160})}>
      <PickerItem id="decimal">Decimal</PickerItem>
      <PickerItem id="percent">Percent</PickerItem>
      <PickerItem id="currency">Currency</PickerItem>
      <PickerItem id="unit">Unit</PickerItem>
    </Picker>
  )
}

function StringControl({control, value, onChange}) {
  return (
    <TextField
      label={control.name}
      contextualHelp={<PropContextualHelp control={control} />}
      value={value || ''}
      onChange={onChange}
      styles={style({width: 160})} />
  )
}

function ChildrenControl({control, value, onChange}) {
  if (control.icon) {
    let objectValue = typeof value === 'string' ? {text: value} : value;
    return (
      <Wrapper control={control}>
        <div className={style({display: 'flex', gap: 4})}>
          <TextField
            aria-label={control.name}
            value={objectValue?.text || ''}
            onChange={text => onChange({...objectValue, text})}
            styles={style({width: 80, flexGrow: 1})} />
          <IconPicker
            value={value}
            onChange={onChange} />
        </div>
        {(control.avatar || control.badge) &&
          <ToggleButtonGroup density="compact" isJustified>
            {control.avatar && 
              <ToggleButton
                isSelected={objectValue?.avatar ?? false}
                onChange={avatar => onChange({...objectValue, avatar})}>
                Avatar
              </ToggleButton>
            }
            {control.badge && 
              <ToggleButton
                isSelected={objectValue?.badge ?? false}
                onChange={badge => onChange({...objectValue, badge})}>
                Badge
              </ToggleButton>
            }
          </ToggleButtonGroup>
        }
      </Wrapper>
    );
  }

  return <StringControl control={control} value={value} onChange={onChange} />;
}

function ContextualHelpControl({control, value, onChange}) {
  return (
    <Wrapper control={control}>
      <Switch isSelected={!!value} onChange={v => onChange(v ? <ContextualHelp><Heading>Heeading</Heading><Content>Content</Content></ContextualHelp> : null)} aria-label={control.name} />
    </Wrapper>
  );
}

const exampleStyle = style({
  backgroundColor: 'layer-1',
  marginTop: 20,
  borderRadius: 'xl',
  display: 'flex',
  flexDirection: 'column'
});

const childIndex = {
  vanilla: 0,
  tailwind: 1,
  macro: 2
}

export function StylingExamples({children}) {
  let [selected, setSelected] = useState<Key>('vanilla');

  return (
    <div className={exampleStyle}>
      <SegmentedControl selectedKey={selected} onSelectionChange={setSelected} styles={style({marginTop: 20, marginStart: 20})}>
        <SegmentedControlItem id="vanilla">Vanilla CSS</SegmentedControlItem>
        <SegmentedControlItem id="tailwind">Tailwind</SegmentedControlItem>
        {children.length >= 3 ? <SegmentedControlItem id="macro">Style Macro</SegmentedControlItem> : null}
      </SegmentedControl>
      {children[childIndex[selected]]}
    </div>
  );
}
