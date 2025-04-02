import { Tab, TabList, TabPanel, Tabs } from '@react-spectrum/s2';
import {Code} from './Code';
import {ExampleCode} from './ExampleCode';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import fs from 'fs';
import path from 'path';

const example = style({
  backgroundColor: 'layer-1',
  borderRadius: 'xl',
  marginY: 32
});

const output = style({
  padding: 32,
  borderWidth: 0,
  borderBottomWidth: 2,
  borderColor: 'gray-25',
  borderStyle: 'solid',
  font: 'ui'
});

export function Example({render, children, files, ...props}) {
  if (!render) {
    return (
      <pre className={style({padding: 32, marginY: 32, backgroundColor: 'layer-1', borderRadius: 'xl', font: 'code-sm', whiteSpace: 'pre-wrap'})}>
        <Code {...props}>{children}</Code>
      </pre>
    );
  }

  let content = <ExpandableCode {...props}>{children}</ExpandableCode>;

  return (
    <div className={example}>
      <div className={output}>
        {render}
      </div>
      <div className={style({marginX: 32})}>
        <Files files={files}>{content}</Files>
      </div>
    </div>
  );
}

function ExpandableCode({children, ...props}) {
  let lines = children.split('\n').length;
  return lines > 5 
  ? (
    <ExampleCode>
      <pre className={style({padding: 32, paddingBottom: 0, margin: 0, backgroundColor: 'layer-1', borderRadius: 'xl', font: 'code-sm', whiteSpace: 'pre-wrap'})}>
        <Code {...props}>{children}</Code>
      </pre>
    </ExampleCode>
  )
  : (
    <pre className={style({padding: 32, margin: 0, backgroundColor: 'layer-1', borderRadius: 'xl', font: 'code-sm', whiteSpace: 'pre-wrap'})}>
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
      <TabList>
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
