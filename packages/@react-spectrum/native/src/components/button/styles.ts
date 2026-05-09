import {cva} from '../../styles/variants';

export const buttonVariants = cva(
  'group shrink-0 flex-row items-center justify-center gap-2 rounded-md border border-transparent',
  {
    defaultVariants: {
      size: 'medium',
      styleVariant: 'fill',
      variant: 'accent'
    },
    variants: {
      isDisabled: {
        false: '',
        true: 'opacity-disabled'
      },
      isPending: {
        false: '',
        true: ''
      },
      size: {
        medium: 'min-h-1000 px-400 py-200',
        small: 'min-h-800 px-300 py-150'
      },
      staticColor: {
        black: '',
        none: '',
        white: ''
      },
      styleVariant: {
        fill: '',
        outline: ''
      },
      variant: {
        accent: '',
        negative: '',
        primary: '',
        secondary: ''
      }
    },
    compoundVariants: [
      {className: 'bg-accent', styleVariant: 'fill', variant: 'accent'},
      {className: 'bg-text', styleVariant: 'fill', variant: 'primary'},
      {className: 'bg-surface border-border', styleVariant: 'fill', variant: 'secondary'},
      {className: 'bg-negative', styleVariant: 'fill', variant: 'negative'},
      {className: 'border-accent bg-transparent', styleVariant: 'outline', variant: 'accent'},
      {className: 'border-text bg-transparent', styleVariant: 'outline', variant: 'primary'},
      {className: 'border-border bg-transparent', styleVariant: 'outline', variant: 'secondary'},
      {className: 'border-negative bg-transparent', styleVariant: 'outline', variant: 'negative'},
      {className: 'border-white bg-transparent', staticColor: 'white'},
      {className: 'border-black bg-transparent', staticColor: 'black'}
    ]
  }
);

export const buttonTextVariants = cva('text-200 font-medium', {
  defaultVariants: {
    styleVariant: 'fill',
    variant: 'accent'
  },
  variants: {
    staticColor: {
      black: 'text-black',
      none: '',
      white: 'text-white'
    },
    styleVariant: {
      fill: '',
      outline: ''
    },
    variant: {
      accent: '',
      negative: '',
      primary: '',
      secondary: ''
    }
  },
  compoundVariants: [
    {className: 'text-accentText', styleVariant: 'fill', variant: 'accent'},
    {className: 'text-background', styleVariant: 'fill', variant: 'primary'},
    {className: 'text-text', styleVariant: 'fill', variant: 'secondary'},
    {className: 'text-white', styleVariant: 'fill', variant: 'negative'},
    {className: 'text-accent', styleVariant: 'outline', variant: 'accent'},
    {className: 'text-text', styleVariant: 'outline', variant: 'primary'},
    {className: 'text-text', styleVariant: 'outline', variant: 'secondary'},
    {className: 'text-negative', styleVariant: 'outline', variant: 'negative'}
  ]
});

export const actionButtonVariants = cva(
  'group shrink-0 flex-row items-center justify-center gap-2 rounded-md border border-border bg-surface min-h-900 px-300 py-150',
  {
    defaultVariants: {
      isQuiet: false,
      isSelected: false
    },
    variants: {
      isDisabled: {
        false: '',
        true: 'opacity-disabled'
      },
      isEmphasized: {
        false: '',
        true: ''
      },
      isQuiet: {
        false: '',
        true: 'border-transparent bg-transparent px-200'
      },
      isSelected: {
        false: '',
        true: 'border-accent bg-accent'
      },
      staticColor: {
        black: '',
        none: '',
        white: ''
      }
    },
    compoundVariants: [
      {className: 'border-accent bg-accent', isEmphasized: true, isSelected: true},
      {className: 'border-white bg-transparent', staticColor: 'white'},
      {className: 'border-black bg-transparent', staticColor: 'black'}
    ]
  }
);

export const actionButtonTextVariants = cva('text-200 font-medium text-text', {
  defaultVariants: {
    isSelected: false
  },
  variants: {
    isSelected: {
      false: '',
      true: 'text-accentText'
    },
    staticColor: {
      black: 'text-black',
      none: '',
      white: 'text-white'
    }
  }
});
