import path from 'path';
import ts from 'typescript';
import {ComponentDoc, Parser} from 'react-docgen-typescript';
import net from 'net';
import fs from 'fs';
import type {PluginOptions} from '@parcel/types';

export function getCacheDir(options: PluginOptions) {
  return path.join(options.projectRoot, 'node_modules', '.cache', 'docgen');
}

function getSocketPath(options: PluginOptions) {
  return process.platform === 'win32' ? path.join('\\\\?\\pipe', getCacheDir(options), options.instanceId) : path.join(getCacheDir(options), options.instanceId);
}

// TypeScript is single threaded, but Parcel is multi-threaded.
// Create an IPC service that all Parcel threads will communicate with via a socket.
async function createService(options: PluginOptions) {
  let dir = getCacheDir(options);
  fs.mkdirSync(dir, {recursive: true});

  let requested = new Map();
  let server = net.createServer((socket) => {
    // Protocol is newline delimited JSON.
    let buf = '';
    socket.on('data', data => {
      buf += data.toString();

      while (true) {
        let index = buf.indexOf('\n');
        if (index < 0) {
          break;
        }

        let line = buf.slice(0, index);
        buf = buf.slice(index + 1);

        let request = JSON.parse(line);
        let docs = requested.get(request.path);
        if (!docs) {
          docs = parseStory(program, request.path);
          requested.set(request.path, docs);
        }
        socket.write(JSON.stringify({req: request.req, res: docs}) + '\n');
      }
    });

    socket.on('error', () => {});
  });
  
  await new Promise<void>((resolve, reject) => {
    let sock = getSocketPath(options);
    server.listen(sock, () => resolve());
    server.on('error', e => {
      // @ts-ignore
      if (e.code === 'EEXIST') {
        // If the file already exists, but is not in use, delete it and try again.
        fs.unlinkSync(sock);
        server.listen(sock, () => resolve());
      } else {
        reject(e);
      }
    });
  });

  let compilerOptions = {
    jsx: ts.JsxEmit.React,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.Latest
  };
  
  let program: ts.Program;
  if (options.hmrOptions) {
    let host = ts.createWatchCompilerHost(
      './tsconfig.json',
      compilerOptions,
      ts.sys,
      ts.createSemanticDiagnosticsBuilderProgram,
      undefined,
      () => {}
    );

    // Write a sentinel file when TypeScript updates.
    // This will cause Parcel to update everything that depends on it.
    host.afterProgramCreate = (p) => {
      program = p.getProgram();
      let changed = false;
      for (let [path, docs] of requested) {
        let newDocs = parseStory(program, path);
        if (JSON.stringify(docs) !== JSON.stringify(newDocs)) {
          changed = true;
          requested.set(path, newDocs);
        }
      }
      if (changed) {
        fs.writeFileSync(path.join(dir, 'sentinel'), Date.now().toString());
      }
    };

    let watch = ts.createWatchProgram(host);
    program = watch.getProgram().getProgram();
  } else {
    let {fileNames, options: tsOptions} = getTSConfigFile('./tsconfig.json');
    compilerOptions = {
      ...compilerOptions,
      ...tsOptions
    };

    program = ts.createProgram(fileNames, compilerOptions);
  }
}

function parseStory(program: ts.Program, filePath: string) {
  // TODO: move this into a config file?
  let excludedProps = new Set([
    'id',
    'slot',
    'onCopy',
    'onCut',
    'onPaste',
    'onCompositionStart',
    'onCompositionEnd',
    'onCompositionUpdate',
    'onSelect',
    'onBeforeInput',
    'onInput',
    'onKeyDown',
    'onKeyUp',
    'onHoverStart',
    'onHoverEnd',
    'onHoverChange',
    'onFocus',
    'onBlur',
    'onFocusChange',
    'onScroll'
  ]);
  
  let parser = new Parser(program, {
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
    propFilter: (prop) => !prop.name.startsWith('aria-') && !excludedProps.has(prop.name)
  });

  let checker = program.getTypeChecker();
  let sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) {
    return null;
  }

  let moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) {
    return null;
  }

  // Find the default export of the story file.
  let exports = checker.getExportsOfModule(moduleSymbol);
  let symbol = exports.find(s => s.getName() === 'default');
  if (!symbol) {
    return null;
  }

  // Resolve the value.
  let decl: ts.Node | undefined = symbol.valueDeclaration || symbol.declarations?.[0];
  if (decl && ts.isExportAssignment(decl)) {
    symbol = checker.getSymbolAtLocation(decl.expression);
    if (!symbol) {
      return null;
    }
  }

  decl = symbol.valueDeclaration || symbol.declarations?.[0];
  if (!decl) {
    return null;
  }

  if (decl && ts.isVariableDeclaration(decl)) {
    decl = decl.initializer;
  }

  if (decl && ts.isObjectLiteralExpression(decl)) {
    // Find the component property, and follow it to the original definition.
    let component = decl.properties.find(p => p.name && ts.isIdentifier(p.name) && p.name.text === 'component');
    if (component && ts.isPropertyAssignment(component)) {
      symbol = checker.getSymbolAtLocation(component.initializer);
      if (symbol) {
        let info = parser.getComponentInfo(symbol, sourceFile);
        if (info) {
          sortProps(info);
        }
        return info;
      }
    }
  }

  return null;
}

function sortProps(doc: ComponentDoc) {
  // Sort props
  doc.props = Object.fromEntries(Object.entries(doc.props).sort(([, a], [, b]) => {
    // Required props first
    if (a.required !== b.required) {
      return a.required ? -1 : 1;
    }
    // Props from node_modules last.
    if (a.parent?.fileName.includes('node_modules') !== b.parent?.fileName.includes('node_modules')) {
      return a.parent?.fileName.includes('node_modules') ? 1 : -1;
    }
    // Events last.
    if (/^on[A-Z]/.test(a.name) !== /^on[A-Z]/.test(b.name)) {
      return /^on[A-Z]/.test(a.name) ? 1 : -1;
    }
    // Alphabetical.
    return a.name.localeCompare(b.name);
  }));
}

export interface Client {
  getDocs(path: string): Promise<ComponentDoc | null>
}

function createClient(options: PluginOptions): Promise<Client> {
  return new Promise(resolve => {
    let i = 0;
    let waiting = new Map();
    let client = net.createConnection({path: getSocketPath(options)}, () => {
      resolve({
        getDocs(path: string) {
          // Queue a new request.
          let req = i++;
          return new Promise(resolve => {
            waiting.set(req, resolve);
            client.write(JSON.stringify({req, path}) + '\n');
          });
        }
      });
    });

    // Protocol is newline delimited JSON.
    let buf = '';
    client.on('data', data => {
      buf += data.toString();

      while (true) {
        let index = buf.indexOf('\n');
        if (index < 0) {
          break;
        }

        let line = buf.slice(0, index);
        buf = buf.slice(index + 1);

        let response = JSON.parse(line);
        let resolve = waiting.get(response.req);
        if (resolve) {
          resolve(response.res);
        }
      }
    });

    client.on('error', () => {});
  });
}

let clients = new Map();
export async function getClient(options: PluginOptions): Promise<Client> {
  let client = clients.get(options.instanceId);
  if (client) {
    return client;
  }

  try {
    await createService(options);
  } catch (err) {
    if (err.code !== 'EADDRINUSE') {
      throw err;
    }
  }

  client = await createClient(options);
  clients.set(options.instanceId, client);
  return client;
}

// Based on https://github.com/hipstersmoothie/react-docgen-typescript-plugin
// MIT license.
function getTSConfigFile(tsconfigPath: string): ts.ParsedCommandLine {
  try {
    const basePath = path.dirname(tsconfigPath);
    const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);

    return ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      basePath,
      {},
      tsconfigPath
    );
  } catch {
    return {} as ts.ParsedCommandLine;
  }
}
