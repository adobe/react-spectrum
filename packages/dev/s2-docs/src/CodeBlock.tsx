// @ts-ignore
import assets from 'url:../pages/**/*.{png,jpg,svg}' with {env: 'react-client'};
import {cache, ReactNode} from 'react';
import {Code, ICodeProps} from './Code';
import {CodePlatter, FileProvider, Pre} from './CodePlatter';
import {ExampleOutput} from './ExampleOutput';
import {ExpandableCode} from './ExpandableCode';
import {findPackageJSON} from 'module';
import fs from 'fs';
import {highlight, Language} from 'tree-sitter-highlight';
import path from 'path';
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
  '--code-padding-start': {
    type: 'paddingStart',
    value: {
      default: 12,
      lg: 32
    }
  },
  '--code-padding-end': {
    type: 'paddingEnd',
    value: '--code-padding-start'
  },
  padding: '--code-padding-start',
  marginY: {
    default: 32,
    ':is([data-example-switcher] *)': 0
  },
  backgroundColor: 'layer-1',
  borderRadius: 'xl',
  font: {
    default: 'code-xs',
    lg: 'code-sm'
  },
  overflow: 'auto'
});

interface CodeBlockProps extends VisualExampleProps {
  render?: ReactNode,
  children: string,
  dir?: string,
  files?: string[],
  expanded?: boolean,
  hidden?: boolean,
  includeAllImports?: boolean,
  showCoachMark?: boolean
}

export function CodeBlock({render, children, dir, files, expanded, hidden, includeAllImports, ...props}: CodeBlockProps) {
  if (hidden) {
    return null;
  }

  let displayCode = children.replace(/(vanilla-starter|tailwind-starter)\//g, './');

  if (!render) {
    return (
      <pre className={standaloneCode}>
        <Code {...props} styles={style({display: 'block', width: 'fit', minWidth: 'full'})}>{displayCode}</Code>
      </pre>
    );
  }

  let resolveFrom = path.resolve('pages', dir || (props.type === 's2' ? 's2' : 'react-aria'), 'index.tsx');
  let downloadFiles = getExampleFiles(resolveFrom, children, props.type);

  let code = (
    <TruncatedCode maxLines={expanded ? Infinity : 6} {...props}>
      {displayCode}
    </TruncatedCode>
  );

  if (props.docs) {
    return (
      <VisualExample
        {...props}
        component={render}
        files={files}
        downloadFiles={downloadFiles}
        code={code} />
    );
  }

  let content = (
    <FileProvider value={downloadFiles}>
      <CodePlatter
        type={props.type}
        showCoachMark={props.showCoachMark}>
        {code}
      </CodePlatter>
    </FileProvider>
  );

  return (
    <div role="group" aria-label="Example" className={example}>
      <ExampleOutput
        component={render}
        align={props.align} />
      <div>
        {files ? 
          <Files
            files={includeAllImports ? findAllFiles(files) : files}
            maxLines={expanded ? Infinity : 6}
            type={props.type}>
            {content}
          </Files>
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
    <div className={style({overflow: 'auto'})}>
      <Pre>
        <Code {...props}>{children}</Code>
      </Pre>
    </div>
  );
}

export function Files({children, files, type, defaultSelected, maxLines}: {children?: ReactNode, files: string[], type?: 'vanilla' | 'tailwind' | 's2', defaultSelected?: string, maxLines?: number}) {
  return (
    <Tabs
      key={files.join('|')}
      aria-label="Files"
      defaultSelectedKey={defaultSelected || (children ? 'example' : undefined)}
      density="compact"
      data-files>
      <TabList styles={style({marginBottom: 20})}>
        {children && <Tab id="example">Example</Tab>}
        {files.map(file => <Tab key={file} id={file}>{path.basename(file)}</Tab>)}
      </TabList>
      {children && <TabPanel id="example" shouldForceMount data-example>{children}</TabPanel>}
      {files.map(file => <TabPanel key={file} id={file}><File filename={file} maxLines={maxLines} type={type} /></TabPanel>)}
    </Tabs>
  );
}

const readFile = cache((file: string) => fs.readFileSync(file, 'utf8'));

export function File({filename, maxLines, type}: {filename: string, maxLines?: number, type?: 'vanilla' | 'tailwind' | 's2'}) {
  let contents = readFile(path.isAbsolute(filename) ? filename : path.resolve('../../../', filename)).replace(/(vanilla-starter|tailwind-starter)\//g, './');
  return (
    <CodePlatter type={type}>
      <TruncatedCode lang={path.extname(filename).slice(1)} hideImports={false} maxLines={maxLines}>{contents}</TruncatedCode>
    </CodePlatter>
  );
}

// Reads files, parses imports, and loads recursively.
export function getFiles(files: string[], type: string | undefined, npmDeps = {}) {
  let fileContents = {};
  for (let file of findAllFiles(files, npmDeps)) {
    let name = path.basename(file);
    let contents = readFile(file);
    fileContents[name] = contents
      .replace(/(vanilla-starter|tailwind-starter)\//g, './')
      .replace(/import (.*?) from ['"]url:(.*?)['"]/g, (_, name, specifier) => {
        return `const ${name} = '${resolveUrl(specifier, file)}'`;
      });
  }

  if (type === 'tailwind' && !fileContents['index.css']) {
    fileContents['index.css'] = readFile(path.resolve('../../../starters/tailwind/src/index.css'));
  }
  
  return {files: fileContents, deps: npmDeps};
}

function findAllFiles(files: string[], npmDeps = {}) {
  files = files.map(file => path.isAbsolute(file) ? file : path.resolve('../../../', file));

  let queue: string[] = [...files];
  let allFiles = new Set<string>();
  for (let i = 0; i < queue.length; i++) {
    let file = queue[i];
    let contents = readFile(file);
    allFiles.add(file);

    let deps = parseFile(file, contents, npmDeps);
    for (let dep of deps) {
      if (!allFiles.has(dep)) {
        queue.push(dep);
      }
    }
  }

  let addedFiles = [...allFiles.values()].filter(f => !files.includes(f)).sort();
  return [...files, ...addedFiles];
}

function parseFile(file: string, contents: string, npmDeps = {}, urls = {}) {
  let deps = new Set<string>();
  for (let [, specifier] of contents.matchAll(/import (?:.|\n)*?['"](.+?)['"]/g)) {
    specifier = specifier.replace(/(vanilla-starter|tailwind-starter)\//g, (m, s) => 'starters/' + (s === 'vanilla-starter' ? 'docs' : 'tailwind') + '/src/');
    
    if (specifier.startsWith('url:')) {
      urls[specifier] = resolveUrl(specifier.slice(4), file);
      continue;
    }
    
    if (!/^(\.|starters)/.test(specifier)) {
      let dep = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
      npmDeps[dep] ??= '^' + getPackageVersion(dep);
      continue;
    }

    let resolved = specifier.startsWith('.') ? path.resolve(path.dirname(file), specifier) : path.resolve('../../../' + specifier);
    if (path.extname(resolved) === '') {
      if (fs.existsSync(resolved + '.tsx')) {
        resolved += '.tsx';
      } else if (fs.existsSync(resolved + '.ts')) {
        resolved += '.ts';
      }
    }

    deps.add(resolved);
  }

  return deps;
}

function getExampleFiles(file: string, contents: string, type: string | undefined) {
  let npmDeps = {};
  let urls = {};
  let fileDeps = parseFile(file, contents, npmDeps, urls);
  let {files} = getFiles([...fileDeps], type, npmDeps);
  return {files, deps: npmDeps, urls};
}

let packageVersionCache = new Map<string, string>();
function getPackageVersion(pkg: string) {
  let version = packageVersionCache.get(pkg);
  if (version) {
    return version;
  }

  let p = findPackageJSON(pkg, __filename);
  if (p) {
    let json = JSON.parse(fs.readFileSync(p, 'utf8'));
    packageVersionCache.set(pkg, json.version);
    return json.version;
  } else {
    throw new Error('Could not find package.json for ' + pkg);
  }
}

function resolveUrl(specifier: string, file: string) {
  let relative = path.relative(path.resolve('pages'), path.dirname(file)).split(/[/\\]/);
  let cur = assets;
  for (let part of [...relative, ...specifier.slice(2).split('/')]) {
    let p = part.split('.');
    cur = cur[p[0]];
    if (!cur) {
      throw new Error('Could not resolve URL ' + specifier);
    }

    if (p[1]) {
      cur = cur[p[1]];
    }
  }

  let publicUrl = process.env.PUBLIC_URL || 'http://localhost:1234';
  return publicUrl + cur;
}
