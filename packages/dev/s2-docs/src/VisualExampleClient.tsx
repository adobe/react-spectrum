'use client';

import {Avatar, Collection, Content, ContextualHelp, Footer, Header, Heading, NotificationBadge, NumberField, Picker, PickerItem, PickerSection, Switch, Text, TextField, ToggleButton, ToggleButtonGroup} from '@react-spectrum/s2';
import {CodePlatter, Pre} from './CodePlatter';
import {createContext, Fragment, isValidElement, ReactNode, useContext, useEffect, useMemo, useState} from 'react';
import {ExampleOutput} from './ExampleOutput';
import {IconPicker} from './IconPicker';
import type {PropControl} from './VisualExample';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };
import {useLocale} from 'react-aria';

type Props = {[name: string]: any};
type Controls = {[name: string]: PropControl};
interface ContextValue {
  component: any,
  name: string,
  importSource?: string,
  controls: Controls,
  props: Props,
  setProps(v: Props): void
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
  initialProps?: {[prop: string]: any}
}

export function VisualExampleClient({component, name, importSource, controls, children, initialProps = {}}: VisualExampleClientProps) {
  let [props, setProps] = useState(() => {
    let props = {...initialProps};
    for (let name in controls) {
      let defaultValue = controls[name].default;
      if (!(name in initialProps)) {
        props[name] = defaultValue;
      }
    }

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
    <Context.Provider value={{component, name, importSource, controls, props, setProps}}>
      {children}
    </Context.Provider>
  );
}

export function Output({align = 'center'}: {align?: 'center' | 'start' | 'end'}) {
  let {component, props} = useContext(Context);

  if (!isValidElement(component)) {
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

    props = {...props, children};
  }

  return (
    <ExampleOutput
      component={component}
      props={props}
      align={align} />
  );
}

export function CodeOutput({code}: {code?: ReactNode}) {
  let {name, importSource, props, controls} = useContext(Context);
  let url;
  if (typeof location !== 'undefined') {
    url = new URL(location.href);
    for (let prop in props) {
      if (props[prop] != null) {
        url.searchParams.set(prop, JSON.stringify(props[prop]));
      }
    }
  }

  code ||= (
    <Pre>
      <code>
        {importSource ? renderImports(name, importSource, props) : null}
        {renderElement(name, props, controls)}
      </code>
    </Pre>
  );

  return (
    <CodePlatter shareUrl={url?.toString()}>
      {code}
    </CodePlatter>
  );
}

export function CodeProps({indent = ''}) {
  let {props, controls} = useContext(Context);
  let renderedProps = Object.keys(props).filter(prop => prop !== 'children').map(prop => renderProp(prop, props[prop], controls[prop])).filter(Boolean);
  let newlines = indent.length > 0 || countChars(renderedProps) > 40;
  let separator = newlines ? '\n' + (indent || '  ') : ' ';
  renderedProps = renderedProps.map((p, i) => <Fragment key={i}>{newlines && indent && i === 0 ? '' : separator}{p}</Fragment>);
  return renderedProps;
}

function renderElement(name: string, props: Props, controls?: Controls) {
  let start = <>&lt;<span className={style({color: 'red-1000'})}>{name}</span></>;
  let renderedProps = Object.keys(props).filter(prop => prop !== 'children').map(prop => renderProp(prop, props[prop], controls?.[prop])).filter(Boolean);
  let newlines = name.length + countChars(renderedProps) > 40;
  renderedProps = renderedProps.map((p, i) => <Fragment key={i}>{newlines ? '\n  ' : ' '}{p}</Fragment>);
  if (props.children) {
    let end = <>&lt;/<span className={style({color: 'red-1000'})}>{name}</span>&gt;</>;
    let children = renderChildren(props.children);
    if (typeof children !== 'string') {
      newlines = true;
    }
    return <>{start}{renderedProps}&gt;{newlines ? '\n  ' : null}{children}{newlines ? '\n' : null}{end}</>;
  }

  return <>{start}{renderedProps} /&gt;</>;
}

function renderChildren(children) {
  if (children?.icon || children?.avatar || children?.badge) {
    let result: ReactNode = null;
    if (children.avatar) {
      result = renderElement('Avatar', {src: 'https://i.imgur.com/xIe7Wlb.png'});
    } else if (children.icon) {
      result = renderElement(children.icon.replace(/^(\d)/, '_$1'), {});
    }

    if (children.text) {
      let text = renderElement('Text', {children: children.text});
      result = <>{result}{result ? '\n  ' : null}{text}</>;
    }

    if (children.badge) {
      let badge = renderElement('NotificationBadge', {value: 12});
      result = <>{result}{result ? '\n  ' : null}{badge}</>;
    }
    
    return result;
  } else if (children?.text) {
    return children.text;
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

function renderProp(name: string, value: any, control?: PropControl) {
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

  return <Fragment key={name}>{propName}{propValue}</Fragment>;
}

function renderValue(value: any) {
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
      let entries = Object.entries(value);
      return (<>{'{'}{entries.map(([name, value], i) => {
        let result = <><span className={style({color: 'indigo-1000'})}>{name}</span>: {renderValue(value)}</>;
        if (i < entries.length - 1) {
          result = <>{result}, </>;
        }
        return <Fragment key={i}>{result}</Fragment>;
      })}{'}'}</>);
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
  
  imports.push(renderImport(components.join(', '), importSource));

  if (props.children?.icon && !props.children?.avatar) {
    imports.push('\n', renderImport(props.children.icon.replace(/^(\d)/, '_$1'), `@react-spectrum/s2/icons/${props.children.icon}`, true));
  }
  
  imports.push('\n\n');
  return imports;
}

function renderImport(name, from, isDefault = false) {
  return <Fragment key={from}><span className={style({color: 'magenta-1000'})}>import</span> {isDefault ? null : '{'}{name}{isDefault ? null : '}'} <span className={style({color: 'magenta-1000'})}>from</span> <span className={style({color: 'green-1000'})}>'{from}'</span>;</Fragment>;
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
      if (name === 'locale') {
        return <LocaleControl control={control} value={value} onChange={onChange} />;
      }
      return <StringControl control={control} value={value} onChange={onChange} />;
    case 'interface':
      if (control.value.name === 'DateDuration') {
        return <DurationControl control={control} value={value} onChange={onChange} />;
      }
      break;
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
      <Switch isSelected={value || false} onChange={onChange} aria-label={control.name} />
    </Wrapper>
  );
}

function UnionControl({control, value, onChange}) {
  if (control.value.elements.reduce((p, v) => p + v.value).length > 30) {
    return (
      <Picker label={control.name} contextualHelp={<PropContextualHelp control={control} />} selectedKey={value == null && control.optional && !control.default ? '__none' : value} onSelectionChange={v => onChange(v === '__none' ? null : v)} styles={style({width: 130})}>
        {control.optional && !control.default ? <PickerItem id="__none">Default</PickerItem> : null}
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

function Wrapper({control, children}: {control: PropControl, children: ReactNode}) {
  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 4})}>
      <span className={style({font: 'ui', color: 'neutral-subdued'})}>{control.name}&nbsp;{control.description ? <div style={{display: 'inline-flex'}}><PropContextualHelp control={control} /></div> : null}</span>
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
  return (
    <NumberField
      label={control.name}
      contextualHelp={<PropContextualHelp control={control} />}
      value={value}
      onChange={onChange}
      styles={style({width: 130})} />
  );
}

function NumberFormatControl({control, value, onChange}: ControlProps) {
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
      styles={style({width: 130})}>
      <PickerItem id="decimal">Decimal</PickerItem>
      <PickerItem id="percent">Percent</PickerItem>
      <PickerItem id="currency">Currency</PickerItem>
      <PickerItem id="unit">Unit</PickerItem>
    </Picker>
  );
}

function StringControl({control, value, onChange}: ControlProps) {
  return (
    <TextField
      label={control.name}
      contextualHelp={<PropContextualHelp control={control} />}
      value={value || ''}
      onChange={onChange}
      styles={style({width: 130})} />
  );
}

function ChildrenControl({control, value, onChange}: ControlProps) {
  if (control.slots) {
    let objectValue = typeof value === 'string' ? {text: value} : value;
    return (
      <Wrapper control={control}>
        {control.slots.icon && (
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
      </Wrapper>
    );
  }

  return <StringControl control={control} value={value} onChange={onChange} />;
}

function ContextualHelpControl({control, value, onChange}: ControlProps) {
  return (
    <Wrapper control={control}>
      <Switch isSelected={!!value} onChange={v => onChange(v ? <ContextualHelp><Heading>Heading</Heading><Content>Content</Content></ContextualHelp> : null)} aria-label={control.name} />
    </Wrapper>
  );
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


function LocaleControl({value, onChange}: ControlProps) {
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

  let updateLocale = locale => {
    let newLocale = new Intl.Locale(locale, {
      calendar: (preferences.find(p => p.value === locale)?.ordering || 'gregory').split(' ')[0]
    });
    onChange(newLocale.toString());
  };

  let updateCalendar = calendar => {
    let newLocale = new Intl.Locale(value, {
      calendar
    });
    onChange(newLocale.toString());
  };

  let lang: string | null = null;
  let calendar: string | null = null;

  if (value) {
    let locale = new Intl.Locale(value);
    lang = locale.baseName;
    calendar = locale.calendar || null;
  }

  return (
    <>
      <Picker label="Locale" items={locales} selectedKey={lang} onSelectionChange={updateLocale}>
        {item => <PickerItem id={item.value}>{item.label}</PickerItem>}
      </Picker>
      <Picker label="Calendar" selectedKey={calendar} onSelectionChange={updateCalendar}>
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
    </>
  );
}

function DurationControl({control, value, onChange}: ControlProps) {
  // For now we only care about months.
  return (
    <NumberField
      label={control.name}
      contextualHelp={<PropContextualHelp control={control} />}
      value={value.months}
      onChange={months => onChange({months})}
      styles={style({width: 130})}
      formatOptions={{
        style: 'unit',
        unit: 'month',
        unitDisplay: 'long'
      }} />
  );
}
