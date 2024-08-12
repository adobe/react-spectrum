import { style } from '../../packages/@react-spectrum/s2/style/spectrum-theme' with {type: 'macro'};
import {Link} from '@react-spectrum/s2';

export function H2({children}) {
  let id = anchorId(children);
  return <h2 className={style({font: 'heading-xl', marginTop: 48, marginBottom: 24})} id={id}>{children}</h2>
}

export function H3({children}) {
  let id = anchorId(children);
  return <h3 className={style({font: 'heading', marginTop: 32, marginBottom: 16})} id={anchorId(children)}>{children}</h3>
}

export function H4({children}) {
  let id = anchorId(children);
  return <h4 className={style({font: 'heading-sm', marginTop: 32, marginBottom: 8})} id={anchorId(children)}>{children}</h4>
}

export function P({children}) {
  return <p className={style({font: 'body-lg', marginTop: 0, marginBottom: 24})}>{children}</p>
}

export function Code({children}) {
  return <code className={style({font: 'code-sm', backgroundColor: 'layer-1', paddingX: 4, borderWidth: 1, borderColor: 'gray-100', borderStyle: 'solid', borderRadius: 'sm'})}>{children}</code>;
}

export function Strong({children}) {
  return <strong className={style({fontWeight: 'bold'})}>{children}</strong>;
}

export function Pre({children}) {
  return (
    <pre className={'sb-unstyled ' + style({padding: 32, marginY: 32, backgroundColor: 'layer-1', borderRadius: 'xl', font: 'code-sm'})}>
      <code dangerouslySetInnerHTML={{__html: children}} />
    </pre>
  );
}

function anchorId(children) {
  return children.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
}
