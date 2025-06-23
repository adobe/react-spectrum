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
  padding: {
    default: 12,
    lg: 24
  }
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
  font: {
    default: 'code-xs',
    lg: 'code-sm'
  },
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

  children = children.replace(/(vanilla-starter|tailwind-starter)\//g, './');

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
  let lines = children.split('\n');
  return lines.length > maxLines
  ? (
    <ExpandableCode hasHighlightedLine={children.includes('- begin highlight')}>
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
      <TruncatedCode lang={path.extname(filename).slice(1)} hideImports={false}>{contents}</TruncatedCode>
    </CodePlatter>
  );
}

// Reads files, parses imports, and loads recursively.
export function getFiles(files: string[]) {
  let queue: string[] = [...files];
  let fileContents = {};
  for (let i = 0; i < queue.length; i++) {
    let file = path.isAbsolute(queue[i]) ? queue[i] : path.resolve('../../../' + queue[i]);
    if (path.extname(file) === '') {
      if (fs.existsSync(file + '.tsx')) {
        file += '.tsx';
      } else if (fs.existsSync(file + '.ts')) {
        file += '.ts';
      }
    }

    let name = path.basename(file);
    let contents = fs.readFileSync(file, 'utf8');
    fileContents[name] = contents;

    for (let [, specifier] of contents.matchAll(/import(?:.|\n)+?['"](.+)['"]/g)) {
      if (!specifier.startsWith('.')) {
        continue;
      }

      let resolved = path.resolve(path.dirname(file), specifier);
      if (!fileContents[path.basename(resolved)]) {
        queue.push(resolved);
      }
    }
  }
  
  return fileContents;
}
