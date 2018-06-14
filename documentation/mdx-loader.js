async function mdxLoader(content) {
  const mdx = require('@mdx-js/mdx')
  const callback = this.async()

  const result = await mdx(content, {
    hastPlugins: [require('@mapbox/rehype-prism')]
  });

  const code = `
  import React from 'react'
  import { MDXTag } from '@mdx-js/tag'
  ${result}
  `

  return callback(null, code)
}

module.exports = mdxLoader;
