import json5 from 'json5';
import {Transformer} from '@parcel/plugin';

export default new Transformer({
  async transform({asset}) {
    let code = await asset.getCode();

    let replaced = false;
    code = code.replace(/(<ExampleSwitcher type="component" examples={(\[.*?\])}>)((?:.|\n)*?)<\/ExampleSwitcher>/g, (m, start, examples, inner) => {
      if (inner.includes('COMPONENT')) {
        replaced = true;
        let components = json5.parse(examples);
        inner = components.map(component => inner.replace(/COMPONENT/g, component)).join('\n\n');
        return start + inner + '</ExampleSwitcher>';
      }

      return m;
    });

    if (replaced) {
      asset.setCode(code);
    }

    return [asset];
  }
});
