export async function resolve(specifier, context, next) {
  const nextResult = await next(specifier, context);

  if (!specifier.endsWith('.css')) {
    return nextResult;
  }

  return {
    format: 'css',
    shortCircuit: true,
    url: nextResult.url
  };
}

export async function load(url, context, next) {
  if (context.format !== 'css') {
    return next(url, context);
  }

  return {
    format: 'json',
    shortCircuit: true,
    source: '{}'
  };
}
