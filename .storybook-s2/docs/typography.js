import { style } from '../../packages/@react-spectrum/s2/style/spectrum-theme' with {type: 'macro'};
import {Link as S2Link} from '@react-spectrum/s2';
import {useFocusRing, useHover} from 'react-aria';

function AnchorLink({id, isHovered}) {
  let { isFocusVisible, focusProps } = useFocusRing({within: true});
  const url = `${location.origin}${location.pathname.replace('iframe', 'index')}${location.search.replace('viewMode=docs&id=', 'path=/docs/')}#${id}`;
  return (
    <span {...focusProps} style={{opacity: isHovered || isFocusVisible ? 1 : 0}}>
      <S2Link href={url}>#</S2Link>
    </span>
  );
}

export function H2({children}) {
  let id = anchorId(children);
  let {hoverProps, isHovered} = useHover({});
  return (
    <h2 className={style({font: 'heading-xl', marginTop: 48, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8})} id={id} {...hoverProps}>
      {children}
      <AnchorLink id={id} isHovered={isHovered} />
    </h2>
  )
}

export function H3({children}) {
  let id = anchorId(children);
  let {hoverProps, isHovered} = useHover({});
  return (
    <h3 className={style({font: 'heading', marginTop: 32, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8})} id={id} {...hoverProps}>
      {children}
      <AnchorLink id={id} isHovered={isHovered} />
    </h3>
  );
}

export function H4({children}) {
  let id = anchorId(children);
  let {hoverProps, isHovered} = useHover({});
  return (
    <h4 className={style({font: 'heading-sm', marginTop: 32, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8})} id={id} {...hoverProps}>
      {children}
      <AnchorLink id={id} isHovered={isHovered} />
    </h4>
  );
}

export function P({children}) {
  return <p className={style({font: 'body-lg', marginTop: 24, marginBottom: 24})}>{children}</p>
}

export function Code({children}) {
  return <code className={style({font: 'code-sm', backgroundColor: 'layer-1', paddingX: 4, borderWidth: 1, borderColor: 'gray-100', borderStyle: 'solid', borderRadius: 'sm', whiteSpace: 'pre-wrap'})}>{children}</code>;
}

export function Strong({children}) {
  return <strong className={style({fontWeight: 'bold'})}>{children}</strong>;
}

export function Pre({children}) {
  return (
    <pre className={'sb-unstyled ' + style({padding: 32, marginY: 32, backgroundColor: 'layer-1', borderRadius: 'xl', font: 'code-sm', whiteSpace: 'pre-wrap'})}>
      <code dangerouslySetInnerHTML={{__html: children}} />
    </pre>
  );
}

function anchorId(children) {
  return children.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
}

export function Link(props) {
  return (
    <S2Link
      {...props}
      target={props.href.startsWith('?') ? '_top' : props.href.startsWith('#') ? '_self' : '_blank'}
      href={props.href.startsWith('?') ? new URL(props.href, window.top.location.href).toString() : props.href} />
  );
}
