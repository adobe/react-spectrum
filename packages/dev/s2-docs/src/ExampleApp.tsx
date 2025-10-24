import fs from 'fs/promises';
import path from 'path';
import {Files} from './CodeBlock';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

export async function ExampleApp({dir, defaultSelected}: {dir: string, defaultSelected?: string}) {
  let files = await fs.readdir('../../../' + dir);
  return (
    <div className={style({marginTop: 32, backgroundColor: 'layer-1', borderRadius: 'xl', padding: {default: 12, lg: 24}})}>
      <Files files={files.map(f => path.join(dir, f))} defaultSelected={defaultSelected ? path.join(dir, defaultSelected) : undefined} maxLines={Infinity} />
    </div>
  );
}
