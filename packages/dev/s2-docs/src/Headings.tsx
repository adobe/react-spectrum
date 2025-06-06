'use client';

import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useHover} from '@react-aria/interactions';
import {useFocusRing} from '@react-aria/focus';
import {Link} from '@react-spectrum/s2';

function anchorId(children) {
  return children.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
}

function AnchorLink({anchorId, isHovered}) {
  let {isFocusVisible, focusProps} = useFocusRing({within: true});
  const href = `#${anchorId}`;
  // TODO: Do these links need aria-labels or aria-labelledby?
  return (
    <span {...focusProps} className={style({
      opacity: {
        default: 0,
        isHovered: 1,
        isFocusVisible: 1
      },
      marginStart: 8,
      transition: '[opacity 0.2s ease-in-out]'
    })({isHovered, isFocusVisible})}>
      <Link href={href}>#</Link>
    </span>
  );
}

export function H2({children, ...props}) {
  let {hoverProps, isHovered} = useHover({});
  let id = anchorId(children)
  return (
    <h2 {...props} id={id} className={style({font: 'heading-xl', marginTop: 48, marginBottom: 24})} {...hoverProps}>
      {children}
      <AnchorLink anchorId={id} isHovered={isHovered} />
    </h2>
  );
}

export function H3({children, ...props}) {
  let {hoverProps, isHovered} = useHover({});
  let id = anchorId(children);
  return (
    <h3 {...props} id={id} className={style({font: 'heading', marginTop: 32, marginBottom: 2})} {...hoverProps}>
      {children}
      <AnchorLink anchorId={id} isHovered={isHovered} />
    </h3>
  );
}

export function H4({children, ...props}) {
  let {hoverProps, isHovered} = useHover({});
  let id = anchorId(children);
  return (
    <h4 {...props} id={id} className={style({font: 'heading-sm'})} {...hoverProps}>
      {children}
      <AnchorLink anchorId={id} isHovered={isHovered} />
    </h4>
  );
}
