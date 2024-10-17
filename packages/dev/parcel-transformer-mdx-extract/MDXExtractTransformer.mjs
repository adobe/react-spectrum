import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import {Transformer} from '@parcel/plugin';
import {unified} from 'unified';
import {visit} from 'unist-util-visit';

export default new Transformer({
  async transform({asset}) {
    let contents = await asset.getCode();
    let ast = unified().use(remarkParse).use(remarkMdx).parse(contents);
    let heading;
    let reusableWrapper = '';
    let imports = 'import React from "react";\n';
    visit(ast, node => {
      if (node.type === 'heading' && node.depth === 2) {
        heading = node.children[0].value;
      }

      if (node.type === 'code' && node.lang === 'tsx') {
        if (heading === 'Reusable wrappers') {
          reusableWrapper += node.value.replace(/import .*? from .*?;/g, '') + '\n';
        }

        let m = node.value.match(/import .*? from .*?;/g);
        if (m) {
          imports += m.join('\n').replace(/\.\/(.+?)(['"])/g, 'extract:./$1.mdx$2') + '\n\n';
        }
      }
    });

    if (/^<(.|\n)*>$/m.test(reusableWrapper)) {
      reusableWrapper = reusableWrapper.replace(/^(<(.|\n)*>)$/m, '').trim() + '\n';
    }

    return [
      {
        type: 'tsx',
        content: imports + reusableWrapper,
        pipeline: null
      }
    ];
  }
});
