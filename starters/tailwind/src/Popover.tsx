import {
  OverlayArrow,
  Popover as AriaPopover,
  PopoverProps as AriaPopoverProps
} from 'react-aria-components';
import {tv} from 'tailwind-variants';

export interface PopoverProps extends Omit<AriaPopoverProps, 'children'> {
  showArrow?: boolean,
  children: React.ReactNode
}

const styles = tv({
  base: 'bg-white shadow-2xl rounded-xl ring-1 ring-black/10',
  variants: {
    isEntering: {
      true: 'animate-in fade-in placement-bottom:slide-in-from-top-1 placement-top:slide-in-from-bottom-1 placement-left:slide-in-from-right-1 placement-right:slide-in-from-left-1 ease-out duration-200'
    },
    isExiting: {
      true: 'animate-out fade-out placement-bottom:slide-out-to-top-1 placement-top:slide-out-to-bottom-1 placement-left:slide-out-to-right-1 placement-right:slide-out-to-left-1 ease-in duration-150'
    }
  }
});

export function Popover({ children, showArrow, className, ...props }: PopoverProps) {
  return (
    <AriaPopover
      offset={showArrow ? 12 : 8}
      {...props}
      className={(renderProps) => styles({
        ...renderProps,
        className: typeof className === 'function' ? className(renderProps) : className
      })}>
      {showArrow &&
        <OverlayArrow className="group">
          <svg width={12} height={12} viewBox="0 0 12 12" className="block fill-white stroke-1 stroke-black/10 group-placement-bottom:rotate-180 group-placement-left:-rotate-90 group-placement-right:rotate-90">
            <path d="M0 0 L6 6 L12 0" />
          </svg>
        </OverlayArrow>
      }
      {children}
    </AriaPopover>
  );
}
