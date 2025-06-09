'use client';

import {iconStyle, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useHover} from '@react-aria/interactions';
import {useFocusRing} from '@react-aria/focus';
import {Link} from '@react-spectrum/s2';
import LinkIcon from '@react-spectrum/s2/icons/Link';

function anchorId(children) {
  return children.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
}

function AnchorLink({anchorId, isHovered, level}) {
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
      marginStart: {
        default: 8,
        level: {
          3: 4,
          4: 4
        }
      },
      transition: '[opacity 0.2s ease-in-out]',
    })({isHovered, isFocusVisible, level})}>
      <Link href={href}>
        <LinkIcon
          styles={iconStyle({size: 'S', marginBottom: 4})} 
          UNSAFE_style={{marginBottom: (level === 3 || level === 4) ? 0 : undefined}}
          />
      </Link>
    </span>
  );
}

export function H2({children, ...props}) {
  let {hoverProps, isHovered} = useHover({});
  let id = anchorId(children)
  return (
    <h2 {...props} id={id} className={style({font: 'heading-xl', marginTop: 48, marginBottom: 24})} {...hoverProps}>
      {children}
      <AnchorLink anchorId={id} isHovered={isHovered} level={2} />
    </h2>
  );
}

export function H3({children, ...props}) {
  let {hoverProps, isHovered} = useHover({});
  let id = anchorId(children);
  return (
    <h3 {...props} id={id} className={style({font: 'heading', marginTop: 32, marginBottom: 2})} {...hoverProps}>
      {children}
      <AnchorLink anchorId={id} isHovered={isHovered} level={3} />
    </h3>
  );
}

export function H4({children, ...props}) {
  let {hoverProps, isHovered} = useHover({});
  let id = anchorId(children);
  return (
    <h4 {...props} id={id} className={style({font: 'heading-sm'})} {...hoverProps}>
      {children}
      <AnchorLink anchorId={id} isHovered={isHovered} level={4} />
    </h4>
  );
}
