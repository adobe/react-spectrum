const {Namer} = require('@parcel/plugin');
const path = require('path');

module.exports = new Namer({
  name({bundle}) {
    if (bundle.needsStableName && bundle.target.distEntry) {
      return bundle.target.distEntry;
    }
    let mainAsset = bundle.getMainEntry();
    let ext = '.' + bundle.type;
    if (bundle.type === 'js') {
      ext = bundle.env.outputFormat === 'esmodule' ? '.mjs' : '.cjs';
    }
    return path.basename(mainAsset.filePath, path.extname(mainAsset.filePath)).replace(/^S2_Icon_(.*?)_\d+(?:x\d+)?_N$/, '$1') + ext;
  }
});
