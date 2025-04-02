"use client";

import { createContext, Fragment, useContext, useState } from "react";
import { LinkButton, Text, Button, ToggleButtonGroup, ToggleButton, Divider, ActionButtonGroup, ActionButton, TooltipTrigger, Tooltip, MenuTrigger, Menu, MenuItem, Picker, PickerItem, ContextualHelp, Heading, Content, Switch, NumberField } from '@react-spectrum/s2';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
import Copy from '@react-spectrum/s2/icons/Copy';
import Link from '@react-spectrum/s2/icons/Link';
import More from '@react-spectrum/s2/icons/More';
import ExportTo from '@react-spectrum/s2/icons/ExportTo';

const Context = createContext({
  component: 'div',
  name: 'Button',
  controls: {},
  props: {},
  setProps: (v: any) => {}
});

export function VisualExampleClient({component, name, controls, children, initialProps = {}}) {
  let [props, setProps] = useState(() => {
    let props = {};
    for (let name in controls) {
      let defaultValue = controls[name].default;
      props[name] = defaultValue;
    }

    Object.assign(props, initialProps);
    return props;
  });

  return (
    <Context.Provider value={{component: component || Button, name, controls, props, setProps}}>
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
    <div className={style({display: 'flex', justifyContent: 'center', alignItems: 'center', width: 'full', gridArea: 'example', borderRadius: 'lg', font: 'ui'})} style={{background: getBackgroundColor(props.staticColor)}}>
      <Component {...props} />
    </div>
  );
}

export function CodeOutput() {
  let {name, props, controls} = useContext(Context);
  return (
    <div className={style({backgroundColor: 'layer-2', borderRadius: 'lg', padding: 16, marginTop: 20, position: 'relative'})}>
      <div className={style({display: 'flex', justifyContent: 'end', position: 'absolute', right: 0, paddingX: 16})}>
        <ActionButtonGroup
          orientation="vertical"
          isQuiet
          density="regular"
          size="S">
          <TooltipTrigger placement="end">
            <ActionButton aria-label="Copy code">
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
            <MenuItem>
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
      <pre className={style({borderRadius: 'lg', font: 'code-sm', whiteSpace: 'pre-wrap'})}>
        {renderElement(name, props, controls)}
      </pre>
    </div>
  );
}

function renderElement(name, props, controls) {
  let start = <>&lt;<span className={style({color: 'red-1000'})}>{name}</span></>;
  let renderedProps = Object.keys(props).filter(prop => prop !== 'children').map(prop => renderProp(prop, props[prop], controls[prop])).filter(Boolean);
  if (renderedProps.length > 1) {
    renderedProps = renderedProps.map((p, i) => <Fragment key={i}>{'\n '}{p}</Fragment>);
  }
  if (props.children) {
    let end = <>&lt;/<span className={style({color: 'red-1000'})}>{name}</span>&gt;</>;
    return <>{start}{renderedProps}&gt;{renderedProps.length > 1 ? '\n  ' : null}{props.children}{renderedProps.length > 1 ? '\n' : null}{end}</>
  }

  return <code>{start}{renderedProps} /&gt;</code>;
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
  }

  if (propValue) {
    propValue = <>={propValue}</>;
  }

  return <Fragment key={name}> {propName}{propValue}</Fragment>
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
  //   <div className={style({display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'start'})}>
  //     <span className={style({font: 'control', color: 'neutral-subdued'})({})}>{control.name}</span>
  //     <ToggleButton isSelected={value || false} onChange={onChange}>{String(value || false)}</ToggleButton>
  //   </div>
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
      <ToggleButtonGroup disallowEmptySelection={!control.optional || !!control.default} selectedKeys={[value]} onSelectionChange={keys => onChange([...keys][0])} density="compact" styles={style({marginY: 4})}>
        {control.value.elements.map(element => (
          <ToggleButton key={element.value} id={element.value}>{element.value}</ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Wrapper>
  );
}

function Wrapper({control, children}) {
  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 2})}>
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
    </ContextualHelp>
  );
}

function NumberControl({control, value, onChange}) {
  return (
    <NumberField label={control.name}  contextualHelp={<PropContextualHelp control={control} />} value={value} onChange={onChange}  styles={style({width: 120})} />
  )
}
