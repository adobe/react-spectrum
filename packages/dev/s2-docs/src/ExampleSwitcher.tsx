'use client';

import {Content, ContextualHelp, Heading, Picker, PickerItem, SegmentedControl, SegmentedControlItem} from '@react-spectrum/s2';
import {createContext, useEffect, useLayoutEffect, useState} from 'react';
import {Key} from 'react-aria-components';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const exampleStyle = style({
  backgroundColor: 'layer-1',
  marginY: 20,
  borderRadius: 'xl',
  display: 'grid',
  gridTemplateColumns: {
    default: [12, '1fr', 12],
    lg: [24, '1fr', 'auto', 24]
  },
  gridTemplateAreas: {
    default: [
      '. switcher .',
      '. theme .',
      'example example example'
    ],
    lg: [
      '. switcher theme .',
      'example example example example'
    ]
  },
  paddingTop: {
    default: 12,
    lg: 24
  }
});

const switcher = style({
  gridArea: 'switcher',
  justifySelf: {
    default: 'center',
    lg: 'start'
  },
  overflow: 'auto',
  maxWidth: 'full',
  padding: 4,
  margin: -4
});

const themePicker = style({
  gridArea: 'theme',
  width: 182,
  marginTop: {
    default: 12,
    lg: 0
  },
  justifySelf: {
    default: 'center',
    lg: 'start'
  }
});

export const ExampleSwitcherContext = createContext<Key | null>(null);

const DEFAULT_EXAMPLES = ['Vanilla CSS', 'Tailwind'] as Key[];

export function ExampleSwitcher({type = 'style', examples = DEFAULT_EXAMPLES, children}) {
  let [selected, setSelected] = useState<Key>(examples[0]);
  let [theme, setTheme] = useState('indigo');

  useLayoutEffect(() => {
    if (!type) {
      return;
    }

    let search = new URLSearchParams(location.search);
    let exampleType = search.get(type) ?? localStorage.getItem(type);
    if (exampleType && examples.includes(exampleType)) {
      setSelected(exampleType);
    }

    let theme = localStorage.getItem('theme');
    if (theme) {
      setTheme(theme);
    }

    let controller = new AbortController();
    window.addEventListener('storage', e => {
      if (e.key === type && e.newValue && examples.includes(e.newValue)) {
        setSelected(e.newValue);
      }

      if (e.key === 'theme' && e.newValue) {
        setTheme(e.newValue);
      }
    }, {signal: controller.signal});
    return () => controller.abort();
  }, [type, examples]);

  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--tint', `var(--${theme})`);
  }, [theme]);

  let onSelectionChange = key => {
    setSelected(key);
    
    if (type) {
      localStorage.setItem(type, key);
      window.dispatchEvent(new StorageEvent('storage', {
        key: type,
        oldValue: String(selected),
        newValue: String(key)
      }));
    }
  };

  let onThemeChange = key => {
    setTheme(key);
    localStorage.setItem('theme', key);
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'theme',
      oldValue: String(theme),
      newValue: String(key)
    }));
  };

  return (
    <div className={exampleStyle} data-example-switcher>
      <div className={switcher}>
        <SegmentedControl aria-label={type || 'example'} selectedKey={selected} onSelectionChange={onSelectionChange}>
          {examples.map(example => <SegmentedControlItem key={example} id={example}>{example}</SegmentedControlItem>)}
        </SegmentedControl>
      </div>
      {selected === 'Vanilla CSS' &&
        <Picker
          label="Theme"
          labelPosition="side"
          value={theme}
          onChange={onThemeChange}
          styles={themePicker}
          contextualHelp={
            <ContextualHelp>
              <Heading>Vanilla CSS theme</Heading>
              <Content>This sets the <code className={style({font: 'code-sm'})}>--tint</code> CSS variable used by the Vanilla CSS examples.</Content>
            </ContextualHelp>
          }>
          <PickerItem id="indigo">Indigo</PickerItem>
          <PickerItem id="blue">Blue</PickerItem>
          <PickerItem id="cyan">Cyan</PickerItem>
          <PickerItem id="turquoise">Turquoise</PickerItem>
          <PickerItem id="green">Green</PickerItem>
          <PickerItem id="yellow">Yellow</PickerItem>
          <PickerItem id="orange">Orange</PickerItem>
          <PickerItem id="red">Red</PickerItem>
          <PickerItem id="pink">Pink</PickerItem>
          <PickerItem id="purple">Purple</PickerItem>
        </Picker>
      }
      <div style={{gridArea: 'example'}}>
        <ExampleSwitcherContext.Provider value={selected}>
          {children[examples.indexOf(selected)]}
        </ExampleSwitcherContext.Provider>
      </div>
    </div>
  );
}
