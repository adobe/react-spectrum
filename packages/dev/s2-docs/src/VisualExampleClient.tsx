'use client';

import {ActionButton, Avatar, Collection, ComboBox, ComboBoxItem, Content, ContextualHelp, Footer, Header, Heading, NotificationBadge, NumberField, Picker, PickerItem, PickerSection, RangeSlider, Slider, Switch, Text, TextField, ToggleButton, ToggleButtonGroup} from '@react-spectrum/s2';
import AddCircle from '@react-spectrum/s2/icons/AddCircle';
import {baseColor, focusRing, size, style, StyleString} from '@react-spectrum/s2/style' with { type: 'macro' };
import {CenterBaseline} from '../../../@react-spectrum/s2/src/CenterBaseline';
import {CodePlatter, Pre, ShareUrlProvider} from './CodePlatter';
import {ExampleOutput} from './ExampleOutput';
import {ExampleSwitcherContext} from './ExampleSwitcher';
import {flushSync} from 'react-dom';
import {getColorChannels, parseColor} from 'react-stately';
import {ListBox, ListBoxItem, Size} from 'react-aria-components';
import {mergeStyles} from '../../../@react-spectrum/s2/style/runtime';
import type {PropControl} from './VisualExample';
import React, {createContext, Fragment, isValidElement, lazy, ReactNode, Ref, Suspense, useContext, useEffect, useMemo, useRef, useState} from 'react';
import RemoveCircle from '@react-spectrum/s2/icons/RemoveCircle';
import {TabLink} from './FileTabs';
import {useLocale} from 'react-aria';

export const IconPicker = lazy(() => import('./IconPicker').then(({IconPicker}) => ({default: IconPicker})));
let LazyIcon = lazy(() => import('./IconPicker').then(({Icon}) => ({default: Icon})));

type Props = {[name: string]: any};
type Controls = {[name: string]: PropControl};
interface ContextValue {
  component: any,
  name: string,
  importSource?: string,
  controls: Controls,
  props: Props,
  setProps(v: Props): void,
  propsObject?: string
}

const Context = createContext<ContextValue>({
  component: 'div',
  name: 'Button',
  controls: {},
  props: {},
  setProps: () => {}
});

interface VisualExampleClientProps {
  component: any,
  name: string,
  importSource?: string,
  controls: Controls,
  children: ReactNode,
  initialProps?: {[prop: string]: any},
  propsObject?: string
}

export function VisualExampleClient({component, name, importSource, controls, children, initialProps = {}, propsObject}: VisualExampleClientProps) {
  let [props, setProps] = useState(() => {
    let props = {...initialProps};
    for (let name in controls) {
      let defaultValue = controls[name].default;
      if (!(name in initialProps)) {
        props[name] = defaultValue;
      }
      if (controls[name].value.type === 'interface' && controls[name].value.name === 'Size') {
        if (typeof props[name] === 'object') {
          props[name] = new Size(props[name].width, props[name].height);
        } else {
          delete props[name];
        }
      }
    }

    return props;
  });

  let ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    // Find previous heading element.
    let node: Element | null = ref.current;
    while (node && node.parentElement?.tagName !== 'ARTICLE') {
      node = node.parentElement;
    }
    while (node && !(node instanceof HTMLHeadingElement)) {
      node = node.previousElementSibling;
    }

    let id = node instanceof HTMLHeadingElement ? node.id : null;
    if (id && location.hash === '#' + id) {
      let params = new URLSearchParams(location.search);
      let newProps = {...props};
      for (let [name, value] of params) {
        try {
          if (value) {
            newProps[name] = JSON.parse(value);
          }
        } catch {
          // ignore
        }
      }
      setProps(newProps);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let searchParams = new URLSearchParams();
  let exampleType = useContext(ExampleSwitcherContext);
  if (exampleType) {
    searchParams.set('exampleType', String(exampleType));
  }

  for (let prop in props) {
    let value = props[prop];
    if (
      value != null &&
      controls[prop] != null &&
      (controls[prop].default == null || value !== controls[prop].default)
    ) {
      searchParams.set(prop, JSON.stringify(value));
    }
  }

  let url = '?' + searchParams.toString();

  return (
    <Context.Provider value={{component, name, importSource, controls, props, setProps, propsObject}}>
      <div hidden ref={ref} />
      <ShareUrlProvider value={url}>
        {children}
      </ShareUrlProvider>
    </Context.Provider>
  );
}

export function Output({align = 'center', acceptOrientation}: {align?: 'center' | 'start' | 'end', acceptOrientation?: boolean}) {
  let {component, props, propsObject} = useContext(Context);

  if (!isValidElement(component)) {
    let children = props.children;
    if (children?.icon || children?.avatar || children?.badge) {
      let iconElement: ReactNode | null = null;
      if (children.avatar) {
        iconElement = <Avatar src="https://i.imgur.com/xIe7Wlb.png" />;
      } else if (children.icon) {
        iconElement = (<LazyIcon icon={children.icon} />);
      }

      children = (
        <>
          {iconElement}
          {children.text && <Text>{children.text}</Text>}
          {children.badge && <NotificationBadge value={12} />}
        </>
      );
    } else if (children?.text != null) {
      children = children.text;
    }

    props = {...props, children};
  }

  if (props.contextualHelp) {
    props = {
      ...props,
      contextualHelp: <ContextualHelp><Heading>Heading</Heading><Content>Content</Content></ContextualHelp>
    };
  }

  if (propsObject) {
    props = {[propsObject]: props};
  }

  return (
    <ExampleOutput
      component={component}
      props={props}
      align={align}
      orientation={acceptOrientation ? props.orientation : undefined} />
  );
}

interface CodeOutputProps {
  code?: ReactNode,
  type?: 'vanilla' | 'tailwind' | 's2',
  showCoachMark?: boolean
}

export function CodeOutput({code, type, showCoachMark}: CodeOutputProps) {
  let {name, importSource, props, controls, propsObject} = useContext(Context);

  if (propsObject) {
    props = {[propsObject]: props};
  }

  code ||= (
    <div
      className={style({
        overflow: 'auto',
        '--code-padding-end': {
          type: 'paddingEnd',
          value: 64 // Extra space for the toolbar
        }
      })}>
      <Pre>
        <code style={{fontFamily: 'inherit', WebkitTextSizeAdjust: 'none'}}>
          {importSource ? renderImports(name, importSource, props) : null}
          {renderElement(name, props, controls)}
        </code>
      </Pre>
    </div>
  );

  return (
    <CodePlatter type={type} showCoachMark={showCoachMark}>
      {code}
    </CodePlatter>
  );
}

export function CodeProps({indent = ''}) {
  let {props, controls, propsObject} = useContext(Context);
  if (propsObject) {
    props = {[propsObject]: props};
  }

  let renderedProps: ReactNode[] = Object.keys(props).filter(prop => prop !== 'children').map(prop => renderProp(prop, props[prop], controls[prop], indent)).filter(Boolean);
  let newlines = indent.length > 0 || countChars(renderedProps) > 40;
  let separator = newlines ? (indent || '  ') : ' ';
  renderedProps = renderedProps.map((p, i) => {
    let sep = separator;
    if (newlines) {
      sep = (indent && i === 0 ? '' : '\n') + separator;
    }
    return <Fragment key={i}>{sep}{p}</Fragment>;
  });
  if (newlines && indent && renderedProps.length) {
    renderedProps.push('\n');
  }
  return renderedProps;
}

function renderElement(name: string, props: Props, controls?: Controls, indent = '') {
  let start = <>&lt;<span className={style({color: 'red-1000'})}>{name}</span></>;
  let renderedProps = Object.keys(props).filter(prop => prop !== 'children').map(prop => renderProp(prop, props[prop], controls?.[prop], '  ' + indent)).filter(Boolean);
  let newlines = name.length + countChars(renderedProps) > 40;
  renderedProps = renderedProps.map((p, i) => <Fragment key={i}>{newlines ? '\n  ' + indent : ' '}{p}</Fragment>);
  if (props.children) {
    let end = <>&lt;/<span className={style({color: 'red-1000'})}>{name}</span>&gt;</>;
    let children = renderChildren(props.children, indent);
    if (typeof children !== 'string') {
      newlines = true;
    }
    return <>{start}{renderedProps}&gt;{newlines ? '\n  ' + indent : null}{children}{newlines ? '\n' + indent : null}{end}</>;
  }

  return <>{start}{renderedProps} /&gt;</>;
}

function renderChildren(children, indent = '') {
  if (children?.icon || children?.avatar || children?.badge) {
    let result: ReactNode = null;
    if (children.avatar) {
      result = renderElement('Avatar', {src: 'https://i.imgur.com/xIe7Wlb.png'}, undefined, indent);
    } else if (children.icon) {
      result = renderElement(children.icon.replace(/^(\d)/, '_$1'), {}, undefined, indent);
    }

    if (children.text) {
      let text = renderElement('Text', {children: children.text}, undefined, indent);
      result = <>{result}{result ? '\n  ' + indent : null}{text}</>;
    }

    if (children.badge) {
      let badge = renderElement('NotificationBadge', {value: 12}, undefined, indent);
      result = <>{result}{result ? '\n  ' + indent : null}{badge}</>;
    }

    return result;
  } else if (children?.text != null) {
    return children.text;
  } else if (Array.isArray(children)) {
    return children.map((c, i) => <React.Fragment key={i}>{i > 0 ? '\n  ' + indent : null}{c}</React.Fragment>);
  }

  return children;
}

function countChars(element: ReactNode) {
  if (typeof element === 'string') {
    return element.length;
  } else if (Array.isArray(element)) {
    return element.reduce((p, i) => p + countChars(i), 0);
  } else if (element && typeof element === 'object' && 'props' in element && element.props) {
    return countChars((element.props as any).children);
  }
  return 0;
}

function renderProp(name: string, value: any, control?: PropControl, indent = '') {
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
    if (name === 'contextualHelp') {
      let res = renderElement('ContextualHelp', {
        children: [
          renderElement('Heading', {children: 'Heading'}),
          renderElement('Content', {children: 'Content'})
        ]
      }, undefined, indent + '    ');
      propValue = <>{`{\n    ${indent}`}{res}{`\n  ${indent}}`}</>;
    } else {
      propValue = value === false ? <>{'{'}<span className={style({color: 'magenta-1000'})}>{String(value)}</span>{'}'}</> : null;
    }
  } else if (value == null) {
    return null;
  } else if (typeof value === 'object') {
    propValue = <>{'{'}{renderValue(value, indent)}{'}'}</>;
  }

  if (propValue) {
    propValue = <>={propValue}</>;
  }

  return <Fragment key={name}>{propName}{propValue}</Fragment>;
}

function renderValue(value: any, indent = '') {
  switch (typeof value) {
    case 'string':
      return <span className={style({color: 'green-1000'})}>"{value}"</span>;
    case 'number':
      return <span className={style({color: 'pink-1000'})}>{String(value)}</span>;
    case 'boolean':
      return <span className={style({color: 'magenta-1000'})}>{String(value)}</span>;
    case 'object': {
      if (value == null) {
        return <span className={style({color: 'magenta-1000'})}>{String(value)}</span>;
      }
      if (Array.isArray(value)) {
        let res: ReactNode[] = value.map((item, i) => {
          let result = renderValue(item, indent);
          if (i < value.length - 1) {
            result = <>{result}, </>;
          }
          return <Fragment key={i}>{result}</Fragment>;
        });

        if (countChars(res) > 40) {
          res = res.map((p, i) => <Fragment key={i}>{'\n  ' + indent}{p}</Fragment>);
          res.push('\n  ');
        }

        return <>{'['}{res}{']'}</>;
      }

      if (value instanceof Size) {
        return <><span className={style({color: 'magenta-1000'})}>new</span> <span className={style({color: 'red-1000'})}>Size</span>(<span className={style({color: 'pink-1000'})}>{value.width}</span>, <span className={style({color: 'pink-1000'})}>{value.height}</span>)</>;
      }

      let entries = Object.entries(value);
      let res: ReactNode[] = entries.map(([name, value], i) => {
        let result = <><span className={style({color: 'indigo-1000'})}>{name}</span>: {renderValue(value, indent)}</>;
        if (i < entries.length - 1) {
          result = <>{result}, </>;
        }
        return <Fragment key={i}>{result}</Fragment>;
      });

      if (countChars(res) > 40) {
        res = res.map((p, i) => <Fragment key={i}>{'\n  ' + indent}{p}</Fragment>);
        res.push('\n' + indent);
      }

      return <>{'{'}{res}{'}'}</>;
    }
  }
}

function renderImports(name: string, importSource: string, props: Props) {
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

  if (props.contextualHelp) {
    components.push('ContextualHelp', 'Heading', 'Content');
  }

  imports.push(renderImport(components.join(', '), importSource));

  if (props.children?.icon && !props.children?.avatar) {
    imports.push('\n', renderImport(props.children.icon.replace(/^(\d)/, '_$1'), `@react-spectrum/s2/icons/${props.children.icon}`, true));
  }

  imports.push('\n\n');
  return imports;
}

function renderImport(name, from, isDefault = false) {
  return (
    <Fragment key={from}>
      <span className={style({color: 'magenta-1000'})}>import</span>
      {' '}
      {isDefault ? null : '{'}
      {name}
      {isDefault ? null : '}'}
      {' '}
      <span className={style({color: 'magenta-1000'})}>from</span>
      {' '}
      {from.startsWith('./')
        ? <TabLink className={style({color: 'green-1000'})} name={from.slice(2)}>'{from}'</TabLink>
        : <span className={style({color: 'green-1000'})}>'{from}'</span>
      }
      {';'}
    </Fragment>
  );
}

export function Control({name}: {name: string}) {
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
      if (name === 'channel' || name === 'xChannel' || name === 'yChannel') {
        return <ChannelControl control={control} value={value} onChange={onChange} />;
      }
      if (name === 'colorSpace') {
        return <ColorSpaceControl control={control} value={value} />;
      }
      if (name === 'placement' && control.value.elements.length === 22) {
        return <PlacementControl control={control} value={value} onChange={onChange} />;
      }
      if (name === 'src') {
        return <StringControl control={control} value={value} onChange={onChange} />;
      }
      return <UnionControl control={control} value={value} onChange={onChange} />;
    case 'number':
      return <NumberControl control={control} value={value} onChange={onChange} />;
    case 'identifier':
      if (control.value.name === 'Intl.NumberFormatOptions') {
        return <NumberFormatControl control={control} value={value} onChange={onChange} />;
      }
      if (name === 'contextualHelp') {
        return <BooleanControl control={control} value={value} onChange={onChange} />;
      }
      if (control.value.name === 'ReactNode') {
        return <ChildrenControl control={control} value={value} onChange={onChange} />;
      }
      break;
    case 'string':
      if (name === 'locale') {
        return <LocaleControl control={control} value={value} onChange={onChange} />;
      }
      return <StringControl control={control} value={value} onChange={onChange} />;
    case 'interface':
      if (control.value.name === 'DateDuration') {
        return <DurationControl control={control} value={value} onChange={onChange} />;
      }
      if (control.value.name === 'Size') {
        return <SizeControl control={control} value={value} onChange={onChange} />;
      }
      break;
    case 'array':
      return <ArrayControl control={control} valueType={control.value.elementType} value={value} onChange={onChange} />;
    case 'application':
      if (control.value.base.type === 'identifier' && (control.value.base.name === 'ReadonlyArray' || control.value.base.name === 'Array')) {
        return <ArrayControl control={control} value={value} valueType={control.value.typeParameters[0]} onChange={onChange} />;
      }
    default:
      if (name === 'children') {
        return <StringControl control={control} value={value} onChange={onChange} />;
      }
      console.warn(control);
  }
}

interface ControlProps {
  control: PropControl,
  value: any,
  onChange: (v: any) => void
}

function BooleanControl({control, value, onChange}: ControlProps) {
  return (
    <Wrapper control={control}>
      <div className={style({display: {default: 'flex', lg: 'contents'}, minHeight: 32, alignItems: 'center'})}>
        <Switch isSelected={value || false} onChange={onChange} aria-label={control.name} />
      </div>
    </Wrapper>
  );
}

const controlWidth = {default: 'full', sm: 130} as const;

function UnionControl({control, value, onChange, isPicker = false}) {
  let length = control.value.elements.reduce((p, v) => p + v.value, '').length;
  if (isPicker || control.options?.control === 'picker' || length > 18) {
    return (
      <Picker
        label={control.name}
        contextualHelp={<PropContextualHelp control={control} />}
        value={value == null && control.optional && !control.default ? '__none' : value}
        onChange={v => onChange(v === '__none' ? null : v)}
        styles={style({width: controlWidth})}>
        {control.optional && !control.default ? <PickerItem id="__none">Default</PickerItem> : null}
        {control.value.elements.filter(e => e.value).map(element => (
          <PickerItem key={element.value} id={element.value}>{String(element.value)}</PickerItem>
        ))}
      </Picker>
    );
  }

  return (
    <Wrapper
      control={control}
      styles={style({
        gridColumnStart: {
          isLong: 1
        },
        gridColumnEnd: {
          isLong: -1
        }
      })({isLong: length > 12 || control.value.elements.length > 3})}>
      <ToggleButtonGroup
        aria-label={control.name}
        disallowEmptySelection={!control.optional || !!control.default}
        selectedKeys={[value]}
        onSelectionChange={keys => onChange([...keys][0])}
        density="compact">
        {control.value.elements.map(element => (
          <ToggleButton
            key={element.value}
            id={element.value}
            styles={style({
              flexGrow: {
                default: 1,
                lg: 0
              }
            })}>
            {element.value}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Wrapper>
  );
}

function Wrapper({control, children, styles, ref}: {control: PropControl, children: ReactNode, styles?: StyleString, ref?: Ref<HTMLDivElement>}) {
  return (
    <div ref={ref} className={mergeStyles(style({display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}), styles)}>
      <span className={style({font: 'ui', color: 'neutral-subdued', display: 'flex', paddingBottom: `calc((${size(32)} - 1lh) / 2)`})}>
        <span className={style({truncate: true})}>
          {control.name}
        </span>
        <span className={style({whiteSpace: 'nowrap'})}>
          &nbsp;
          {control.description ? (
            <CenterBaseline
              styles={style({
                display: 'inline-flex',
                height: 0
              })}>
              <PropContextualHelp control={control} />
            </CenterBaseline>
          ) : null}
        </span>
      </span>
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

function NumberControl({control, value, onChange}: ControlProps) {
  if (control.options?.control === 'slider') {
    return (
      <Slider
        label={control.name}
        contextualHelp={<PropContextualHelp control={control} />}
        value={value}
        onChange={onChange}
        styles={style({width: controlWidth})} />
    );
  }

  return (
    <NumberField
      label={control.name}
      placeholder="–"
      contextualHelp={<PropContextualHelp control={control} />}
      value={value}
      onChange={onChange}
      styles={style({width: controlWidth})}
      minValue={control.options?.minValue}
      maxValue={control.options?.maxValue}
      formatOptions={control.name === 'delay' || control.name === 'closeDelay' ? {
        style: 'unit',
        unit: 'millisecond'
      } : undefined} />
  );
}

function NumberFormatControl({control, value, onChange}: ControlProps) {
  return (
    <>
      <Picker
        label={control.name}
        contextualHelp={<PropContextualHelp control={control} />}
        value={value?.style || 'decimal'}
        onChange={id => {
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
        styles={style({width: controlWidth})}>
        <PickerItem id="decimal">Decimal</PickerItem>
        <PickerItem id="percent">Percent</PickerItem>
        <PickerItem id="currency">Currency</PickerItem>
        <PickerItem id="unit">Unit</PickerItem>
      </Picker>
      {control.options?.showDetails && <>
        <RangeSlider
          label="Decimals"
          value={{start: value?.minimumFractionDigits ?? 0, end: value?.maximumFractionDigits ?? 5}}
          minValue={0}
          maxValue={5}
          onChange={v => onChange({...value, minimumFractionDigits: v.start, maximumFractionDigits: v.end})}
          styles={style({width: controlWidth})} />
        {value?.style === 'decimal' && (
          <Picker
            label="Sign Display"
            value={value?.signDisplay ?? 'auto'}
            onChange={signDisplay => onChange({...value, signDisplay})}
            styles={style({width: controlWidth})}>
            <PickerItem id="auto">Auto</PickerItem>
            <PickerItem id="always">Always</PickerItem>
            <PickerItem id="exceptZero">Except zero</PickerItem>
            <PickerItem id="negative">Negative</PickerItem>
            <PickerItem id="never">Never</PickerItem>
          </Picker>
        )}
        {value?.style === 'currency' && <>
          <ComboBox
            label="Currency"
            selectedKey={value.currency}
            onSelectionChange={currency => onChange({...value, currency})}
            styles={style({width: controlWidth})}>
            {Intl.supportedValuesOf('currency').map(c => <ComboBoxItem key={c} id={c}>{c}</ComboBoxItem>)}
          </ComboBox>
          <UnionControl
            control={{
              name: 'Currency Display',
              optional: true,
              default: 'symbol',
              value: {
                elements: [
                  {value: 'code'},
                  {value: 'symbol'},
                  {value: 'narrowSymbol'},
                  {value: 'name'}
                ]
              }
            }}
            value={value.currencyDisplay ?? 'symbol'}
            onChange={currencyDisplay => onChange({...value, currencyDisplay})} />
        </>}
        {value?.style === 'unit' && <>
          <ComboBox
            label="Unit"
            selectedKey={value.unit}
            onSelectionChange={unit => onChange({...value, unit})}
            styles={style({width: controlWidth})}>
            {Intl.supportedValuesOf('unit').map(c => <ComboBoxItem key={c} id={c}>{c}</ComboBoxItem>)}
          </ComboBox>
          <UnionControl
            control={{
              name: 'Unit Display',
              optional: true,
              default: 'short',
              value: {
                elements: [
                  {value: 'narrow'},
                  {value: 'short'},
                  {value: 'long'}
                ]
              }
            }}
            value={value.unitDisplay ?? 'short'}
            onChange={unitDisplay => onChange({...value, unitDisplay})} />
        </>}
      </>}
    </>
  );
}

function StringControl({control, value, onChange}: ControlProps) {
  return (
    <TextField
      label={control.name}
      placeholder="–"
      contextualHelp={<PropContextualHelp control={control} />}
      value={value || ''}
      onChange={onChange}
      styles={style({width: controlWidth})} />
  );
}

function ChildrenControl({control, value, onChange}: ControlProps) {
  if (control.slots) {
    let objectValue = typeof value === 'string' ? {text: value} : value;
    return (
      <Wrapper control={control} styles={style({gridColumnStart: 1, gridColumnEnd: -1})}>
        <div className={style({display: 'flex', flexDirection: 'column', rowGap: 4})}>
          {control.slots.icon && (
            <div className={style({display: 'flex', columnGap: 4})}>
              <TextField
                aria-label={control.name}
                placeholder="–"
                value={objectValue?.text || ''}
                onChange={text => onChange({...objectValue, text})}
                styles={style({width: 80, flexGrow: 1})} />
              <Suspense fallback={<ActionButton isPending>No icon</ActionButton>}>
                <IconPicker
                  value={value}
                  onChange={onChange} />
              </Suspense>
            </div>
          )}
          {(control.slots.avatar || control.slots.badge) &&
            <ToggleButtonGroup density="compact" isJustified>
              {control.slots.avatar &&
                <ToggleButton
                  isSelected={objectValue?.avatar ?? false}
                  onChange={avatar => onChange({...objectValue, avatar})}>
                  Avatar
                </ToggleButton>
              }
              {control.slots.badge &&
                <ToggleButton
                  isSelected={objectValue?.badge ?? false}
                  onChange={badge => onChange({...objectValue, badge})}>
                  Badge
                </ToggleButton>
              }
            </ToggleButtonGroup>
          }
        </div>
      </Wrapper>
    );
  }

  return <StringControl control={control} value={value} onChange={onChange} />;
}


// https://github.com/unicode-org/cldr/blob/22af90ae3bb04263f651323ce3d9a71747a75ffb/common/supplemental/supplementalData.xml#L4649-L4664
const preferences = [
  // Tier 1
  {value: 'fr-FR'},
  {value: 'fr-CA'},
  {value: 'de-DE'},
  {value: 'en-US'},
  {value: 'en-GB'},
  {value: 'ja-JP', ordering: 'gregory japanese'},
  // // Tier 2
  {value: 'da-DK'},
  {value: 'nl-NL'},
  {value: 'fi-FI'},
  {value: 'it-IT'},
  {value: 'nb-NO'},
  {value: 'es-ES'},
  {value: 'sv-SE'},
  {value: 'pt-BR'},
  // // Tier 3
  {value: 'zh-CN'},
  {value: 'zh-TW', ordering: 'gregory roc chinese'},
  {value: 'ko-KR'},
  // // Tier 4
  {value: 'bg-BG'},
  {value: 'hr-HR'},
  {value: 'cs-CZ'},
  {value: 'et-EE'},
  {value: 'hu-HU'},
  {value: 'lv-LV'},
  {value: 'lt-LT'},
  {value: 'pl-PL'},
  {value: 'ro-RO'},
  {value: 'ru-RU'},
  {value: 'sr-SP'},
  {value: 'sk-SK'},
  {value: 'sl-SI'},
  {value: 'tr-TR'},
  {value: 'uk-UA'},
  // // Tier 5
  {value: 'ar-AE', ordering: 'gregory islamic-umalqura islamic islamic-civil islamic-tbla'},
  {value: 'ar-DZ', ordering: 'gregory islamic islamic-civil islamic-tbla'},
  {value: 'ar-EG', ordering: 'gregory coptic islamic islamic-civil islamic-tbla'},
  {value: 'ar-SA', ordering: 'islamic-umalqura gregory islamic islamic-rgsa'},
  {value: 'el-GR'},
  {value: 'he-IL', ordering: 'gregory hebrew islamic islamic-civil islamic-tbla'},

  {value: 'fa-AF', ordering: 'persian gregory islamic islamic-civil islamic-tbla'},
  // {territories: 'CN CX HK MO SG', ordering: 'gregory chinese'},
  {value: 'am-ET', ordering: 'gregory ethiopic ethioaa'},
  {value: 'hi-IN', ordering: 'gregory indian'},
  // {territories: 'KR', ordering: 'gregory dangi'},
  {value: 'th-TH', ordering: 'buddhist gregory'}
];

const calendars = [
  {key: 'gregory', name: 'Gregorian'},
  {key: 'japanese', name: 'Japanese'},
  {key: 'buddhist', name: 'Buddhist'},
  {key: 'roc', name: 'Taiwan'},
  {key: 'persian', name: 'Persian'},
  {key: 'indian', name: 'Indian'},
  {key: 'islamic-umalqura', name: 'Islamic (Umm al-Qura)'},
  {key: 'islamic-civil', name: 'Islamic Civil'},
  {key: 'islamic-tbla', name: 'Islamic Tabular'},
  {key: 'hebrew', name: 'Hebrew'},
  {key: 'coptic', name: 'Coptic'},
  {key: 'ethiopic', name: 'Ethiopic'},
  {key: 'ethioaa', name: 'Ethiopic (Amete Alem)'}
];

function matchLocale(defaultLocale: string) {
  let parsed: Intl.Locale;
  try {
    parsed = new Intl.Locale(defaultLocale);
  } catch {
    return 'en-US';
  }

  let locales = preferences.map(p => new Intl.Locale(p.value));

  // Try with both language and region first, and if that fails, try again with just language
  let p = locales.find(locale => locale.language === parsed.language && locale.region === parsed.region) || locales.find(locale => locale.language === parsed.language);
  return p?.toString() || 'en-US';
}


function LocaleControl({control, value, onChange}: ControlProps) {
  let {locale: defaultLocale} = useLocale();
  let langDisplay = useMemo(() => new Intl.DisplayNames(defaultLocale, {type: 'language'}), [defaultLocale]);
  let regionDisplay = useMemo(() => new Intl.DisplayNames(defaultLocale, {type: 'region'}), [defaultLocale]);
  let locales = useMemo(() => {
    return preferences.map(item => {
      let locale = new Intl.Locale(item.value);
      return {
        ...item,
        label: `${langDisplay.of(locale.language)} (${regionDisplay.of(locale.region!)})`
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, [langDisplay, regionDisplay]);

  let matched = useMemo(() => matchLocale(value), [value]);
  let pref = preferences.find(p => p.value === matched);
  // @ts-ignore there cannot be any undefined values in the array
  let preferredCalendars: Array<{key: string, name: string}> = useMemo(() => pref ? (pref.ordering || 'gregory').split(' ').map(p => calendars.find(c => c.key === p)).filter(Boolean) : [calendars[0]], [pref]);
  let otherCalendars = useMemo(() => calendars.filter(c => !preferredCalendars.some(p => p?.key === c.key)), [preferredCalendars]);

  let extension = control.options ?? 'calendar';
  let updateLocale = locale => {
    let calendar, numberingSystem;
    if (extension === 'calendar') {
      calendar = (preferences.find(p => p.value === locale)?.ordering || 'gregory').split(' ')[0];
    } else if (extension === 'numberingSystem') {
      numberingSystem = new Intl.NumberFormat(locale).resolvedOptions().numberingSystem;
      if (numberingSystem === 'arabext') {
        numberingSystem = 'arab';
      }
    }
    let newLocale = new Intl.Locale(locale, {
      calendar,
      numberingSystem
    });
    onChange(newLocale.toString());
  };

  let updateCalendar = calendar => {
    let newLocale = new Intl.Locale(value, {
      calendar
    });
    onChange(newLocale.toString());
  };

  let updateNumberingSystem = numberingSystem => {
    let newLocale = new Intl.Locale(value, {
      numberingSystem
    });
    onChange(newLocale.toString());
  };

  let lang: string | null = null;
  let calendar: string | null = null;
  let numberingSystem: string | null = null;

  if (value) {
    let locale = new Intl.Locale(value);
    lang = locale.baseName;
    calendar = locale.calendar || null;
    numberingSystem = locale.numberingSystem || null;
  }

  return (
    <>
      <Picker label="Locale" items={locales} value={lang} onChange={updateLocale}>
        {item => <PickerItem id={item.value}>{item.label}</PickerItem>}
      </Picker>
      {extension === 'calendar' && (
        <Picker label="Calendar" value={calendar} onChange={updateCalendar}>
          <PickerSection>
            <Header>
              <Heading>Preferred</Heading>
            </Header>
            <Collection items={preferredCalendars}>
              {(item: { key: string, name: string }) => <PickerItem>{item.name}</PickerItem>}
            </Collection>
          </PickerSection>
          <PickerSection>
            <Header>
              <Heading>Other</Heading>
            </Header>
            <Collection items={otherCalendars}>
              {(item: { key: string, name: string }) => <PickerItem>{item.name}</PickerItem>}
            </Collection>
          </PickerSection>
        </Picker>
      )}
      {extension === 'numberingSystem' && (
        <Picker label="Numbering system" value={numberingSystem} onChange={updateNumberingSystem}>
          <PickerItem id="latn">Latin</PickerItem>
          <PickerItem id="arab">Arabic</PickerItem>
          <PickerItem id="hanidec">Hanidec</PickerItem>
          <PickerItem id="deva">Devanagari</PickerItem>
          <PickerItem id="beng">Bengali</PickerItem>
        </Picker>
      )}
    </>
  );
}

function DurationControl({control, value, onChange}: ControlProps) {
  // For now we only care about months.
  return (
    <NumberField
      label={control.name}
      placeholder="–"
      contextualHelp={<PropContextualHelp control={control} />}
      value={value.months}
      minValue={1}
      onChange={months => onChange({months})}
      styles={style({width: controlWidth})}
      formatOptions={{
        style: 'unit',
        unit: 'month',
        unitDisplay: 'long'
      }} />
  );
}

function ChannelControl({control, value, onChange}) {
  let {props} = useContext(Context);
  let colorSpace = props.colorSpace;
  if (!colorSpace && props.defaultValue) {
    let color = typeof props.defaultValue === 'string' ? parseColor(props.defaultValue) : props.defaultValue;
    colorSpace = color.getColorSpace();
  }
  return (
    <UnionControl
      isPicker
      control={{
        ...control,
        value: {
          type: 'union',
          elements: [
            ...getColorChannels(colorSpace).map(v => ({type: 'string', value: v})),
            {type: 'string', value: 'alpha'}
          ]
        }
      }}
      value={value}
      onChange={onChange} />
  );
}

function ColorSpaceControl({control, value}) {
  let {setProps} = useContext(Context);
  return (
    <UnionControl
      control={{
        ...control,
        optional: false
      }}
      value={value}
      onChange={colorSpace => {
        setProps(props => {
          props = {...props, colorSpace};
          if (props.channel) {
            props.channel = getColorChannels(colorSpace)[0];
          }

          delete props.xChannel;
          delete props.yChannel;
          return props;
        });
      }} />
  );
}

function PlacementControl({control, value, onChange}) {
  return (
    <Wrapper control={control} styles={style({gridColumnStart: 1, gridColumnEnd: -1})}>
      <ListBox
        aria-label={control.name}
        layout="grid"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[value]}
        onSelectionChange={keys => onChange([...keys][0])}
        className={style({
          gridTemplateColumns: [25, 24, 24, 25, 24],
          gridTemplateRows: [25, 24, 24, 25, 24]
        })}
        style={{
          display: 'grid',
          gridTemplateAreas: `
            ".  ts tc te . "
            "st .  .  .  et"
            "sc .  .  .  ec"
            "sb .  .  .  eb"
            ".  bs bc be . "
          `
        }}>
        <PlacementControlItem id="top start" style={{gridArea: 'ts'}} />
        <PlacementControlItem id="top" style={{gridArea: 'tc'}} />
        <PlacementControlItem id="top end" style={{gridArea: 'te'}} />
        <PlacementControlItem id="start top" style={{gridArea: 'st'}} />
        <PlacementControlItem id="end top" style={{gridArea: 'et'}} />
        <PlacementControlItem id="start" style={{gridArea: 'sc'}} />
        <PlacementControlItem id="end" style={{gridArea: 'ec'}} />
        <PlacementControlItem id="start bottom" style={{gridArea: 'sb'}} />
        <PlacementControlItem id="end bottom" style={{gridArea: 'eb'}} />
        <PlacementControlItem id="bottom start" style={{gridArea: 'bs'}} />
        <PlacementControlItem id="bottom" style={{gridArea: 'bc'}} />
        <PlacementControlItem id="bottom end" style={{gridArea: 'be'}} />
      </ListBox>
    </Wrapper>
  );
}

function PlacementControlItem(props) {
  return (
    <ListBoxItem
      {...props}
      aria-label={props.id}
      className={style({
        ...focusRing(),
        size: 24,
        transition: 'default',
        backgroundColor: {
          default: baseColor('gray-100'),
          isSelected: 'neutral'
        },
        color: {
          default: 'neutral',
          isSelected: 'white'
        },
        zIndex: {
          default: 0,
          isFocusVisible: 1
        },
        disableTapHighlight: true
      })}>
      <div
        className={style({
          size: 'full',
          outlineStyle: 'solid',
          outlineColor: 'gray-600',
          outlineWidth: 1
        })} />
    </ListBoxItem>
  );
}

function ArrayControl({control, valueType, value = [], onChange}) {
  let ref = useRef<HTMLDivElement | null>(null);
  return (
    <Wrapper ref={ref} control={control} styles={style({gridColumnStart: 1, gridColumnEnd: -1, width: 150})}>
      {value.length === 0 &&
        <ActionButton
          size="S"
          aria-label="Add item"
          styles={style({alignSelf: 'start'})}
          onPress={() => {
            flushSync(() => onChange(['']));
            ref.current?.querySelector('input')?.focus();
          }}>
          <AddCircle />
        </ActionButton>
      }
      {value.map((item, index) => {
        let rendered;
        switch (valueType.type) {
          case 'string':
            rendered = (
              <TextField
                aria-label={`${control.name}, item ${index}`}
                size="S"
                styles={style({flexGrow: 1})}
                value={item}
                onChange={newValue => {
                  let arr: any[] = [...value];
                  arr[index] = newValue;
                  onChange(arr);
                }} />
            );
            break;
          default:
            console.warn('unknown array element type', valueType);
            return null;
        }

        return (
          <div key={index} className={style({display: 'flex', gap: 4})}>
            {rendered}
            <ActionButton
              size="S"
              aria-label="Add item after"
              onPress={() => {
                let arr: any[] = [...value];
                arr.splice(index + 1, 0, '');
                flushSync(() => onChange(arr));
                ref.current?.querySelectorAll('input')[index + 1]?.focus();
              }}>
              <AddCircle />
            </ActionButton>
            <ActionButton
              size="S"
              aria-label="Remove item"
              onPress={() => {
                let arr: any[] = [...value];
                arr.splice(index, 1);
                flushSync(() => onChange(arr));
                if (arr.length > 0) {
                  ref.current?.querySelectorAll('input')[Math.min(arr.length - 1, index)]?.focus();
                } else {
                  ref.current?.querySelector('button')?.focus();
                }
              }}>
              <RemoveCircle />
            </ActionButton>
          </div>
        );
      })}
    </Wrapper>
  );
}

function SizeControl({control, value, onChange}: ControlProps) {
  return (
    <Wrapper control={control} styles={style({gridColumnStart: 1, gridColumnEnd: -1})}>
      <div className={style({display: 'flex', gap: 4, width: controlWidth})}>
        <NumberField
          aria-label="Width"
          placeholder="–"
          value={value?.width}
          onChange={width => onChange(new Size(width, value?.height ?? 0))}
          styles={style({flexShrink: 1, flexGrow: 1})}
          hideStepper />
        <NumberField
          aria-label="Height"
          placeholder="–"
          value={value?.height}
          onChange={height => onChange(new Size(value?.width ?? 0, height))}
          styles={style({flexShrink: 1, flexGrow: 1})}
          hideStepper />
      </div>
    </Wrapper>
  );
}
