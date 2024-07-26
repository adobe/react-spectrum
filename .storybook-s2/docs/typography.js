import { style } from '../../packages/@react-spectrum/s2/style/spectrum-theme' with {type: 'macro'};
import {Link} from '@react-spectrum/s2';

export function H2({children}) {
  let id = anchorId(children);
  return <h2 className={style({fontSize: 'heading-xl', lineHeight: 'heading', color: 'heading', marginTop: 48, marginBottom: 24})} id={id}>{children}</h2>
}

export function H3({children}) {
  let id = anchorId(children);
  return <h3 className={style({fontSize: 'heading', lineHeight: 'heading', color: 'heading', marginTop: 32, marginBottom: 16})} id={anchorId(children)}>{children}</h3>
}

export function H4({children}) {
  let id = anchorId(children);
  return <h4 className={style({fontSize: 'heading-sm', lineHeight: 'heading', color: 'heading', marginTop: 32, marginBottom: 8})} id={anchorId(children)}>{children}</h4>
}

export function P({children}) {
  return <p className={style({fontSize: 'body-lg', lineHeight: 'body', color: 'body', marginTop: 0, marginBottom: 24})}>{children}</p>
}

export function Code({children}) {
  return <code className={style({fontFamily: 'code', fontSize: 'code-sm', backgroundColor: 'layer-1', paddingX: 4, borderWidth: 1, borderColor: 'gray-100', borderStyle: 'solid', borderRadius: 'sm'})}>{children}</code>;
}

export function Pre({children}) {
  return (
    <pre className={'sb-unstyled ' + style({padding: 32, marginY: 32, backgroundColor: 'layer-1', borderRadius: 'xl', fontFamily: 'code', fontSize: 'code-sm', lineHeight: 'code'})}>
      <code dangerouslySetInnerHTML={{__html: children}} />
    </pre>
  );
}

function anchorId(children) {
  return children.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
}
