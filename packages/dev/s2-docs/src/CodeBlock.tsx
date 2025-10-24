import {Code, ICodeProps} from './Code';
import {CodePlatter, Pre} from './CodePlatter';
import {ExampleOutput} from './ExampleOutput';
import {ExpandableCode} from './ExpandableCode';
import fs from 'fs';
import {highlight, Language} from 'tree-sitter-highlight';
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
    ':is([data-example-switcher] *)': 0
  },
  padding: {
    default: 12,
    lg: 24
  }
});

const standaloneCode = style({
  '--code-padding-x': {
    type: 'paddingTop',
    value: 32
  },
  padding: '--code-padding-x',
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
  hidden?: boolean,
  hideExampleCode?: boolean,
  includeAllImports?: boolean
}

export function CodeBlock({render, children, files, expanded, hidden, hideExampleCode, includeAllImports, ...props}: CodeBlockProps) {
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

  let content = hideExampleCode ? null : (
    <CodePlatter
      files={files ? getFiles(files) : undefined}
      type={props.type}>
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
          ? <Files files={includeAllImports ? findAllFiles(files) : files} maxLines={expanded ? Infinity : 6}>{content}</Files>
          : content}
      </div>
    </div>
  );
}

export function CodeBlockBase({children, lang}: {children: string, lang: string}) {
  // @ts-ignore
  let highlighted = highlight(children, Language[lang.toUpperCase()]);
  return (
    <pre className="m-0">
      <code className="source" dangerouslySetInnerHTML={{__html: highlighted}} />
    </pre>
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
    <ExpandableCode hasHighlightedLine={/- begin (highlight|focus)/.test(children)}>
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

export function Files({children, files, defaultSelected, maxLines}: {children?: ReactNode, files: string[], defaultSelected?: string, maxLines?: number}) {
  let allFiles = getFiles(files);
  return (
    <Tabs
      key={files.join('|')}
      aria-label="Files"
      defaultSelectedKey={defaultSelected || (children ? 'example' : undefined)}
      density="compact">
      <TabList styles={style({marginBottom: 20})}>
        {children && <Tab id="example">Example</Tab>}
        {files.map(file => <Tab key={file} id={file}>{path.basename(file)}</Tab>)}
      </TabList>
      {children && <TabPanel id="example">{children}</TabPanel>}
      {files.map(file => <TabPanel key={file} id={file}><File filename={file} maxLines={maxLines} files={allFiles} /></TabPanel>)}
    </Tabs>
  );
}

export function File({filename, maxLines, files}: {filename: string, maxLines?: number, files?: {[name: string]: string}}) {
  let contents = fs.readFileSync(path.isAbsolute(filename) ? filename : '../../../' + filename, 'utf8').replace(/(vanilla-starter|tailwind-starter)\//g, './');
  return (
    <CodePlatter files={files}>
      <TruncatedCode lang={path.extname(filename).slice(1)} hideImports={false} maxLines={maxLines}>{contents}</TruncatedCode>
    </CodePlatter>
  );
}

// Reads files, parses imports, and loads recursively.
export function getFiles(files: string[]) {
  files = findAllFiles(files);
  let fileContents = {};
  for (let file of files) {
    let name = path.basename(file);
    let contents = fs.readFileSync(file, 'utf8');
    fileContents[name] = contents.replace(/(vanilla-starter|tailwind-starter)\//g, './');
  }
  
  return fileContents;
}

function findAllFiles(files: string[]) {
  let queue: string[] = [...files];
  let allFiles = new Map();
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
    allFiles.set(name, file);

    for (let [, specifier] of contents.matchAll(/import(?:.|\n)+?['"](.+)['"]/g)) {
      specifier = specifier.replace(/(vanilla-starter|tailwind-starter)\//g, (m, s) => 'starters/' + (s === 'vanilla-starter' ? 'docs' : 'tailwind') + '/src/');
      if (!/^(\.|starters)/.test(specifier)) {
        continue;
      }

      let resolved = specifier.startsWith('.') ? path.resolve(path.dirname(file), specifier) : specifier;
      if (!allFiles.has(path.basename(resolved))) {
        queue.push(resolved);
      }
    }
  }

  let providedFiles = files.map(f => {
    let name = path.basename(f);
    let res = allFiles.get(name)!;
    allFiles.delete(name);
    return res;
  });

  let addedFiles = [...allFiles.values()].sort();

  return [...providedFiles, ...addedFiles];
}
