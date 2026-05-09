import {cva} from '../../styles/variants';

export const fieldContainerVariants = cva('flex-col gap-150', {
  variants: {
    isDisabled: {
      false: '',
      true: 'opacity-disabled'
    }
  }
});

export const fieldLabelVariants = cva('text-200 font-medium text-text', {
  variants: {
    isInvalid: {
      false: '',
      true: 'text-negative'
    }
  }
});

export const fieldHelpTextVariants = cva('text-100 text-textMuted', {
  variants: {
    isInvalid: {
      false: '',
      true: 'text-negative'
    }
  }
});

export const textFieldInputVariants = cva(
  'min-h-1000 rounded-md border border-border bg-surface px-300 py-200 text-200 text-text',
  {
    variants: {
      isFocused: {
        false: '',
        true: 'border-focusRing'
      },
      isInvalid: {
        false: '',
        true: 'border-negative'
      },
      isReadOnly: {
        false: '',
        true: 'bg-background'
      }
    },
    compoundVariants: [{className: 'border-negative', isFocused: true, isInvalid: true}]
  }
);

export const textAreaInputVariants = cva(
  'min-h-1600 rounded-md border border-border bg-surface px-300 py-250 text-200 text-text',
  {
    variants: {
      isFocused: {
        false: '',
        true: 'border-focusRing'
      },
      isInvalid: {
        false: '',
        true: 'border-negative'
      },
      isReadOnly: {
        false: '',
        true: 'bg-background'
      }
    },
    compoundVariants: [{className: 'border-negative', isFocused: true, isInvalid: true}]
  }
);
