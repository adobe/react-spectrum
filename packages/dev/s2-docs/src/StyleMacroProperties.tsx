import {Accordion, Disclosure, DisclosurePanel, DisclosureTitle} from '@react-spectrum/s2';
import {BackgroundColorsDisclosure, GlobalColorsDisclosure, SemanticColorsDisclosure, TextColorsDisclosure} from './S2Colors';
import {styles as codeStyles} from './Code';
import {ColorLink} from './Link';
import {Punctuation} from './types';
import React, {ReactNode} from 'react';
import {S2Typography} from './S2Typography';
import {spacingTypeValues} from './styleProperties';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const codeStyle = style({font: {default: 'code-xs', lg: 'code-sm'}});

const styleMacroValueDesc: Record<string, {description?: ReactNode, body?: ReactNode}> = {
  'baseSpacing': {
    description: 'Base spacing values in pixels, following a 4px grid. Will be converted to rem.',
    body: (
      <code className={codeStyle}>
        {spacingTypeValues['baseSpacing'].map((val, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && Punctuation(' | ')}
            {val}
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
            {idx > 0 && Punctuation(' | ')}
            {val}
          </React.Fragment>
        ))}
      </code>
    )
  },
  'text-to-control': {
    description: 'Default spacing between text and a control (e.g., label and input). Scales with font size.'
  },
  'text-to-visual': {
    description: 'Default spacing between text and a visual element (e.g., icon). Scales with font size.'
  },
  'edge-to-text': {
    description: 'Default spacing between the edge of a control and its text. Relative to control height.'
  },
  'pill': {
    description: 'Default spacing between the edge of a pill-shaped control and its text. Relative to control height.'
  },
  'baseColors': {
    description: <><code>baseColors</code> consists of the following values below:</>,
    body: (
      <>
        <SemanticColorsDisclosure />
        <GlobalColorsDisclosure />
      </>
    )
  },
  'fontSize': {
    body: <S2Typography />
  },
  'ui': {
    description: 'Use within interactive UI components.'
  },
  'heading': {
    description: 'Use for headings in content pages.'
  },
  'title': {
    description: 'Use for titles within UI components such as cards or panels.'
  },
  'body': {
    description: 'Use for the content of pages that are primarily text.'
  },
  'detail': {
    description: 'Use for less important metadata.'
  },
  'code': {
    description: 'Use for source code.'
  },
  'lengthPercentage': {
    description: <>A CSS length value with percentage or viewport units. e.g. <code className={codeStyle}>'50%'</code>, <code className={codeStyle}>'100vw'</code>, <code className={codeStyle}>'50vh'</code></>
  },
  'number': {
    description: <>A numeric value in pixels e.g. <code className={codeStyle}>20</code>. Will be converted to rem and scaled on touch devices.</>
  }
};

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

  return (
    <Accordion allowsMultipleExpanded>
      {propertyNames.map((propertyName, index) => {
        let propDef = properties[propertyName];
        let values = propDef.values;
        let links = propDef.links || {};

        return (
          <Disclosure key={index} id={propertyName}>
            <DisclosureTitle>
              <code className={codeStyle}>
                <span className={codeStyles.attribute}>{propertyName}</span>
              </code>
            </DisclosureTitle>
            <DisclosurePanel>
              <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
                {propDef.mapping && (
                  <div>
                    <h4 className={style({font: 'ui', fontWeight: 'bold', marginBottom: 8})}>Maps to</h4>
                    <code className={codeStyle}>
                      {propDef.mapping.map((mappedProp, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && Punctuation(', ')}
                          <span className={codeStyles.attribute}>{mappedProp}</span>
                        </React.Fragment>
                      ))}
                    </code>
                  </div>
                )}
                {/* for color and backgroundColor, skip values list and render disclosures directly since the contents of the disclosures cover the mapped values */}
                {(() => {
                  if (propertyName === 'color') {
                    return (
                      <Accordion allowsMultipleExpanded>
                        <TextColorsDisclosure />
                        {styleMacroValueDesc['baseColors'].body}
                      </Accordion>
                    );
                  }
                  if (propertyName === 'backgroundColor') {
                    return (
                      <Accordion allowsMultipleExpanded>
                        <BackgroundColorsDisclosure />
                        {styleMacroValueDesc['baseColors'].body}
                      </Accordion>
                    );
                  }
                  return (
                    <div>
                      <h4 className={style({font: 'ui', fontWeight: 'bold', marginBottom: 8})}>Values</h4>
                      <code className={codeStyle}>
                        {values.map((value, i) => {
                          let content;
                          if (links[value]) {
                            content = (
                              <ColorLink
                                href={links[value].href}
                                type="variable"
                                rel={links[value].isRelative ? undefined : 'noreferrer'}
                                target={links[value].isRelative ? undefined : '_blank'}>
                                {value}
                              </ColorLink>
                            );
                          } else if (value === 'baseColors') {
                            content = <span className={codeStyles.variable}>{value}</span>;
                          } else {
                            content = <span className={codeStyles.string}>'{value}'</span>;
                          }

                          return (
                            <React.Fragment key={i}>
                              {i > 0 && Punctuation(' | ')}
                              {content}
                            </React.Fragment>
                          );
                        })}
                        {/* for additional types properties (e.g. properties that have negative spacing or accept number/length percentage) we add them to the end */}
                        {propDef.additionalTypes && propDef.additionalTypes.map((typeName, i) => {
                          return (
                            <React.Fragment key={`type-${i}`}>
                              {(values.length > 0 || i > 0) && Punctuation(' | ')}
                              <span className={codeStyles.variable}>{typeName}</span>
                            </React.Fragment>
                          );
                        })}
                      </code>
                    </div>
                  );
                })()}
                {values.map((value, i) => {
                  let valueDesc = styleMacroValueDesc[value];
                  // special case handling for font and spacing specific value descriptions so they don't get rendered for
                  // other properties that may include the same values (e.g. heading in Colors)
                  // skip baseColors here as it will be rendered after
                  let shouldShowDescription = false;
                  if (value === 'fontSize' && (propertyName === 'fontSize' || propertyName === 'font')) {
                    shouldShowDescription = true;
                  } else if (['ui', 'heading', 'title', 'body', 'detail', 'code'].includes(value) && propertyName === 'lineHeight') {
                    shouldShowDescription = true;
                  } else if (['text-to-control', 'text-to-visual', 'edge-to-text', 'pill'].includes(value)) {
                    shouldShowDescription = true;
                  }

                  if (shouldShowDescription && (valueDesc?.description || valueDesc?.body)) {
                    return (
                      <div key={`value-desc-${i}`}>
                        <h4 className={style({font: 'ui', fontWeight: 'bold', marginBottom: 8})}>
                          <code className={codeStyle}>
                            <span className={codeStyles.string}>'{value}'</span>
                          </code>
                        </h4>
                        {valueDesc.description && (
                          <p className={style({font: 'body', marginBottom: 8})}>
                            {valueDesc.description}
                          </p>
                        )}
                        {valueDesc.body}
                      </div>
                    );
                  }
                  return null;
                })}
                {/* show S2Typography for "fontSize" property and "font" shorthand specificatlly */}
                {(propertyName === 'fontSize' || propertyName === 'font') && (
                  <S2Typography />
                )}
                {/* for other color property names show baseColors description since the value list is displayed still */}
                {values.includes('baseColors') && styleMacroValueDesc['baseColors'] && (propertyName !== 'color' && propertyName !== 'backgroundColor') && (
                  <div>
                    {styleMacroValueDesc['baseColors'].description && (
                      <p className={style({font: 'body', marginBottom: 8})}>
                        {styleMacroValueDesc['baseColors'].description}
                      </p>
                    )}
                    {styleMacroValueDesc['baseColors'].body}
                  </div>
                )}
                {/* for the types that have descriptions, we add them below with the associated descriptions and/or mappings */}
                {propDef.additionalTypes && propDef.additionalTypes.map((typeName, i) => {
                  let typeLink = styleMacroValueDesc[typeName];
                  if (typeLink?.description || typeLink?.body) {
                    // dont render the type name for properties that only have one special value (e.g. baseSpacing) that has an associated description
                    // so that we don't double up on rendering the value name
                    let shouldSkipTypeName = values.length === 0 && propDef.additionalTypes?.length === 1;

                    return (
                      <div key={`type-desc-${i}`}>
                        {!shouldSkipTypeName && (
                          <h4 className={style({font: 'ui', fontWeight: 'bold', marginBottom: 8})}>
                            <code className={codeStyle}>
                              <span className={codeStyles.variable}>{typeName}</span>
                            </code>
                          </h4>
                        )}
                        {typeLink.description && (
                          <p className={style({font: 'body', marginBottom: 8})}>
                            {typeLink.description}
                          </p>
                        )}
                        {typeLink.body}
                      </div>
                    );
                  }
                  return null;
                })}
                {propDef.description && (
                  <div className={style({font: 'body'})}>
                    {propDef.description}
                  </div>
                )}
              </div>
            </DisclosurePanel>
          </Disclosure>
        );
      })}
    </Accordion>
  );
}
