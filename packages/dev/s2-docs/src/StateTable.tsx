import {Code, styles as codeStyles} from './Code';
import {Fragment} from 'react';
import {renderHTMLfromMarkdown, setLinks, TInterface} from './types';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from './Table';

const codeStyle = style({font: {default: 'code-xs', lg: 'code-sm'}});

interface StateTableProps {
  properties: TInterface['properties'],
  links?: any,
  showOptional?: boolean,
  hideSelector?: boolean,
  defaultClassName?: string,
  cssVariables?: {[name: string]: string}
}

export function StateTable({properties, links, showOptional, hideSelector, defaultClassName, cssVariables}: StateTableProps) {
  if (links) {
    setLinks(links);
  }

  let props = Object.values(properties);
  if (!showOptional) {
    props = props.filter(prop => !prop.optional);
  }
  let showSelector = !hideSelector && props.some(prop => prop.type === 'property' && prop.selector);

  let table =  (
    <Table>
      <TableHeader>
        <TableRow>
          <TableColumn role="columnheader">Render Prop</TableColumn>
          {showSelector && <TableColumn role="columnheader">CSS Selector</TableColumn>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.map((prop, index) => (
          <Fragment key={index}>
            <TableRow>
              <TableCell role="rowheader" hideBorder>
                <code className={codeStyle}>
                  <span className={codeStyles.property}>{prop.name}</span>
                </code>
              </TableCell>
              {showSelector && <TableCell hideBorder>
                <strong className={style({font: 'ui', fontWeight: 'bold', display: {sm: 'none'}})}>CSS Selector: </strong>
                {prop.type === 'property' && prop.selector ? <span className={codeStyle}><Code lang="css">{prop.selector}</Code></span> : <code className={codeStyle}>—</code>}
              </TableCell>}
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>{prop.description && renderHTMLfromMarkdown(prop.description, {forceInline: true})}</TableCell>
            </TableRow>
          </Fragment>
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

  if (cssVariables) {
    table = (
      <>
        {table}
        <Table style={{marginTop: 16}}>
          <TableHeader>
            <TableRow>
              <TableColumn role="columnheader">CSS Variable</TableColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(cssVariables).map(([name, description]) => (
              <Fragment key={name}>
                <TableRow>
                  <TableCell role="rowheader" hideBorder>
                    <code className={codeStyle}>
                      <span className={codeStyles.property}>{name}</span>
                    </code>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>{renderHTMLfromMarkdown(description, {forceInline: true})}</TableCell>
                </TableRow>
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </>
    );
  }

  return table;
}

export function DefaultClassName({defaultClassName}: {defaultClassName: string}) {
  return (
    <p className={style({font: 'ui'})}>
      <span className={style({fontWeight: 'bold'})}>Default className: </span>
      <span className={style({font: 'code-xs', backgroundColor: 'layer-1', paddingX: 4, borderWidth: 1, borderColor: 'gray-100', borderStyle: 'solid', borderRadius: 'sm'})}>{defaultClassName}</span>
    </p>
  );
}
