import {Transformer} from '@parcel/plugin';
import postcss from 'postcss';

let processors = require('@spectrum-css/component-builder/css/processors').processors;

export default new Transformer({
  async transform({asset}) {
    let code = asset.getCode();
    let res = await postcss(processors).process(code, {
      map: false,
      from: new URL(asset.url).pathname
    });
    asset.setCode(res.css);
    asset.type = 'css';
  }
});
