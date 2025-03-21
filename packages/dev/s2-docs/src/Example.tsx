import {Code} from './Code';
import {ExampleCode} from './ExampleCode';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const example = style({
  backgroundColor: 'layer-1',
  borderRadius: 'xl',
  marginY: 32
});

const output = style({
  padding: 32,
  borderWidth: 0,
  borderBottomWidth: 2,
  borderColor: 'gray-25',
  borderStyle: 'solid'
});

export function Example({render, children, ...props}) {
  if (!render) {
    return (
      <pre className={style({padding: 32, marginY: 32, backgroundColor: 'layer-1', borderRadius: 'xl', font: 'code-sm', whiteSpace: 'pre-wrap'})}>
        <Code {...props}>{children}</Code>
      </pre>
    );
  }

  let lines = children.split('\n').length;
  return (
    <div className={example}>
      <div className={output}>
        {render}
      </div>
      {lines > 5 
        ? (
          <ExampleCode>
            <pre className={style({padding: 32, paddingBottom: 0, margin: 0, backgroundColor: 'layer-1', borderRadius: 'xl', font: 'code-sm', whiteSpace: 'pre-wrap'})}>
              <Code {...props}>{children}</Code>
            </pre>
          </ExampleCode>
        )
        : (
          <pre className={style({padding: 32, margin: 0, backgroundColor: 'layer-1', borderRadius: 'xl', font: 'code-sm', whiteSpace: 'pre-wrap'})}>
            <Code {...props}>{children}</Code>
          </pre>
        )
      }
    </div>
  );
}
