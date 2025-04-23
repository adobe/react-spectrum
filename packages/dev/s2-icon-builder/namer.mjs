import {Namer} from '@parcel/plugin';
import path from 'path';

export default new Namer({
  name({bundle}) {
    let mainAsset = bundle.getMainEntry();
    if (bundle.needsStableName && bundle.target.distEntry) {
       console.log(bundle.target.distEntry);
       return false;
    }
    let ext = '.' + bundle.type;
    if (bundle.type === 'js') {
      ext = bundle.env.outputFormat === 'esmodule' ? '.mjs' : '.cjs';
    }
    let originalExt = path.extname(mainAsset.filePath);
    let name = path.basename(mainAsset.filePath, originalExt).replace(/\*/g, 'intlStrings');
    let m = mainAsset.filePath.match(/spectrum-illustrations\/(linear|gradient\/generic\d)/);
    if (m) {
      if (originalExt === '.svg') {
        console.log(m[1] + '/internal/' + name + ext);
        return false;
      }
      console.log(m[1] + '/' + name + ext);
      return false;
    }
    console.log(name
      .replace(/^S2_Icon_(.*?)(Size\d+)?_\d+(?:x\d+)?_N$/, '$1')
      .replace(/^S2_(fill|lin)_(.+)_(generic\d)_(\d+)$/, (m, type, name, style) => {
        name = name[0].toUpperCase() + name.slice(1).replace(/_/g, '');
        return 'gradient/' + style + '/' + name;
      })
      .replace(/\.module$/, '_module')
      + ext);
    return false;
  }
});
