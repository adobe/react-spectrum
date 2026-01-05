import {CodeOutput, Control, Output, VisualExampleClient} from './VisualExampleClient';
import {DownloadFiles, Files, getFiles} from './CodeBlock';
import {FileProvider, ShadcnProvider} from './CodePlatter';
import json5 from 'json5';
import path from 'path';
import React, {ReactNode} from 'react';
import {renderHTMLfromMarkdown, TComponent, TInterface, TProperty, Type} from './types';
import {size, style} from '@react-spectrum/s2/style' with { type: 'macro' };

const exampleStyle = style({
  backgroundColor: 'layer-1',
  padding: {
    default: 12,
    lg: 24
  },
  marginTop: {
    default: 20,
    ':is([data-example-switcher] *)': 0
  },
  borderRadius: 'xl',
  display: 'grid',
  gridTemplateAreas: {
    default: [
      'example',
      'controls',
      'files'
    ],
    lg: {
      layout: {
        narrow: [
          'example controls',
          'files controls'
        ],
        wide: [
          'example controls',
          'files files'
        ]
      }
    }
  },
  gridTemplateColumns: {
    default: ['1fr'],
    lg: ['1fr', 'auto']
  },
  gridTemplateRows: {
    default: ['auto', 'auto', 'auto'],
    lg: ['1fr', 'auto']
  },
  gap: {
    default: 12,
    lg: 24
  },
  width: 'full',
  boxSizing: 'border-box'
});

const controlsStyle = style({
  display: 'grid',
  gridTemplateColumns: {
    default: `repeat(auto-fit, minmax(${size(130)}, 1fr))`,
    lg: ['1fr']
  },
  gridAutoFlow: 'dense',
  gridAutoRows: 'min-content',
  maxWidth: 'full',
  // overflow: 'hidden',
  gap: {
    default: 12,
    lg: 16
  },
  gridArea: 'controls',
  borderStyle: 'solid',
  borderWidth: 0,
  borderColor: 'gray-200',
  borderTopWidth: {
    default: 1,
    lg: 0
  },
  paddingTop: {
    default: 16,
    lg: 0
  }
});

export interface VisualExampleProps {
  /** The component to render. */
  component: any,
  /** The TS docs for this component. */
  docs: TComponent | TInterface,
  links: any,
  /** The props to display as controls. */
  props: string[],
  /** Component children slots that should have controls. */
  slots?: {[slot: string]: boolean},
  /** Initial values for the prop controls. */
  initialProps?: {[prop: string]: any},
  controlOptions?: {[prop: string]: any},
  importSource?: string,
  /** When provided, the source code for the listed filenames will be included as tabs. */
  files?: string[],
  downloadFiles?: DownloadFiles,
  type?: 'vanilla' | 'tailwind' | 's2',
  code?: ReactNode,
  wide?: boolean,
  align?: 'center' | 'start' | 'end',
  acceptOrientation?: boolean,
  propsObject?: string,
  showCoachMark?: boolean,
  hideShadcn?: boolean
}

export interface PropControl extends Omit<TProperty, 'description'> {
  description: ReactNode,
  default: any,
  valueType: ReactNode,
  slots?: {[slot: string]: boolean},
  options?: any
}

/**
 * Displays a component example with controls for changing the props.
 */
export function VisualExample({component, docs, links, importSource, props, initialProps, controlOptions, files, downloadFiles, code, wide, slots, align, acceptOrientation, type, propsObject, showCoachMark, hideShadcn}: VisualExampleProps) {
  let componentProps = docs.type === 'interface' ? docs : docs.props;
  if (componentProps?.type !== 'interface') {
    return null;
  }

  // Filter down the list of controls from the TS docs to only the ones we want to display.
  // This reduces the amount of data we need to send to the client.
  let controls = Object.fromEntries(props.map(name => {
    let prop = componentProps.properties[name];
    if (prop.type === 'method') {
      throw new Error('Unexpected method in props.');
    }

    // Resolve the value type if it is a type alias.
    if (prop.value?.type === 'link' && links?.[prop.value.id]) {
      let value = links[prop.value.id];
      if (value?.type === 'alias') {
        value = value.value;
      }
      prop = {...prop, value};
    }

    // Try to parse the default value from the JSDocs as JSON.
    let defaultValue = prop.default ?? undefined;
    if (typeof defaultValue === 'string') {
      defaultValue = defaultValue.replace(/^['"](.+)['"].*$/, '"$1"');
      try {
        defaultValue = json5.parse(defaultValue);
      } catch {
        // ignore
      }
    }

    let renderedProp: PropControl = {
      ...prop,
      description: renderHTMLfromMarkdown(prop.description, {forceInline: true}),
      default: defaultValue,
      valueType: <Type type={prop.value} />,
      slots: name === 'children' ? slots : undefined,
      options: controlOptions?.[name]
    };

    return [name, renderedProp];
  }));

  if (!importSource && files) {
    importSource = './' + path.basename(files[0], path.extname(files[0]));
  }

  if (!downloadFiles) {
    if (files) {
      downloadFiles = getFiles(files, type);
    } else {
      downloadFiles = {files: {}, deps: {}};
    }
  }

  let output = (
    <CodeOutput
      code={code}
      type={type}
      showCoachMark={showCoachMark} />
  );

  // Render the corresponding client component to make the controls interactive.
  return (
    <VisualExampleClient component={component} name={docs.name} importSource={importSource} controls={controls} initialProps={initialProps} propsObject={propsObject}>
      <FileProvider value={downloadFiles}>
        <ShadcnProvider value={!type || type === 's2' || docs.type !== 'component' || hideShadcn ? null : {type, component: docs.name}}>
          <div role="group" aria-label="Example" className={exampleStyle({layout: files || wide ? 'wide' : 'narrow'})}>
            <Output align={align} acceptOrientation={acceptOrientation} />
            {props.length > 0 && <div role="group" aria-label="Controls" className={controlsStyle}>
              {Object.keys(controls).map(control => <Control key={control} name={control} />)}
            </div>}
            <div style={{gridArea: 'files', overflow: 'hidden'}}>
              {files ? <Files files={files} downloadFiles={downloadFiles.files} type={type}>{output}</Files> : output}
            </div>
          </div>
        </ShadcnProvider>
      </FileProvider>
    </VisualExampleClient>
  );
}
