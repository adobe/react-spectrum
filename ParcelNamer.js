const {Namer} = require('@parcel/plugin');
const path = require('path');

module.exports = new Namer({
  name({bundle}) {
    if (bundle.needsStableName && bundle.target.distEntry) {
      return bundle.target.distEntry;
    }
    let mainAsset = bundle.getMainEntry();
    let ext = '.' + (bundle.type === 'js' && bundle.env.outputFormat === 'esmodule' ? 'mjs' : bundle.type);
    return path.basename(mainAsset.filePath, path.extname(mainAsset.filePath)) + ext;
  }
});
