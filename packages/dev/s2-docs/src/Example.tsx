import { Tab, TabList, TabPanel, Tabs } from '@react-spectrum/s2';
import {Code} from './Code';
import {ExampleCode} from './ExampleCode';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import fs from 'fs';
import path from 'path';
import { VisualExample } from './VisualExample';

const example = style({
  backgroundColor: 'layer-1',
  borderRadius: 'xl',
  marginY: 32,
  padding: 24
});

const output = style({
  // padding: 32,
  marginBottom: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // borderWidth: 0,
  // borderBottomWidth: 2,
  // borderColor: 'gray-25',
  // borderStyle: 'solid',
  font: 'ui'
});

export function Example({render, children, files, expanded, ...props}) {
  if (!render) {
    return (
      <pre className={style({padding: 32, marginY: 32, backgroundColor: 'layer-1', borderRadius: 'xl', font: 'code-sm', whiteSpace: 'pre-wrap'})}>
        <Code {...props}>{children}</Code>
      </pre>
    );
  }

  if (props.docs) {
    return <VisualExample component={render} files={files} code={<Code {...props} hideImports>{children}</Code>} {...props} />;
  }

  let content = <ExpandableCode expanded={expanded} {...props}>{children}</ExpandableCode>;

  return (
    <div className={example}>
      <div className={output}>
        <div>{render}</div>
      </div>
      <div>
        <Files files={files}>{content}</Files>
      </div>
    </div>
  );
}

function ExpandableCode({children, expanded, ...props}) {
  let lines = children.split('\n').length;
  //   backgroundColor: 'layer-2', borderRadius: 'lg', padding: 16, marginTop: 20

  return !expanded && lines > 6
  ? (
    <ExampleCode>
      <pre className={style({padding: 16, margin: 0, backgroundColor: 'layer-2', borderRadius: 'lg', font: 'code-sm', whiteSpace: 'pre-wrap'})}>
        <Code {...props}>{children}</Code>
      </pre>
    </ExampleCode>
  )
  : (
    <pre className={style({padding: 16, margin: 0, backgroundColor: 'layer-2', borderRadius: 'lg', font: 'code-sm', whiteSpace: 'pre-wrap'})}>
      <Code {...props}>{children}</Code>
    </pre>
  );
}

export function Files({children, files}) {
  if (!files) {
    return children;
  }

  return (
    <Tabs aria-label="Files" defaultSelectedKey="example" density="compact">
      <TabList styles={style({marginBottom: 20})}>
        <Tab id="example">Example</Tab>
        {files.map(file => <Tab key={file} id={file}>{path.basename(file)}</Tab>)}
      </TabList>
      <TabPanel id="example">{children}</TabPanel>
      {files.map(file => <TabPanel key={file} id={file}><File filename={file} /></TabPanel>)}
    </Tabs>
  );
}

export function File({filename}) {
  let contents = fs.readFileSync(filename, 'utf8');
  return <ExpandableCode lang={path.extname(filename).slice(1)}>{contents}</ExpandableCode>;
}
