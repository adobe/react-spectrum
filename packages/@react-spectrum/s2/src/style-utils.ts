export const focusRing = () => ({
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid'
  },
  outlineColor: 'focus-ring',
  outlineWidth: 2,
  outlineOffset: 2
} as const);
