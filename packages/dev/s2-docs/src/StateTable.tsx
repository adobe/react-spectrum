import {Code, styles as codeStyles} from './Code';
import {renderHTMLfromMarkdown} from './types';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from './Table';

const codeStyle = style({font: 'code-sm'});

export function StateTable({properties, showOptional, hideSelector, defaultClassName}) {
  let props = Object.values(properties);
  if (!showOptional) {
    props = props.filter(prop => !prop.optional);
  }
  let showSelector = !hideSelector && props.some(prop => prop.selector);

  let table =  (
    <Table>
      <TableHeader>
        <TableRow>
          <TableColumn role="columnheader">Render Prop</TableColumn>
          {showSelector && <TableColumn role="columnheader">CSS Selector</TableColumn>}
          <TableColumn role="columnheader">Description</TableColumn>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.map((prop, index) => (
          <TableRow key={index}>
            <TableCell role="rowheader">
              <code className={codeStyle}>
                <span className={codeStyles.property}>{prop.name}</span>
              </code>
            </TableCell>
            {showSelector && <TableCell role="rowheader">
              {/* <code className={codeStyle}>
                <span className={prop.selector ? codeStyles.string : null}>{prop.selector || '—'}</span>
              </code> */}
              {prop.selector ? <Code lang="css">{prop.selector}</Code> : <code className={codeStyle}>—</code>}
            </TableCell>}
            <TableCell>{renderHTMLfromMarkdown(prop.description, {forceInline: false})}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (defaultClassName) {
    table = (
      <>
        <DefaultClassName defaultClassName={defaultClassName} />
        {table}
      </>
    );
  }

  return table;
}

export function DefaultClassName({defaultClassName}) {
  return (
    <p className={style({font: 'ui'})}>
      <span className={style({fontWeight: 'bold'})}>Default className: </span>
      <span className={style({font: 'code-xs', backgroundColor: 'layer-1', paddingX: 4, borderWidth: 1, borderColor: 'gray-100', borderStyle: 'solid', borderRadius: 'sm'})}>{defaultClassName}</span>
    </p>
  );
}
