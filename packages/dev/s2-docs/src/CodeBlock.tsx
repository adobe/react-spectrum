import {Code, ICodeProps} from './Code';
import {CodePlatter, Pre} from './CodePlatter';
import {ExampleOutput} from './ExampleOutput';
import {ExpandableCode} from './ExpandableCode';
import fs from 'fs';
import path from 'path';
import {ReactNode} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Tab, TabList, TabPanel, Tabs} from '@react-spectrum/s2';
import {VisualExample, VisualExampleProps} from './VisualExample';

const example = style({
  backgroundColor: 'layer-1',
  borderRadius: 'xl',
  marginY: {
    default: 32,
    ':is([data-example-switcher] > *)': 0
  },
  padding: 24
});

const standaloneCode = style({
  '--code-padding': {
    type: 'paddingTop',
    value: 32
  },
  padding: '--code-padding',
  marginY: 32,
  backgroundColor: 'layer-1',
  borderRadius: 'xl',
  font: 'code-sm',
  whiteSpace: 'pre-wrap'
});

interface CodeBlockProps extends VisualExampleProps {
  render?: ReactNode,
  children: string,
  files?: string[],
  expanded?: boolean,
  hidden?: boolean
}

export function CodeBlock({render, children, files, expanded, hidden, ...props}: CodeBlockProps) {
  if (hidden) {
    return null;
  }

  if (!render) {
    return (
      <pre className={standaloneCode}>
        <Code {...props}>{children}</Code>
      </pre>
    );
  }

  let code = (
    <TruncatedCode maxLines={expanded ? Infinity : 6} {...props}>
      {children}
    </TruncatedCode>
  );

  if (props.docs) {
    return (
      <VisualExample
        {...props}
        component={render}
        files={files}
        code={code} />
    );
  }

  let content = (
    <CodePlatter>
      {code}
    </CodePlatter>
  );

  return (
    <div className={example}>
      <ExampleOutput
        component={render}
        align={props.align} />
      <div>
        {files 
          ? <Files files={files}>{content}</Files>
          : content}
      </div>
    </div>
  );
}

interface TruncatedCodeProps extends ICodeProps {
  children: string,
  maxLines?: number
}

function TruncatedCode({children, maxLines = 6, ...props}: TruncatedCodeProps) {
  let lines = children.split('\n').length;
  return lines > maxLines
  ? (
    <ExpandableCode>
      <Pre>
        <Code {...props}>{children}</Code>
      </Pre>
    </ExpandableCode>
  )
  : (
    <Pre>
      <Code {...props}>{children}</Code>
    </Pre>
  );
}

export function Files({children, files}: {children?: ReactNode, files: string[]}) {
  return (
    <Tabs aria-label="Files" defaultSelectedKey="example" density="compact">
      <TabList styles={style({marginBottom: 20})}>
        {children && <Tab id="example">Example</Tab>}
        {files.map(file => <Tab key={file} id={file}>{path.basename(file)}</Tab>)}
      </TabList>
      {children && <TabPanel id="example">{children}</TabPanel>}
      {files.map(file => <TabPanel key={file} id={file}><File filename={file} /></TabPanel>)}
    </Tabs>
  );
}

export function File({filename}: {filename: string}) {
  let contents = fs.readFileSync('../../../' + filename, 'utf8');
  return (
    <CodePlatter>
      <TruncatedCode lang={path.extname(filename).slice(1)}>{contents}</TruncatedCode>
    </CodePlatter>
  );
}
