/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import Asterisk from '@spectrum-icons/workflow/Asterisk';
import {getDoc} from 'globals-docs';
import Lowlight from 'react-lowlight';
import Markdown from 'markdown-to-jsx';
import React, {useContext} from 'react';
import styles from './docs.css';
import tableStyles from '@adobe/spectrum-css-temp/components/table/vars.css';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

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
    case 'undefined':
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
      return <code className={typographyStyles['spectrum-Code4']}><Type type={type.value} /></code>;
    case 'array':
      return <ArrayType {...type} />;
    default:
      console.log('UNKNOWN TYPE', type);
      return null;
  }
}

function StringLiteral({value}) {
  return <span className="token hljs-string">{`'${value.replace(/'/, '\\\'')}'`}</span>;
}

function NumberLiteral({value}) {
  return <span className="token hljs-number">{'' + value}</span>;
}

function BooleanLiteral({value}) {
  return <span className="token hljs-literal">{'' + value}</span>;
}

function Keyword({type}) {
  let link = getDoc(type);
  if (link) {
    return <a href={link} className={`${styles.colorLink} token hljs-keyword`} target="_blank">{type}</a>;
  }

  return <span className="token hljs-keyword">{type}</span>;
}

function Identifier({name}) {
  let link = getDoc(name) || DOC_LINKS[name];
  if (link) {
    return <a href={link} className={`${styles.colorLink} token hljs-name`} target="_blank">{name}</a>;
  }

  return <span className="token hljs-name">{name}</span>;
}

export function JoinList({elements, joiner}) {
  return elements
    .reduce((acc, v, i) => [
      ...acc,
      <span className="token punctuation" key={`join${v.name || v.raw}${i}`} style={{whiteSpace: 'pre-wrap'}}>{joiner}</span>,
      <Type type={v} key={`type${v.name || v.raw}${i}`} />
    ], []).slice(1);
}

function UnionType({elements}) {
  return <JoinList elements={elements} joiner={elements.length > 3 ? '\n  | ' : ' |\u00a0'} />;
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

export function TypeParameters({typeParameters}) {
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
      <span className="token hljs-attr">{name}</span>
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

  return <a href={'#' + id} data-link={id} className={`${styles.colorLink} token hljs-name`}>{value.name}</a>;
}

function renderHTMLfromMarkdown(description) {
  if (description) {
    return <Markdown>{description}</Markdown>;
  } else {
    return '';
  }
}

export function InterfaceType({properties, showRequired, showDefault}) {
  return (
    <table className={`${tableStyles['spectrum-Table']} ${tableStyles['spectrum-Table--quiet']} ${styles.propTable}`}>
      <thead>
        <tr>
          <td className={tableStyles['spectrum-Table-headCell']}>Name</td>
          <td className={tableStyles['spectrum-Table-headCell']}>Type</td>
          {showDefault && <td className={tableStyles['spectrum-Table-headCell']}>Default</td>}
          <td className={tableStyles['spectrum-Table-headCell']}>Description</td>
        </tr>
      </thead>
      <tbody className={tableStyles['spectrum-Table-body']}>
        {Object.values(properties).map((prop, index) => (
          <tr key={index} className={tableStyles['spectrum-Table-row']}>
            <td className={tableStyles['spectrum-Table-cell']} data-column="Name">
              <code className={`${typographyStyles['spectrum-Code4']}`}>
                <span className="token hljs-attr">{prop.name}</span>
              </code>
              {!prop.optional && showRequired
                ? <Asterisk size="XXS" UNSAFE_className={styles.requiredIcon} alt="Required" />
                : null
              }
            </td>
            <td className={tableStyles['spectrum-Table-cell']} data-column="Type">
              <code className={typographyStyles['spectrum-Code4']}>
                <Type type={prop.value} />
              </code>
            </td>
            {showDefault &&
              <td className={`${tableStyles['spectrum-Table-cell']} ${!prop.default ? styles.noDefault : ''}`} data-column="Default">
                {prop.default
                  ? <Lowlight language="js" value={prop.default} inline className={typographyStyles['spectrum-Code4']} />
                  : '—'
                }
              </td>
            }
            <td className={tableStyles['spectrum-Table-cell']}>{renderHTMLfromMarkdown(prop.description)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ObjectType({properties, exact}) {
  const startObject = <span className="token punctuation">{exact ? '{|' : '{'}</span>;
  const endObject = <span className="token punctuation">{exact ? '|}' : '}'}</span>;
  return (
    <>
      {startObject}
      {Object.values(properties).map((property, i, arr) => {
        let token = 'hljs-attr';
        let k = property.name;
        // https://mathiasbynens.be/notes/javascript-identifiers-es6
        if (!/^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]+$/u.test(property.key)) {
          k = `'${property.name}'`;
          token = 'hljs-string';
        }

        let optional = property.optional;
        let value = property.value;

        // Special handling for methods
        if (value && value.type === 'function' && !optional && token === 'property') {
          return (
            <div key={property.key} style={{paddingLeft: '1.5em'}}>
              <span className="token hljs-attr">{k}</span>
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

function ArrayType({elementType}) {
  return (
    <>
      <Type type={elementType} />
      <span className="token punctuation">[]</span>
    </>
  );
}
