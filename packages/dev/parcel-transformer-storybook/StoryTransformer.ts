import {enrichCsf, formatCsf, loadCsf} from '@storybook/csf-tools';
import {getCacheDir} from './react-docgen-typescript';
import path from 'path';
import SourceMap from '@parcel/source-map';
import {Transformer} from '@parcel/plugin';

module.exports = new Transformer({
  async transform({asset, options}) {
    let code = await asset.getCode();
    let {code: compiledCode, rawMappings} = processCsf(code, asset.filePath) as any;

    let map = new SourceMap(options.projectRoot);
    if (rawMappings) {
      map.addIndexedMappings(rawMappings);
    }

    // Invalidate the asset whenever any types change.
    asset.invalidateOnFileChange(path.join(getCacheDir(options), 'sentinel'));
    asset.setCode(compiledCode);
    asset.setMap(map);
    return [asset];
  }
});

function processCsf(code: string, filePath: string) {
  let csf = loadCsf(code, {
    fileName: filePath,
    makeTitle: title => title || 'default'
  });
  enrichCsf(csf, csf);

  // @ts-ignore
  return formatCsf(csf, {sourceFileName: filePath, sourceMaps: true, importAttributesKeyword: 'with'});
}
