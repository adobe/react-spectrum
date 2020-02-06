import React, {useContext} from 'react';
import tableStyles from '@adobe/spectrum-css-temp/components/table/vars.css';
import styles from './docs.css';
import linkStyles from '@adobe/spectrum-css-temp/components/link/vars.css';
import {getDoc} from 'globals-docs';
import ChevronRight from '@spectrum-icons/workflow/ChevronRight';
import accordionStyles from '@adobe/spectrum-css-temp/components/accordion/vars.css';

const DOC_LINKS = {
  'React.Component': 'https://reactjs.org/docs/react-component.html',
  ReactElement: 'https://reactjs.org/docs/rendering-elements.html',
  ReactNode: 'https://reactjs.org/docs/rendering-elements.html',
  Generator: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator',
  Iterator: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols',
  Iterable: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols',
  DataTransfer: 'https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer',
  CSSProperties: 'https://reactjs.org/docs/dom-elements.html#style'
};

export const TypeContext = React.createContext();

export function Type({type}) {
  if (!type) {
    return null;
  }
  
  switch (type.type) {
    case 'any':
    case 'null':
    case 'void':
      return <Keyword {...type} />;
    case 'identifier':
      return <Identifier {...type} />;
    case 'string':
      if (type.value) {
        return <StringLiteral {...type} />;
      }

      return <Keyword {...type} />;
    case 'number':
      if (type.value) {
        return <NumberLiteral {...type} />;
      }

      return <Keyword {...type} />;
    case 'boolean':
      if (type.value) {
        return <BooleanLiteral {...type} />;
      }

      return <Keyword {...type} />;
    case 'union':
      return <UnionType {...type} />;
    case 'intersection':
      return <IntersectionType {...type} />;
    case 'application':
      return <TypeApplication {...type} />;
    case 'function':
      return <FunctionType {...type} />;
    case 'parameter':
      return <Parameter {...type} />;
    case 'link':
      return <LinkType {...type} />;
    case 'interface':
      return <InterfaceType {...type} />;
    case 'object':
      if (type.properties) {
        return <ObjectType {...type} />;
      }

      return <Keyword {...type} />;
    case 'alias':
      return <Type type={type.value} />;
    default:
      console.log("UNKNOWN TYPE", type);
      return null;
  }
}

function StringLiteral({value}) {
  return <span className="token string">{`'${value.replace(/'/, '\\\'')}'`}</span>;
}

function NumberLiteral({value}) {
  return <span className="token number">{'' + value}</span>;
}

function BooleanLiteral({value}) {
  return <span className="token boolean">{'' + value}</span>;
}

function Keyword({type}) {
  let link = getDoc(type);
  if (link) {
    return <a href={link} className={`${linkStyles['spectrum-Link']} ${linkStyles['spectrum-Link--quiet']}`} target="_blank">{type}</a>;
  }

  return <span className="token keyword">{type}</span>;
}

function Identifier({name}) {
  let link = getDoc(name) || DOC_LINKS[name];
  if (link) {
    return <a href={link} className={`${linkStyles['spectrum-Link']} ${linkStyles['spectrum-Link--quiet']}`} target="_blank">{name}</a>;
  }

  return <span className="token identifier">{name}</span>;
}

function JoinList({elements, joiner}) {
  return elements
    .reduce((acc, v, i) => [
      ...acc,
      <span className="token punctuation" key={`join${v.name || v.raw}${i}`} style={{whiteSpace: 'pre-wrap'}}>{joiner}</span>,
      <Type type={v} key={`type${v.name || v.raw}${i}`} />
    ], []).slice(1);
}

function UnionType({elements}) {
  return <JoinList elements={elements} joiner={elements.length > 5 ? '\n  | ' : ' | '} />;
}

function IntersectionType({types}) {
  return <JoinList elements={types} joiner=" & " />;
}

function TypeApplication({base, typeParameters}) {
  return (
    <>
      <Type type={base} />
      <TypeParameters typeParameters={typeParameters} />
    </>
  );
}

function TypeParameters({typeParameters}) {
  if (typeParameters.length === 0) {
    return null;
  }

  return (
    <>
      <span className="token punctuation">&lt;</span>
      <JoinList elements={typeParameters} joiner=", " />
      <span className="token punctuation">&gt;</span>
    </>
  );
}

function FunctionType({parameters, return: returnType, typeParameters}) {
  return (
    <>
      <TypeParameters typeParameters={typeParameters} />
      <span className="token punctuation">(</span>
      <JoinList elements={parameters} joiner=", " />
      <span className="token punctuation">)</span>
      <span className="token punctuation">{' => '}</span>
      <Type type={returnType} />
    </>
  );
}

function Parameter({name, value, default: defaultValue}) {
  return (
    <>
      <span className="token property">{name}</span>
      {value &&
        <>
          <span className="token punctuation">: </span>
          <Type type={value} />
        </>
      }
      {defaultValue &&
        <>
          <span className="token punctuation"> = </span>
          <span dangerouslySetInnerHTML={{__html: defaultValue}} />
        </>
      }
    </>
  );
}

function LinkType({id}) {
  let links = useContext(TypeContext) || {};
  let value = links[id];
  if (!value) {
    return null;
  }

  return <a href={'#' + id} data-link={id} className={`${linkStyles['spectrum-Link']} ${linkStyles['spectrum-Link--quiet']}`}>{value.name}</a>;
}

function InterfaceType({properties}) {
  return (
    <InterfaceTable>
      <InterfaceBody properties={properties} />
    </InterfaceTable>
  );
}

export function InterfaceTable({children}) {
  return (
    <table className={`${tableStyles['spectrum-Table']} ${tableStyles['spectrum-Table--quiet']} ${styles.propTable}`}>
      <thead>
        <tr>
          <td className={tableStyles['spectrum-Table-headCell']}>Name</td>
          <td className={tableStyles['spectrum-Table-headCell']}>Type</td>
          <td className={tableStyles['spectrum-Table-headCell']}>Default</td>
          <td className={tableStyles['spectrum-Table-headCell']}>Required</td>
          <td className={tableStyles['spectrum-Table-headCell']}>Description</td>
        </tr>
      </thead>
      {children}
    </table>
  );
}

export function InterfaceBody({header, properties}) {
  return (
    <tbody className={tableStyles['spectrum-Table-body']}>
      {header && 
        <tr>
          <th colSpan={5} className={styles.header}>
            <div className={accordionStyles['spectrum-Accordion-itemHeader']}>
              <ChevronRight size="XS" />
              {header}
            </div>
          </th>
        </tr>
      }
      {Object.values(properties).map((prop, index) => {
        return (
          <tr key={index} className={tableStyles['spectrum-Table-row']} hidden={!!header}>
            <td className={tableStyles['spectrum-Table-cell']}>{prop.name}</td>
            <td className={tableStyles['spectrum-Table-cell']}><Type type={prop.value} /></td>
            <td className={tableStyles['spectrum-Table-cell']}>{prop.default || '-'}</td>
            <td className={tableStyles['spectrum-Table-cell']}>{!prop.optional ? 'true' : null}</td>
            <td className={tableStyles['spectrum-Table-cell']}>{prop.description}</td>
          </tr>
        );
      })}
    </tbody>
  );
}

function ObjectType({properties, exact}) {
  const startObject = <span className="token punctuation">{exact ? '{|' : '{'}</span>;
  const endObject = <span className="token punctuation">{exact ? '|}' : '}'}</span>;
  return (
    <>
      {startObject}
      {Object.values(properties).map((property, i, arr) => {
        let token = 'property';
        let k = property.name;
        // https://mathiasbynens.be/notes/javascript-identifiers-es6
        if (!/^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]+$/u.test(property.key)) {
          k = `'${property.name}'`;
          token = 'string';
        }

        let optional = property.optional;
        let value = property.value;

        // Special handling for methods
        if (value && value.type === 'function' && !optional && token === 'property') {
          return (
            <div key={property.key} style={{paddingLeft: '1.5em'}}>
              <span className="token property">{k}</span>
              <span className="token punctuation">(</span>
              <JoinList elements={value.parameters} joiner=", " />
              <span className="token punctuation">)</span>
              <span className="token punctuation">{': '}</span>
              <Type type={value.return} />
              {i < arr.length - 1 ? ',' : ''}
            </div>
          );
        }

        let punc = optional ? '?: ' : ': ';
        return (
          <div key={property.key} style={{paddingLeft: '1.5em'}}>
            <span className={`token ${token}`}>{k}</span>
            <span className="token punctuation">{punc}</span>
            <Type type={value} />
            {i < arr.length - 1 ? ',' : ''}
          </div>
        );
      })}
      {endObject}
    </>
  );
}
