import {FileProvider} from './CodePlatter';
import {Files, getFiles} from './CodeBlock';
import fs from 'fs/promises';
import path from 'path';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

export async function ExampleApp({dir, defaultSelected, type}: {dir: string, defaultSelected?: string, type?: 'tailwind' | 'vanilla' | 's2'}) {
  let files = (await fs.readdir('../../../' + dir, {withFileTypes: true})).filter(d => d.isFile()).map(d => path.join(dir, d.name));
  let {files: downloadFiles, deps} = getFiles(files, type);

  return (
    <div className={style({marginTop: 32, backgroundColor: 'layer-1', borderRadius: 'xl', padding: {default: 12, lg: 24}})}>
      <FileProvider value={{files: downloadFiles, deps, entry: defaultSelected}}>
        <Files
          files={files}
          downloadFiles={downloadFiles}
          defaultSelected={defaultSelected}
          maxLines={Infinity}
          type={type} />
      </FileProvider>
    </div>
  );
}
