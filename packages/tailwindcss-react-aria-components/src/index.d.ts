declare function plugin(options?: Partial<{ prefix: string }>): {
  handler: () => void
}

declare namespace plugin {
  const __isOptionsFunction: true;
}

export = plugin
