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

// import Asterisk from '@react-spectrum/s2/icons/Asterisk';
// import clsx from 'clsx';
import {Code, styles as codeStyles} from './Code';
import {ColorLink, Link as SpectrumLink} from './Link';
import {getAnchorProps, getUsedLinks} from './utils';
// import Lowlight from 'react-lowlight';
import {getDoc} from 'globals-docs';
import linkStyle from '@adobe/spectrum-css-temp/components/link/vars.css';
import Markdown from 'markdown-to-jsx';
import React, {ReactNode, useContext} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from './Table';
import {TypeLink} from './TypeLink';
// import styles from './docs.css';
// import tableStyles from '@adobe/spectrum-css-temp/components/table/vars.css';
// import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

const DOC_LINKS = {
  'React.Component': 'https://reactjs.org/docs/react-component.html',
  ReactElement: 'https://reactjs.org/docs/rendering-elements.html',
  ReactNode: 'https://reactjs.org/docs/rendering-elements.html',
  Generator: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator',
  Iterator: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols',
  Iterable: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols',
  DataTransfer: 'https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer',
  CSSProperties: 'https://reactjs.org/docs/dom-elements.html#style',
  DOMAttributes: 'https://reactjs.org/docs/dom-elements.html#all-supported-html-attributes',
  FocusableElement: 'https://developer.mozilla.org/en-US/docs/Web/API/Element',
  'Intl.NumberFormat': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat',
  'Intl.NumberFormatOptions': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat',
  'Intl.ListFormatOptions': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat/ListFormat',
  'Intl.DateTimeFormat': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat',
  'Intl.DateTimeFormatOptions': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat',
  'Intl.Collator': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator',
  'Intl.CollatorOptions': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator/Collator',
  'AbortSignal': 'https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal',
  'Key': 'https://reactjs.org/docs/lists-and-keys.html',
  'HTMLAttributes': 'https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes',
  'InputHTMLAttributes': 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attributes',
  'TextareaHTMLAttributes': 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea#attributes',
  'LabelHTMLAttributes': 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label#attributes',
  'OutputHTMLAttributes': 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/output#attributes'
};

type TParameter = {type: 'parameter', name: string, value: TType, optional: boolean, rest: boolean, description: string | null, default?: string};
type Property = {type: 'property', name: string, indexType: TType | null, value: TType, optional: boolean, description: string | null, access: string | null, selector: string | null, default: string | null};
type TTypeParameter = {type: 'typeParameter', name: string, constraint: TType | null, default: TType | null};
type TKeyword = {type: 'any' | 'null' | 'undefined' | 'void' | 'unknown' | 'never' | 'this' | 'symbol' | 'string' | 'number' | 'boolean'};
type TIdentifier = {type: 'identifier', name: string};
type TString = {type: 'string', value?: string};
type TNumber = {type: 'number', value?: number};
type TBoolean = {type: 'boolean', value?: boolean};
type TUnion = {type: 'union', elements: TType[]};
type TIntersection = {type: 'intersection', types: TType[]};
type TApplication = {type: 'application', base: TType, typeParameters: TType[]};
type TTypeOperator = {type: 'typeOperator', operator: string, value: TType};
type TFunction = {type: 'function', id?: string, name?: string, parameters: TParameter[], return: TType, typeParameters: TTypeParameter[], description: string | null, access: string | null};
type TMethod = {type: 'method', name: string, value: TType, optional: boolean, access: string | null, description: string | null, default: string | null};
type TAlias = {type: 'alias', id: string, name: string, value: TType, typeParameters: TTypeParameter[], description: string | null, access?: string};
type TInterface = {type: 'interface', id: string, name: string, extends: TType[], properties: {[name: string]: Property | TMethod}, typeParameters: TTypeParameter[], description: string | null, access: string | null};
type TObject = {type: 'object', properties: {[name: string]: Property | TMethod} | null, description: string | null, access: string | null};
type TArray = {type: 'array', elementType: TType};
type TTuple = {type: 'tuple', elements: TType[]};
type TTemplate = {type: 'template', elements: TType[]};
type TComponent = {type: 'component', id: string, name: string, props: TType | null, typeParameters: TTypeParameter[], ref: TType | null, description: string | null, access: string | null};
type TConditional = {type: 'conditional', checkType: TType, extendsType: TType, trueType: TType, falseType: TType};
type TIndexedAccess = {type: 'indexedAccess', objectType: TType, indexType: TType};
type TKeyof = {type: 'keyof', keyof: TType};
type TLink = {type: 'link', id: string};
type TReference =  {type: 'reference', local: string, imported: string, specifier: string};
type TMapped = {type: 'mapped', readonly: boolean | '+' | '-', typeParameter: TTypeParameter, typeAnnotation: TType};
type TType = 
  | TKeyword
  | TIdentifier
  | TString
  | TNumber
  | TBoolean
  | TUnion
  | TIntersection
  | TApplication
  | TTypeOperator
  | TFunction
  | TParameter
  | TMethod
  | TAlias
  | TInterface
  | TObject
  | Property
  | TArray
  | TTuple
  | TTemplate
  | TTypeParameter
  | TComponent
  | TConditional
  | TIndexedAccess
  | TKeyof
  | TLink
  | TReference
  | TMapped;

const codeStyle = style({font: 'code-sm'});

const styles = {};
function Asterisk() {return null;}

// export const TypeContext = React.createContext();
// export const LinkContext = React.createContext();

let LINKS = {};
export function setLinks(links) {
  LINKS = links;
}

export function Type({type, links}: {type: TType}) {
  // let links = useContext(TypeContext);

  if (!type) {
    return null;
  }

  switch (type.type) {
    case 'any':
    case 'null':
    case 'undefined':
    case 'void':
    case 'unknown':
    case 'never':
      return <Keyword {...type} />;
    case 'this':
      return <Keyword {...type} />;
    case 'symbol':
      return <Symbol />;
    case 'identifier':
      return <Identifier {...type} />;
    case 'string':
      if ('value' in type && type.value != null) {
        return <StringLiteral {...type} />;
      }
      return <Keyword {...type} />;
    case 'number':
      if ('value' in type && type.value != null) {
        return <NumberLiteral {...type} />;
      }
      return <Keyword {...type} />;
    case 'boolean':
      if ('value' in type && type.value != null) {
        return <BooleanLiteral {...type} />;
      }
      return <Keyword {...type} />;
    case 'union':
      return <UnionType {...type} />;
    case 'intersection':
      return <IntersectionType {...type} />;
    case 'application':
      return <TypeApplication {...type} />;
    case 'typeOperator':
      return <TypeOperator {...type} />;
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
      return <code className={codeStyle}><Type type={type.value} /></code>;
    case 'array':
      return <ArrayType {...type} />;
    case 'tuple':
      return <TupleType {...type} />;
    case 'typeParameter':
      return <TypeParameter {...type} />;
    case 'component': {
      let props = type.props;
      if (props?.type === 'application') {
        props = props.base;
      }
      if (props?.type === 'link') {
        props = LINKS[props.id];
      }
      if (props) {
        return <Type type={{...props, description: type.description} as any} />;
      }
      return null;
    }
    case 'conditional':
      return <ConditionalType {...type} />;
    case 'indexedAccess':
      return <IndexedAccess {...type} />;
    case 'keyof':
      return <Keyof {...type} />;
    case 'template':
      return <TemplateLiteral {...type} />;
    default:
      console.log('no render component for TYPE', type);
      return null;
  }
}

function TypeOperator({operator, value}: TTypeOperator) {
  return <span><span className={codeStyles.keyword}>{operator}</span>{' '}<Type type={value} /></span>;
}

function IndexedAccess({objectType, indexType}: TIndexedAccess) {
  return <span><Type type={objectType} />[<Type type={indexType} />]</span>;
}

function StringLiteral({value}: TString) {
  return <span className={codeStyles.string}>{`'${value!.replace(/'/, '\\\'')}'`}</span>;
}

function NumberLiteral({value}: TNumber) {
  return <span className={codeStyles.number}>{'' + value}</span>;
}

function BooleanLiteral({value}: TBoolean) {
  return <span className={codeStyles.keyword}>{'' + value}</span>;
}

function Symbol() {
  return <span className={codeStyles.keyword}>symbol</span>;
}

function Keyof({keyof}: TKeyof) {
  return <span><Keyword type="keyof" />{' '}<Type type={keyof} /></span>;
}

function Keyword({type}: {type: string}) {
  let link = getDoc(type);
  if (link) {
    return <ColorLink href={link} type="keyword" rel="noreferrer" target="_blank">{type}</ColorLink>;
  }

  return <span className={codeStyles.keyword}>{type}</span>;
}

function Identifier({name}: TIdentifier) {
  let link = getDoc(name) || DOC_LINKS[name];
  if (link) {
    return <ColorLink href={link} type="variable" rel="noreferrer" target="_blank">{name}</ColorLink>;
  }

  return <span className={codeStyles.variable}>{name}</span>;
}

// const IndentContext = React.createContext({small: '', large: ''});

export function Indent({params, open, close, children, alwaysIndent}: {params: TType[], open: string, close: string, children: ReactNode, alwaysIndent?: boolean}) {
  // let {small, large} = useContext(IndentContext);
  // let small = '';
  let large = '';
  let openElement, closeElement;

  if (params.length === 0) {
    openElement = <span className="token punctuation">{open}</span>;
    closeElement = <span className="token punctuation">{close}</span>;
  } else if (params.length > 2 || alwaysIndent) {
    // Always indent.
    openElement =  <span className="token punctuation">{open.trimEnd() + '\n' + large + '  '}</span>;
    closeElement =  <span className="token punctuation">{'\n' + large + close.trimStart()}</span>;
    large += '  ';
    // small += '  ';
  } else {
    // Indent on small screens. Don't indent on large screens.
    openElement = (
      <>
        {/* <span className="token punctuation small">{open.trimEnd() + '\n' + small + '  '}</span> */}
        <span className="token punctuation large">{open}</span>
      </>
    );

    closeElement = (
      <>
        {/* <span className="token punctuation small">{'\n' + small + close.trimStart()}</span> */}
        <span className="token punctuation large">{close}</span>
      </>
    );

    // small += '  ';
  }

  return (
    <>
      {openElement}
      {children}
      {closeElement}
    </>
  );
}

export function JoinList({elements, joiner, minIndent = 2, newlineBefore, neverIndent}: {elements: TType[], joiner: string, minIndent?: number, newlineBefore?: boolean, neverIndent?: boolean}) {
  // let {small, large, alwaysIndent} = useContext(IndentContext);
  let small = '';
  let large = '';

  let contents;
  if (neverIndent || (elements.length <= minIndent && small.length === 0)) {
    contents = joiner;
  } else if (elements.length > minIndent/* || alwaysIndent*/) {
    // Always indent.
    if (newlineBefore) {
      large += '  ';
      small += '  ';
    }

    contents = newlineBefore
      ? '\n' + large + joiner.trimStart()
      : joiner.trimEnd() + '\n' + large;
  } else {
    // Indent on small screens. Don't indent on large screens.
    if (newlineBefore) {
      small += '  ';
    }

    let indented = newlineBefore
      ? '\n' + small + joiner.trimStart()
      : joiner.trimEnd() + '\n' + small;

    contents = (
      <>
        <span className="small">{indented}</span>
        <span className="large">{joiner}</span>
      </>
    );
  }

  return elements
    .filter(Boolean)
    .reduce<ReactNode[]>((acc, v, i) => [
      ...acc,
      <span
        className="token punctuation"
        key={`join${v.name || v.raw}${i}`}>
        {contents}
      </span>,
      <React.Fragment
        key={`type${v.name || v.raw}${i}`}>
        <Type type={v} />
      </React.Fragment>
    ], []).slice(1);
}

function UnionType({elements}: TUnion) {
  return <JoinList elements={elements} joiner={' |\u00a0'} newlineBefore />;
}

function IntersectionType({types}: TIntersection) {
  return <JoinList elements={types} joiner={' &\u00a0'} newlineBefore />;
}

function TypeApplication({base, typeParameters}: TApplication) {
  return (
    <>
      <Type type={base} />
      <TypeParameters typeParameters={typeParameters} />
    </>
  );
}

export function TypeParameters({typeParameters}: {typeParameters: TType[]}) {
  if (typeParameters.length === 0) {
    return null;
  }

  return (
    <>
      <span className="token punctuation">&lt;</span>
      <JoinList elements={typeParameters} joiner=", " neverIndent />
      <span className="token punctuation">&gt;</span>
    </>
  );
}

function TypeParameter({name, constraint, default: defaultType}: TTypeParameter) {
  return (
    <>
      <span className={codeStyles.variable}>{name}</span>
      {constraint &&
        <>
          {' '}
          <span className={codeStyles.keyword}>extends</span>
          {' '}
          <Type type={constraint} />
        </>
      }
      {defaultType &&
        <>
          <span className="token punctuation">{' = '}</span>
          <Type type={defaultType} />
        </>
      }
    </>
  );
}

function FunctionType({name, parameters, return: returnType, typeParameters}: TFunction) {
  return (
    <>
      {name && <span className={codeStyles.function}>{name}</span>}
      <TypeParameters typeParameters={typeParameters} />
      <Indent params={parameters} open="(" close=")">
        <JoinList elements={parameters} joiner=", " />
      </Indent>
      <span className="token punctuation">{name ? ': ' : ' => '}</span>
      <Type type={returnType} />
    </>
  );
}

function Parameter({name, value, default: defaultValue, optional, rest}: TParameter) {
  return (
    <>
      {rest && <span className="token punctuation">...</span>}
      <span className="token">{name}</span>
      {optional && <span className="token punctuation">?</span>}
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

// export function LinkProvider({children}) {
//   let links = new Map();
//   return (
//     <LinkContext.Provider value={links}>
//       {children}
//       <LinkRenderer />
//     </LinkContext.Provider>
//   );
// }

// export function LinkRenderer() {
//   let links = useContext(LinkContext);
//   return [...links.values()].map(({type, links}) => (
//     <section key={type.id} id={type.id} data-title={type.name} hidden>
//       {type.description && <Markdown options={{forceBlock: true, overrides: {a: {component: SpectrumLink}}}} /*className={styles['type-description']}*/>{type.description}</Markdown>}
//       {type.type === 'interface' && type.extends?.length > 0 &&
//         <p style={{paddingLeft: 'var(--spectrum-global-dimension-size-200)'}}><strong>Extends</strong>: <code className={codeStyle}><JoinList elements={type.extends} joiner=", " /></code></p>
//       }
//       <TypeContext.Provider value={links}>
//         {type.type === 'interface' || type.type === 'alias' || type.type === 'component'
//           ? <Type type={type} />
//           : <code className={codeStyle}><Type type={type} /></code>
//         }
//       </TypeContext.Provider>
//     </section>
//   ));
// }

const cache = new Map();

export function LinkType({id}: TLink) {
  let type = LINKS[id];
  if (!type) {
    return null;
  }

  if (DOC_LINKS[type.name]) {
    return <Identifier type="identifier" name={type.name} />;
  }

  return <InlineLink type={type} />;
}

export function InlineLink({type}: {type: TType}) {
  if (cache.has(type.id)) {
    return cache.get(type.id);
  }

  let res = (
    <TypeLink name={type.name}>
      {'description' in type && type.description && <Markdown  className={style({font: 'body'})} options={{forceBlock: true, overrides: {a: {component: SpectrumLink}}}}>{type.description}</Markdown>}
      {type.type === 'interface' && type.extends?.length > 0 &&
        <p className={style({font: 'ui'})}><strong>Extends</strong>: <code className={codeStyle}><JoinList elements={type.extends} joiner=", " /></code></p>
      }
      {type.type === 'component' && <h3 className={style({font: 'title'})}>Props</h3>}
      {type.type === 'interface' || type.type === 'alias' || type.type === 'component'
        ? <Type type={type} />
        : <code className={codeStyle}><Type type={type} /></code>
      }
    </TypeLink>
  );

  cache.set(type.id, res);
  return res;
}

export function renderHTMLfromMarkdown(description: string, opts: object) {
  if (description) {
    const options = {forceInline: true, overrides: {a: {component: SpectrumLink}, code: {component: Code}}, disableParsingRawHTML: true, ...opts};
    return <Markdown options={options}>{description}</Markdown>;
  }
  return '';
}

export function InterfaceType({description, properties: props, typeParameters, showRequired, showDefault, isComponent, name, hideType}: TInterface) {
  let properties = Object.values(props).filter(prop => prop.type === 'property' && prop.access !== 'private' && prop.access !== 'protected').reverse();
  let methods = Object.values(props).filter(prop => prop.type === 'method' && prop.access !== 'private' && prop.access !== 'protected');

  // Default to showing required indicators if some properties are optional but not all.
  showRequired = showRequired || (!properties.every(p => p.optional) && !properties.every(p => !p.optional));

  // Show default values by default if any of the properties have one defined.
  showDefault = showDefault || properties.some(p => !!p.default);

  // Sort props so required ones are shown first.
  if (showRequired) {
    properties.sort((a, b) => {
      if (!a.optional && b.optional) {
        return -1;
      }

      if (a.optional && !b.optional) {
        return 1;
      }

      return 0;
    });
  }

  return (
    <>
      {methods.length > 0 && properties.length > 0 &&
        <h3 className={style({font: 'title'})}>Properties</h3>
      }
      {properties.length > 0 &&
        <Table>
          <TableHeader>
            <tr>
              <TableColumn>Name</TableColumn>
              {!hideType && <TableColumn>Type</TableColumn>}
              {showDefault && <TableColumn>Default</TableColumn>}
              {/* <TableColumn>Description</TableColumn> */}
            </tr>
          </TableHeader>
          <TableBody>
            {properties.map((prop, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell role="rowheader" hideBorder={!!prop.description}>
                    <code className={codeStyle}>
                      <span className={isComponent ? codeStyles.attribute : codeStyles.variable}>{prop.name}</span>
                    </code>
                    {!prop.optional && showRequired
                      ? <Asterisk size="XXS" UNSAFE_className={styles.requiredIcon} aria-label="Required" />
                      : null
                    }
                  </TableCell>
                  {!hideType &&
                    <TableCell hideBorder={!!prop.description}>
                      <code className={codeStyle}>
                        <Type type={prop.value} />
                      </code>
                    </TableCell>
                  }
                  {showDefault &&
                    <TableCell hideBorder={!!prop.description} styles={prop.default ? null : style({display: {default: 'none', sm: '[table-cell]'}})}>
                      <strong className={style({font: 'body', fontWeight: 'bold', display: {sm: 'none'}})}>Default: </strong>
                      {prop.default
                        ? <Code lang="tsx">{prop.default}</Code>
                        : '—'
                      }
                    </TableCell>
                  }
                  {/* <TableCell>{renderHTMLfromMarkdown(prop.description, {forceInline: false})}</TableCell> */}
                </TableRow>
                {prop.description && <TableRow>
                  <TableCell colSpan={3}>{renderHTMLfromMarkdown(prop.description, {forceInline: true})}</TableCell>
                </TableRow>}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      }
      {methods.length > 0 && properties.length > 0 &&
        <h3 className={style({font: 'title'})}>Methods</h3>
      }
      {methods.length > 0 &&
        <Table>
          {/* <TableHeader>
            <TableRow>
              <TableColumn>Method</TableColumn>
            </TableRow>
          </TableHeader> */}
          <TableBody>
            {methods.map((prop, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell role="rowheader" data-column="Name" hideBorder={!!prop.description}>
                    <code className={codeStyle}>
                      <span className={codeStyles.function}>{prop.name}</span>
                      <TypeParameters typeParameters={prop.value.typeParameters} />
                      <Indent params={prop.value.parameters} open="(" close=")">
                        <JoinList elements={prop.value.parameters} joiner=", " />
                      </Indent>
                      <span className="token punctuation">{': '}</span>
                      <Type type={prop.value.return} />
                    </code>
                  </TableCell>
                </TableRow>
                {prop.description && <TableRow>
                  <TableCell colSpan={3}>{renderHTMLfromMarkdown(prop.description, {forceInline: true})}</TableCell>
                </TableRow>}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      }
    </>
  );
}

function ObjectType({properties}: TObject) {
  const startObject = <span className="token punctuation">{'{'}</span>;
  const endObject = <span className="token punctuation">{'}'}</span>;
  return (
    <>
      {startObject}
      {Object.entries(properties!).map(([k, property], i, arr) => {
        let token = codeStyles.attribute;
        // https://mathiasbynens.be/notes/javascript-identifiers-es6
        if (!/^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]+$/u.test(k)) {
          k = `'${k}'`;
          token = codeStyles.string;
        }

        let optional = property.optional;
        let value = property.value;
        let indexType = 'indexType' in property && property.indexType;

        let punc = optional ? '?: ' : ': ';
        return (
          <div key={k ?? i} style={{paddingLeft: '1.5em'}}>
            {indexType && <span className="token punctuation">[</span>}
            <span className={`token ${token}`}>{k}</span>
            {indexType && <span className="token punctuation">{': '}</span>}
            {indexType && <Type type={indexType} />}
            {indexType && <span className="token punctuation">]</span>}
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

function ArrayType({elementType}: TArray) {
  return (
    <>
      <Type type={elementType} />
      <span className="token punctuation">[]</span>
    </>
  );
}

function TupleType({elements}: TTuple) {
  return (
    <>
      <Indent params={elements} alwaysIndent open="[" close="]">
        <JoinList elements={elements} joiner=", " />
      </Indent>
    </>
  );
}

function ConditionalType({checkType, extendsType, trueType, falseType}: TConditional) {
  return (
    <>
      <Type type={checkType} />
      {' '}
      <span className={codeStyles.keyword}>extends</span>
      {' '}
      <Type type={extendsType} />
      <span className="token punctuation">{' ? '}</span>
      <Type type={trueType} />
      <span className="token punctuation">{' :' + (falseType.type === 'conditional' ? '\n' : ' ')}</span>
      <Type type={falseType} />
    </>
  );
}

function TemplateLiteral({elements}: TTemplate) {
  return (
    <>
      <span className={codeStyles.string}>{'`'}</span>
      {elements.map((element, i) => {
        if (element.type === 'string' && 'value' in element && element.value != null) {
          return <span className={codeStyles.string} key={i}>{element.value}</span>;
        }

        return (
          <React.Fragment key={i}>
            <span className="token punctuation">{'${'}</span>
            <Type type={element} />
            <span className="token punctuation">{'}'}</span>
          </React.Fragment>
        );
      })}
      <span className={codeStyles.string}>{'`'}</span>
    </>
  );
}
