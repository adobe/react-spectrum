import {Button as RACButton, ButtonProps as RACButtonProps} from 'react-aria-components';
import {tv} from 'tailwind-variants';

export interface ButtonProps extends RACButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive' | 'icon'
}

let button = tv({
  base: 'px-5 py-2 text-sm text-center transition rounded-lg border shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] cursor-default outline-none focus-visible:outline-blue-600 disabled:bg-gray-100 disabled:text-gray-300',
  variants: {
    variant: {
      primary: 'bg-blue-600 border-blue-700 hover:bg-blue-700 pressed:bg-blue-800 text-white',
      secondary: 'bg-gray-100 border-gray-300 hover:bg-gray-200 pressed:bg-gray-300 pressed:border-gray-300 text-gray-800',
      destructive: 'bg-red-700 border-red-800 hover:bg-red-800 pressed:bg-red-900 text-white',
      icon: 'border-0 p-1 flex items-center justify-center text-gray-600 hover:bg-gray-100 pressed:bg-gray-200 disabled:bg-transparent'
    }
  },
  defaultVariants: {
    variant: 'primary'
  }
});

export function Button(props: ButtonProps) {
  return (
    <RACButton
      {...props}
      className={renderProps => button({
        variant: props.variant,
        className: typeof props.className === 'function' ? props.className(renderProps) : props.className
      })} />
  );
}
