export const focusRing = () => ({
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid'
  },
  outlineColor: 'focus-ring',
  outlineWidth: 2,
  outlineOffset: 2
} as const);

export const field = () => ({
  display: 'grid',
  gridColumn: {
    isInForm: '1 / span 2'
  },
  gridTemplateColumns: {
    default: ['auto', '1fr'],
    isInForm: 'subgrid'
  },
  gridTemplateRows: {
    labelPosition: {
      top: ['auto', '1fr', 'auto'],
      side: ['auto', '1fr']
    }
  },
  gridTemplateAreas: {
    labelPosition: {
      top: [
        'label label',
        'input input',
        'helptext helptext'
      ],
      side: [
        'label input',
        'label helptext'
      ]
    }
  },
  fontSize: 'control',
  alignItems: 'baseline',
  lineHeight: 100,
  '--field-height': {
    type: 'height',
    value: 'control'
  },
  // Spectrum defines the field label/help text with a (minimum) height, with text centered inside.
  // Calculate what the gap should be based on the height and line height.
  // Use a variable here rather than rowGap since it is applied to the children as padding.
  // This allows the gap to collapse when the label/help text is not present.
  // Eventually this may be possible to do in pure CSS: https://github.com/w3c/csswg-drafts/issues/5813
  '--field-gap': {
    type: 'rowGap',
    value: '[calc((var(--field-height) - 1lh) / 2)]'
  },
  columnGap: 'text-to-control'
} as const);
