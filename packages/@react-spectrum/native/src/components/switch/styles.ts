import {cva} from '../../styles/variants';

export const switchRootVariants = cva('flex-row items-start gap-200 py-100', {
  defaultVariants: {
    isDisabled: false
  },
  variants: {
    isDisabled: {
      false: '',
      true: 'opacity-disabled'
    }
  }
});

export const switchTrackVariants = cva(
  'mt-50 h-600 w-1200 shrink-0 justify-center rounded-full border-thick px-50',
  {
    defaultVariants: {
      isInvalid: false,
      isSelected: false
    },
    variants: {
      isInvalid: {
        false: '',
        true: ''
      },
      isSelected: {
        false: 'items-start border-border bg-border',
        true: 'items-end border-accent bg-accent'
      }
    },
    compoundVariants: [
      {className: 'border-negative bg-negative', isInvalid: true, isSelected: true}
    ]
  }
);

export const switchThumbVariants = cva('h-400 w-400 rounded-full bg-surface');

export const switchLabelVariants = cva('text-200 text-text', {
  defaultVariants: {
    isDisabled: false
  },
  variants: {
    isDisabled: {
      false: '',
      true: 'text-text opacity-disabled'
    }
  }
});

export const switchHelpTextVariants = cva('text-100 text-text opacity-70');
export const switchErrorTextVariants = cva('text-100 text-negative');
