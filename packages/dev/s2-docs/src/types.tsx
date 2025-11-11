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

import Asterisk from '../../../@react-spectrum/s2/ui-icons/Asterisk';
import {Code, styles as codeStyles} from './Code';
import {ColorLink, Link as SpectrumLink} from './Link';
import {getDoc} from 'globals-docs';
import Markdown from 'markdown-to-jsx';
import React, {ReactNode} from 'react';
import {spacingTypeValues} from './styleProperties';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from './Table';
import {TypePopover} from './TypePopover';

export type TParameter = {type: 'parameter', name: string, value: TType, optional: boolean, rest: boolean, description: string | null, default?: string};
export type TProperty = {type: 'property', name: string, indexType: TType | null, value: TType, optional: boolean, description: string | null, access: string | null, selector: string | null, default: string | null};
export type TTypeParameter = {type: 'typeParameter', name: string, constraint: TType | null, default: TType | null};
export type TKeyword = {type: 'any' | 'null' | 'undefined' | 'void' | 'unknown' | 'never' | 'this' | 'symbol' | 'string' | 'number' | 'boolean'};
export type TIdentifier = {type: 'identifier', name: string};
export type TString = {type: 'string', value?: string};
export type TNumber = {type: 'number', value?: number};
export type TBoolean = {type: 'boolean', value?: boolean};
export type TUnion = {type: 'union', elements: TType[]};
export type TIntersection = {type: 'intersection', types: TType[]};
export type TApplication = {type: 'application', base: TType, typeParameters: TType[]};
export type TTypeOperator = {type: 'typeOperator', operator: string, value: TType};
export type TFunction = {type: 'function', id?: string, name?: string, parameters: TParameter[], return: TType, typeParameters: TTypeParameter[], description: string | null, access: string | null};
export type TMethod = {type: 'method', name: string, value: TFunction, optional: boolean, access: string | null, description: string | null, default: string | null};
export type TAlias = {type: 'alias', id: string, name: string, value: TType, typeParameters: TTypeParameter[], description: string | null, access?: string};
export type TInterface = {type: 'interface', id: string, name: string, extends: TType[], properties: {[name: string]: TProperty | TMethod}, typeParameters: TTypeParameter[], description: string | null, access: string | null};
export type TObject = {type: 'object', properties: {[name: string]: TProperty | TMethod} | null, description: string | null, access: string | null};
export type TArray = {type: 'array', elementType: TType};
export type TTuple = {type: 'tuple', elements: TType[]};
export type TTemplate = {type: 'template', elements: TType[]};
export type TComponent = {type: 'component', id: string, name: string, props: TType | null, typeParameters: TTypeParameter[], ref: TType | null, description: string | null, access: string | null};
export type TConditional = {type: 'conditional', checkType: TType, extendsType: TType, trueType: TType, falseType: TType};
export type TIndexedAccess = {type: 'indexedAccess', objectType: TType, indexType: TType};
export type TKeyof = {type: 'keyof', keyof: TType};
export type TLink = {type: 'link', id: string};
export type TReference =  {type: 'reference', local: string, imported: string, specifier: string};
export type TMapped = {type: 'mapped', readonly: boolean | '+' | '-', typeParameter: TTypeParameter, typeAnnotation: TType};
export type TType =
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
  | TProperty
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

const codeStyle = style({font: {default: 'code-xs', lg: 'code-sm'}});

let LINKS = {};
export function setLinks(links) {
  LINKS = links;
}

export function Type({type}: {type: TType}) {
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
    openElement = <Punctuation>{open}</Punctuation>;
    closeElement = <Punctuation>{close}</Punctuation>;
  } else if (params.length > 2 || alwaysIndent) {
    // Always indent.
    openElement =  <Punctuation>{open.trimEnd() + '\n' + large + '  '}</Punctuation>;
    closeElement =  <Punctuation>{'\n' + large + close.trimStart()}</Punctuation>;
    large += '  ';
    // small += '  ';
  } else {
    // Indent on small screens. Don't indent on large screens.
    openElement = (
      <>
        {/* <Punctuation>{open.trimEnd() + '\n' + small + '  '}</Punctuation> */}
        <Punctuation>{open}</Punctuation>
      </>
    );

    closeElement = (
      <>
        {/* <Punctuation>{'\n' + small + close.trimStart()}</Punctuation> */}
        <Punctuation>{close}</Punctuation>
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

function Punctuation({children}) {
  if (typeof children === 'string' && /\s/.test(children)) {
    return children;
  }
  return <><wbr />{children}</>;
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
      <Punctuation
        key={`join${i}`}>
        {contents}
      </Punctuation>,
      <React.Fragment
        key={`type${i}`}>
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
      <Punctuation>&lt;</Punctuation>
      <JoinList elements={typeParameters} joiner=", " neverIndent />
      <Punctuation>&gt;</Punctuation>
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
          <Punctuation>{' = '}</Punctuation>
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
      <Punctuation>{name ? ': ' : ' => '}</Punctuation>
      <Type type={returnType} />
    </>
  );
}

function Parameter({name, value, default: defaultValue, optional, rest}: TParameter) {
  return (
    <>
      {rest && <Punctuation>...</Punctuation>}
      {name}
      {optional && <Punctuation>?</Punctuation>}
      {value &&
        <>
          <Punctuation>: </Punctuation>
          <Type type={value} />
        </>
      }
      {defaultValue &&
        <>
          <Punctuation> = </Punctuation>
          <span dangerouslySetInnerHTML={{__html: defaultValue}} />
        </>
      }
    </>
  );
}

const cache = new Map();

export function LinkType({id}: TLink) {
  let type = LINKS[id];
  if (!type) {
    return null;
  }

  if (DOC_LINKS[type.name]) {
    return <Identifier type="identifier" name={type.name} />;
  }

  return <TypeLink type={type} />;
}

export function TypeLink({type}: {type: Extract<TType, {id: string, name: string}>}) {
  if (cache.has(type.id)) {
    return cache.get(type.id);
  }

  let res = (
    <TypePopover name={type.name}>
      {'description' in type && type.description && <Markdown  className={style({font: 'body'})} options={{forceBlock: true, overrides: {a: {component: SpectrumLink}}}}>{type.description}</Markdown>}
      {type.type === 'interface' && type.extends?.length > 0 &&
        <p className={style({font: 'ui'})}><strong>Extends</strong>: <code className={codeStyle}><JoinList elements={type.extends} joiner=", " /></code></p>
      }
      {type.type === 'component' && <h3 className={style({font: 'title'})}>Props</h3>}
      {type.type === 'interface' || type.type === 'alias' || type.type === 'component'
        ? <Type type={type} />
        : <code className={codeStyle}><Type type={type} /></code>
      }
    </TypePopover>
  );

  cache.set(type.id, res);
  return res;
}

export function renderHTMLfromMarkdown(description: string | null | undefined, opts: object): ReactNode {
  if (description) {
    const options = {forceInline: true, overrides: {a: {component: SpectrumLink}, code: {component: Code}}, disableParsingRawHTML: true, ...opts};
    return <Markdown options={options}>{description}</Markdown>;
  }
  return null;
}

interface InterfaceTypeProps extends TInterface {
  showRequired?: boolean,
  showDefault?: boolean,
  isComponent?: boolean,
  hideType?: boolean
}

export function InterfaceType({properties: props, showRequired, showDefault, isComponent, hideType}: InterfaceTypeProps) {
  let properties = Object.values(props).filter(prop => prop.type === 'property' && prop.access !== 'private' && prop.access !== 'protected').reverse();
  let methods = Object.values(props).filter(prop => prop.type === 'method' && prop.access !== 'private' && prop.access !== 'protected') as TMethod[];

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
                      ? <Asterisk size="M" className={style({marginStart: 8})} aria-label="Required" />
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
                    <TableCell hideBorder={!!prop.description} styles={prop.default ? undefined : style({display: {default: 'none', sm: '[table-cell]'}})}>
                      <strong className={style({font: 'body', fontWeight: 'bold', display: {sm: 'none'}})}>Default: </strong>
                      {prop.default
                        ? <span className={codeStyle}><Code lang="tsx">{prop.default}</Code></span>
                        : '—'
                      }
                    </TableCell>
                  }
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
                      <Punctuation>{': '}</Punctuation>
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
  const startObject = <Punctuation>{'{'}</Punctuation>;
  const endObject = <Punctuation>{'}'}</Punctuation>;
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
            {indexType && <Punctuation>[</Punctuation>}
            <span className={`token ${token}`}>{k}</span>
            {indexType && <Punctuation>{': '}</Punctuation>}
            {indexType && <Type type={indexType} />}
            {indexType && <Punctuation>]</Punctuation>}
            <Punctuation>{punc}</Punctuation>
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
      <Punctuation>[]</Punctuation>
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
      <Punctuation>{' ? '}</Punctuation>
      <Type type={trueType} />
      <Punctuation>{' :' + (falseType.type === 'conditional' ? '\n' : ' ')}</Punctuation>
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
            <Punctuation>{'${'}</Punctuation>
            <Type type={element} />
            <Punctuation>{'}'}</Punctuation>
          </React.Fragment>
        );
      })}
      <span className={codeStyles.string}>{'`'}</span>
    </>
  );
}

const styleMacroTypeLinks = {
  'baseSpacing': {
    description: 'Base spacing values in pixels, following a 4px grid. Will be converted to rem.',
    body: (
      <code className={codeStyle}>
        {spacingTypeValues['baseSpacing'].map((val, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <Punctuation>{' | '}</Punctuation>}
            <span className={codeStyles.string}>'{val}'</span>
          </React.Fragment>
        ))}
      </code>
    )
  },
  'negativeSpacing': {
    description: 'Negative spacing values in pixels, following a 4px grid. Will be converted to rem.',
    body: (
      <code className={codeStyle}>
        {spacingTypeValues['negativeSpacing'].map((val, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <Punctuation>{' | '}</Punctuation>}
            <span className={codeStyles.string}>'{val}'</span>
          </React.Fragment>
        ))}
      </code>
    )
  },
  'LengthPercentage': {
    description: <>A CSS length value with percentage or viewport units. e.g. <code className={codeStyle}>'50%'</code>, <code className={codeStyle}>'100vw'</code>, <code className={codeStyle}>'50vh'</code></>
  },
  'number': {
    description: <>A numeric value in pixels e.g. <code className={codeStyle}>20</code>. Will be converted to rem and scaled on touch devices.</>
  }
};

interface StyleMacroTypePopoverProps {
  typeName: string,
  description: ReactNode,
  body?: ReactNode,
  link?: string
}

function StyleMacroTypePopover({typeName, description, body}: StyleMacroTypePopoverProps) {
  return (
    <TypePopover name={typeName}>
      <>
        <p className={style({font: 'body'})}>
          {description}
        </p>
        {body}
      </>
    </TypePopover>
  );
}

interface StyleMacroPropertyDefinition {
  values: string[],
  additionalTypes?: string[],
  links?: {[value: string]: {href: string, isRelative?: boolean}},
  description?: string,
  mapping?: string[]
}

interface StyleMacroPropertiesProps {
  properties: {[propertyName: string]: StyleMacroPropertyDefinition}
}

export function StyleMacroProperties({properties}: StyleMacroPropertiesProps) {
  let propertyNames = Object.keys(properties);
  let hasMapping = Object.values(properties).some(p => p.mapping);

  return (
    <Table>
      <TableHeader>
        <tr>
          <TableColumn>Property</TableColumn>
          <TableColumn>Values</TableColumn>
          {hasMapping && <TableColumn>Mapping</TableColumn>}
        </tr>
      </TableHeader>
      <TableBody>
        {propertyNames.map((propertyName, index) => {
          let propDef = properties[propertyName];
          let values = propDef.values;
          let links = propDef.links || {};

          return (
            <React.Fragment key={index}>
              <TableRow>
                <TableCell role="rowheader" hideBorder={!!propDef.description}>
                  <code className={codeStyle}>
                    <span className={codeStyles.attribute}>{propertyName}</span>
                  </code>
                </TableCell>
                <TableCell hideBorder={!!propDef.description}>
                  <code className={codeStyle}>
                    {values.map((value, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <Punctuation>{' | '}</Punctuation>}
                        {links[value] ? (
                          <ColorLink
                            href={links[value].href}
                            type="variable"
                            rel={links[value].isRelative ? undefined : 'noreferrer'}
                            target={links[value].isRelative ? undefined : '_blank'}>
                            {value}
                          </ColorLink>
                        ) : (
                          <span className={codeStyles.string}>'{value}'</span>
                        )}
                      </React.Fragment>
                    ))}
                    {propDef.additionalTypes && propDef.additionalTypes.map((typeName, i) => {
                      let typeLink = styleMacroTypeLinks[typeName];
                      return (
                        <React.Fragment key={`type-${i}`}>
                          {(values.length > 0 || i > 0) && <Punctuation>{' | '}</Punctuation>}
                          {/* eslint-disable-next-line no-nested-ternary */}
                          {typeLink ? (
                            // only if the type link has a description and/or body do we want to render the type popover
                            // this is to make things like baseColor
                            typeLink.link && !typeLink.description && !typeLink.body ? (
                              <ColorLink href={typeLink.link} type="variable">{typeName}</ColorLink>
                            ) : (
                              <StyleMacroTypePopover
                                typeName={typeName}
                                description={typeLink.description}
                                body={typeLink.body} />
                            )
                          ) : undefined}
                        </React.Fragment>
                      );
                    })}
                  </code>
                </TableCell>
                {hasMapping && (
                  <TableCell hideBorder={!!propDef.description}>
                    <code className={codeStyle}>
                      {propDef.mapping?.map((mappedProp, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <Punctuation>{', '}</Punctuation>}
                          <span className={codeStyles.attribute}>{mappedProp}</span>
                        </React.Fragment>
                      ))}
                    </code>
                  </TableCell>
                )}
              </TableRow>
              {propDef.description && (
                <TableRow>
                  <TableCell colSpan={hasMapping ? 3 : 2}>{propDef.description}</TableCell>
                </TableRow>
              )}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}
