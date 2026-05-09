import {cva} from '../../styles/variants';

export const radioRootVariants = cva('flex-row items-start gap-200 py-100', {
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

export const radioOuterVariants = cva(
  'mt-50 h-500 w-500 shrink-0 items-center justify-center rounded-full border-thick bg-surface',
  {
    defaultVariants: {
      isInvalid: false,
      isSelected: false
    },
    variants: {
      isInvalid: {
        false: 'border-border',
        true: 'border-negative'
      },
      isSelected: {
        false: '',
        true: 'border-accent'
      }
    },
    compoundVariants: [{className: 'border-negative', isInvalid: true, isSelected: true}]
  }
);

export const radioInnerVariants = cva('h-200 w-200 rounded-full', {
  defaultVariants: {
    isInvalid: false,
    isSelected: false
  },
  variants: {
    isInvalid: {
      false: 'bg-accent',
      true: 'bg-negative'
    },
    isSelected: {
      false: 'opacity-0',
      true: 'opacity-100'
    }
  }
});

export const radioLabelVariants = cva('text-200 text-text', {
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

export const radioGroupRootVariants = cva('gap-150', {
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

export const radioGroupItemsVariants = cva('gap-100', {
  defaultVariants: {
    orientation: 'vertical'
  },
  variants: {
    orientation: {
      horizontal: 'flex-row flex-wrap gap-x-400 gap-y-100',
      vertical: 'flex-col'
    }
  }
});

export const radioGroupLabelVariants = cva('text-200 font-medium text-text');
export const radioHelpTextVariants = cva('text-100 text-text opacity-70');
export const radioErrorTextVariants = cva('text-100 text-negative');
