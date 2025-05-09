import {CodeOutput, Control, Output, VisualExampleClient} from './VisualExampleClient';
import {Files} from './Example';
import path from 'path';
import React from 'react';
import {renderHTMLfromMarkdown, Type} from './types';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };

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

export function VisualExample({component, docs, links, importSource, props, initialProps, files, code, wide, slots, iconSlot}) {
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
    prop = {
      ...prop,
      description: renderHTMLfromMarkdown(prop.description, {forceInline: true}),
      default: defaultValue,
      valueType: <Type type={prop.value} links={links} />
    };

    if (iconSlot && name === 'children') {
      prop.icon = true;
    }

    if (name === 'children') {
      Object.assign(prop, slots);
    }

    return [name, prop];
  }));

  if (!importSource && files) {
    importSource = './' + path.basename(files[0], path.extname(files[0]));
  }

  return (
    <VisualExampleClient component={component} name={docs.name} importSource={importSource} controls={controls} initialProps={initialProps}>
      <div className={exampleStyle({isFiles: !!files || wide})}>
        <Output />
        <div className={style({display: 'flex', flexDirection: 'column', gap: 16, gridArea: 'controls'})}>
          {Object.keys(controls).map(control => <Control key={control} name={control} />)}
        </div>
        <div style={{gridArea: 'files'}}>
          <Files files={files}>
            <CodeOutput code={code} />
          </Files>
        </div>
      </div>
    </VisualExampleClient>
  );
}

export {StylingExamples} from './VisualExampleClient';
// export function StylingExamples({children}) {
//   return (
//     <Tabs aria-label="Examples" defaultSelectedKey="vanilla">
//       <TabList>
//         <Tab id="vanilla">Vanilla CSS</Tab>
//         <Tab id="tailwind">Tailwind</Tab>
//       </TabList>
//       <TabPanel id="vanilla">
//         {children[0]}
//       </TabPanel>
//       <TabPanel id="tailwind">
//         {children[1]}
//       </TabPanel>
//     </Tabs>
//   )
// }
