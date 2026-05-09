import {cva} from '../../styles/variants';

export const toggleRootVariants = cva('flex-row items-start gap-200 py-100', {
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

export const checkboxBoxVariants = cva(
  'mt-50 h-500 w-500 shrink-0 items-center justify-center rounded-sm border-thick bg-surface',
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
        true: 'border-accent bg-accent'
      }
    },
    compoundVariants: [
      {className: 'border-accent', isInvalid: false, isSelected: true},
      {className: 'border-negative bg-negative', isInvalid: true, isSelected: true}
    ]
  }
);

export const checkboxCheckVariants = cva(
  'h-300 w-200 rotate-45 border-b-thick border-r-thick border-accentText',
  {
    defaultVariants: {
      isVisible: false
    },
    variants: {
      isVisible: {
        false: 'opacity-0',
        true: 'opacity-100'
      }
    }
  }
);

export const checkboxDashVariants = cva('h-50 w-300 rounded-full bg-accentText', {
  defaultVariants: {
    isVisible: false
  },
  variants: {
    isVisible: {
      false: 'opacity-0',
      true: 'opacity-100'
    }
  }
});

export const toggleLabelVariants = cva('text-200 text-text', {
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

export const groupRootVariants = cva('gap-150', {
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

export const groupItemsVariants = cva('gap-100', {
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

export const groupLabelVariants = cva('text-200 font-medium text-text');
export const helpTextVariants = cva('text-100 text-text opacity-70');
export const errorTextVariants = cva('text-100 text-negative');
