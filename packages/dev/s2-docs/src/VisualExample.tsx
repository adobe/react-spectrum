// "use client";

import React, { useState } from 'react';
// import { Divider } from '@react-spectrum/s2';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
import { VisualExampleClient, Output, CodeOutput, Control } from './VisualExampleClient';
import { Code } from './Code';
import { renderHTMLfromMarkdown } from './types';
import { Files } from './Example';
import {Tabs, TabList, Tab, TabPanel} from '@react-spectrum/s2';

const exampleStyle = style({
  backgroundColor: 'layer-1',
  padding: 24,
  marginTop: 20,
  borderRadius: 'xl',
  display: 'grid',
  gridTemplateAreas: {
    default: [
      'example controls',
      'files controls'
    ],
    isFiles: [
      'example controls',
      'files files'
    ]
  },
  gridTemplateColumns: ['1fr', 'auto'],
  gridTemplateRows: ['1fr', 'auto'],
  gap: 24,
  width: 'full',
  boxSizing: 'border-box'
});

export function VisualExample({component, docs, links, props, initialProps, files}) {
  let controls = Object.fromEntries(props.map(name => {
    let prop = docs.props.properties[name];

    if (prop.value?.type === 'link' && links?.[prop.value.id]) {
      let value = links[prop.value.id];
      if (value?.type === 'alias') {
        value = value.value;
      }
      prop = {...prop, value};
    }

    let defaultValue = prop.default ?? undefined;
    if (typeof defaultValue === 'string') {
      defaultValue = defaultValue.replace(/^['"](.+)['"]$/, '"$1"');
      try {
        defaultValue = JSON.parse(defaultValue);
      } catch {
        // ignore
      }
    }
    prop = {...prop, description: renderHTMLfromMarkdown(prop.description, {forceInline: true}), default: defaultValue};
    return [name, prop];
  }));

  return (
    <VisualExampleClient component={component} name={docs.name} controls={controls} initialProps={initialProps}>
      <div className={exampleStyle({isFiles: !!files})}>
        <Output />
        <div className={style({display: 'flex', flexDirection: 'column', gap: 16, gridArea: 'controls'})}>
          {Object.keys(controls).map(control => <Control key={control} name={control} />)}
        </div>
        <div style={{gridArea: 'files'}}>
          <Files files={files}>
            <CodeOutput />
          </Files>
        </div>
      </div>
    </VisualExampleClient>
  );
}

export function StylingExamples({children}) {
  return (
    <Tabs aria-label="Examples" defaultSelectedKey="vanilla">
      <TabList>
        <Tab id="vanilla">Vanilla CSS</Tab>
        <Tab id="tailwind">Tailwind</Tab>
      </TabList>
      <TabPanel id="vanilla">
        {children[0]}
      </TabPanel>
      <TabPanel id="tailwind">
        {children[1]}
      </TabPanel>
    </Tabs>
  )
}
