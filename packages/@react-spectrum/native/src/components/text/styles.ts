import {cva} from '../../styles/variants';

export const textVariants = cva('text-text', {
  defaultVariants: {
    isDisabled: false,
    size: 'M',
    variant: 'body'
  },
  variants: {
    isDisabled: {
      false: '',
      true: 'opacity-disabled'
    },
    size: {
      XS: 'text-75 leading-100',
      S: 'text-100 leading-200',
      M: 'text-200 leading-300',
      L: 'text-300 leading-400',
      XL: 'text-400 leading-500'
    },
    variant: {
      body: '',
      code: 'font-code',
      detail: 'text-textMuted'
    }
  }
});

export const headingVariants = cva('text-text font-semibold', {
  defaultVariants: {
    size: 'M'
  },
  variants: {
    size: {
      XS: 'text-200 leading-300',
      S: 'text-300 leading-400',
      M: 'text-400 leading-500',
      L: 'text-500 leading-500',
      XL: 'text-700 leading-700'
    }
  }
});
