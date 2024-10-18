import {compile} from '@mdx-js/mdx';
import {Transformer} from '@parcel/plugin';

export default (new Transformer({
  async transform({asset}) {
    let code = await asset.getCode();
    let compiled = await compile(code, {
      providerImportSource: '@mdx-js/react',
      jsxRuntime: 'automatic'
    });

    asset.type = 'js';
    asset.setCode(compiled.value);

    return [asset];
  }
}));
