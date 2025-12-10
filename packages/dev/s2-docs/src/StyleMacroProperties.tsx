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
                      <ul className={style({marginStart: 24, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12, paddingStart: 0})}>
                        {values.map((value, i) => {
                          let valueDesc = styleMacroValueDesc[value];
                          // special case handling for font and spacing specific value descriptions so they don't get rendered for
                          // other properties that may include the same values (e.g. heading in Colors)
                          let shouldShowDescription = false;
                          if (value === 'fontSize' && (propertyName === 'fontSize' || propertyName === 'font')) {
                            shouldShowDescription = true;
                          } else if (['ui', 'heading', 'title', 'body', 'detail', 'code'].includes(value) && propertyName === 'lineHeight') {
                            shouldShowDescription = true;
                          } else if (['text-to-control', 'text-to-visual', 'edge-to-text', 'pill'].includes(value)) {
                            shouldShowDescription = true;
                          } else if (value === 'baseColors' && propertyName !== 'color' && propertyName !== 'backgroundColor') {
                            shouldShowDescription = true;
                          }

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
                            <li key={i} className={style({font: 'body'})}>
                              <code className={codeStyle}>
                                {content}
                              </code>
                              {shouldShowDescription && valueDesc?.description && (
                                <div className={style({marginTop: 4})}>
                                  {valueDesc.description}
                                </div>
                              )}
                              {shouldShowDescription && valueDesc?.body && (
                                <div className={style({marginTop: 8})}>
                                  {valueDesc.body}
                                </div>
                              )}
                            </li>
                          );
                        })}
                        {/* for additional types properties (e.g. properties that have negative spacing or accept number/length percentage) we add them to the end */}
                        {propDef.additionalTypes && propDef.additionalTypes.map((typeName, i) => {
                          let typeDesc = styleMacroValueDesc[typeName];
                          return (
                            <li key={`type-${i}`} className={style({font: 'body'})}>
                              <code className={codeStyle}>
                                <span className={codeStyles.variable}>{typeName}</span>
                              </code>
                              {typeDesc?.description && (
                                <div className={style({marginTop: 4})}>
                                  {typeDesc.description}
                                </div>
                              )}
                              {typeDesc?.body && (
                                <div className={style({marginTop: 8})}>
                                  {typeDesc.body}
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })()}
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
