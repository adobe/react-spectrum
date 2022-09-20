
function loader(source) {
  // Apply some transformations to the source...
  if (source.indexOf(/data-url:/ig) > -1) {
    source = source.replace(/data-url:/ig, '');
  }
  return source;
}

exports.default = loader;
