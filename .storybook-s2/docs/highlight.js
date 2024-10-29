const treeSitter = require('tree-sitter-highlight');
const tokens = require('@adobe/spectrum-tokens/dist/json/variables.json');

function colorToken(name) {
  let token = tokens[name];
  return `light-dark(${token.sets.light.value}, ${token.sets.dark.value})`;
}

exports.highlight = function(code, lang = 'JSX') {
  this.addAsset({
    type: 'css',
    content: `
.keyword {
  color: ${colorToken('magenta-1000')}
}
.string {
  color: ${colorToken('green-1000')}
}
.number {
  color: ${colorToken('pink-1000')}
}
.property, .attribute {
  color: ${colorToken('indigo-1000')}
}
.function, .tag, .constructor {
  color: ${colorToken('red-1000')}
}
.comment {
  color: ${colorToken('gray-700')}
}
.variable {
  color: ${colorToken('fuchsia-1000')}
}
`
  });

  return treeSitter.highlight(code, treeSitter.Language[lang]);
}
