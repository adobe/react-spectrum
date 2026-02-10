import {Accordion, Disclosure, DisclosurePanel, DisclosureTitle} from '@react-spectrum/s2';
import {BackgroundColorsDisclosure, Color, GlobalColorsDisclosure, HCMColorsDisclosure, SemanticColorsDisclosure, TextColorsDisclosure, TransparentColorsDisclosure} from './S2Colors';
import {styles as codeStyles} from './Code';
import {ColorLink} from './Link';
import {colorSwatch} from './color.macro' with {type: 'macro'};
import {Punctuation} from './types';
import React, {ReactNode} from 'react';
import {S2Typography} from './S2Typography';
import {spacingTypeValues} from './styleProperties';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const codeStyle = style({font: {default: 'code-xs', lg: 'code-sm'}});

function BaseColorsAccordion() {
  return (
    <div className={style({marginTop: 16})}>
      <Accordion allowsMultipleExpanded>
        {styleMacroValueDesc['baseColors'].body}
      </Accordion>
    </div>
  );
}

function NoneValueListItem() {
  return (
    <li className={style({font: 'body'})}>
      <code className={codeStyle}>
        <span className={codeStyles.string}>'none'</span>
      </code>
    </li>
  );
}

function CurrentColorListItem({links}: {links: {[value: string]: {href: string, isRelative?: boolean}}}) {
  return (
    <li className={style({font: 'body'})}>
      <code className={codeStyle}>
        <ColorLink
          href={links['currentColor'].href}
          type="variable"
          rel="noreferrer"
          target="_blank">
          currentColor
        </ColorLink>
      </code>
    </li>
  );
}

const styleMacroValueDesc: Record<string, {description?: ReactNode, body?: ReactNode}> = {
  'baseSpacing': {
    description: 'Base spacing values in pixels, following a 4px grid. Will be converted to rem.',
    body: (
      <code className={codeStyle}>
        {spacingTypeValues['baseSpacing'].map((val, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && Punctuation(' | ')}
            <span className={codeStyles.number}>{val}</span>
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
            <span className={codeStyles.number}>{val}</span>
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
        <TransparentColorsDisclosure />
        <HCMColorsDisclosure />
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
  },
  'full': {
    description: <>Resolves to <code className={codeStyle}>100%</code>.</>
  },
  'screen': {
    description: <>Resolves to <code className={codeStyle}>100vh</code> for height or <code className={codeStyle}>100vw</code> for width.</>
  },
  'emphasized': {
    description: 'Shadow for emphasized states.'
  },
  'elevated': {
    description: 'Shadow for elevated surfaces.'
  },
  'dragged': {
    description: 'Shadow for elements being dragged.'
  },
  'square': {
    description: <>1:1 aspect ratio.</>
  },
  'video': {
    description: <>16:9 aspect ratio.</>
  },
  'default': {
    description: 'Sets transition property to color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, and backdrop-filter.'
  },
  'colors': {
    description: 'Sets transition property to color, background-color, border-color, text-decoration-color, fill, and stroke.'
  },
  'opacity': {
    description: 'Sets transition property to opacity.'
  },
  'shadow': {
    description: 'Sets transition property to box-shadow.'
  },
  'transform': {
    description: 'Sets transition property to transform, translate, scale, and rotate properties.'
  },
  'all': {
    description: 'Sets transition to all animatable properties.'
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
  properties: {[propertyName: string]: StyleMacroPropertyDefinition},
  sort?: boolean
}

let sizingProperties = ['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'flexBasis', 'containIntrinsicWidth', 'containIntrinsicHeight'];

export function StyleMacroProperties({properties, sort = true}: StyleMacroPropertiesProps) {
  let propertyNames = sort ? Object.keys(properties).sort() : Object.keys(properties);

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
              {(() => {
                // if all values are numbers, we will render with pipes instead of bullets
                let allValuesAreNumbers = values.length > 0 && values.every(v => typeof v === 'number');

                return (
                  <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
                    {/* this is for shorthands */}
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
                    {(() => {
                      if (propertyName === 'color') {
                        return (
                          <div>
                            <h4 className={style({font: 'ui', fontWeight: 'bold', marginBottom: 8})}>Values</h4>
                            <div className="sb-unstyled" style={{columnWidth: 120}}>
                              <Color name="black" className={colorSwatch('black', 'color')} />
                              <Color name="white" className={colorSwatch('white', 'color')} />
                            </div>
                            <Accordion allowsMultipleExpanded styles={style({marginTop: 16})}>
                              <TextColorsDisclosure />
                              {styleMacroValueDesc['baseColors'].body}
                            </Accordion>
                          </div>
                        );
                      }
                      if (propertyName === 'backgroundColor') {
                        return (
                          <div>
                            <h4 className={style({font: 'ui', fontWeight: 'bold', marginBottom: 8})}>Values</h4>
                            <div className="sb-unstyled" style={{columnWidth: 120}}>
                              <Color name="black" className={colorSwatch('black', 'backgroundColor')} />
                              <Color name="white" className={colorSwatch('white', 'backgroundColor')} />
                            </div>
                            <Accordion allowsMultipleExpanded styles={style({marginTop: 16})}>
                              <BackgroundColorsDisclosure />
                              {styleMacroValueDesc['baseColors'].body}
                            </Accordion>
                          </div>
                        );
                      }

                      // for fontSize and font, render typography examples
                      if (propertyName === 'fontSize' || propertyName === 'font') {
                        return <S2Typography />;
                      }

                      // for borderColor, outlineColor, fill, and stroke, render color swatches
                      if (propertyName === 'borderColor') {
                        return (
                          <div>
                            <h4 className={style({font: 'ui', fontWeight: 'bold', marginBottom: 8})}>Values</h4>
                            <div className="sb-unstyled" style={{columnWidth: 120}}>
                              <Color name="black" className={colorSwatch('black', 'borderColor')} />
                              <Color name="white" className={colorSwatch('white', 'borderColor')} />
                              <Color name="negative" className={colorSwatch('negative', 'borderColor')} />
                              <Color name="disabled" className={colorSwatch('disabled', 'borderColor')} />
                            </div>
                            <BaseColorsAccordion />
                          </div>
                        );
                      }

                      if (propertyName === 'outlineColor') {
                        return (
                          <div>
                            <h4 className={style({font: 'ui', fontWeight: 'bold', marginBottom: 8})}>Values</h4>
                            <div className="sb-unstyled" style={{columnWidth: 120}}>
                              <Color name="black" className={colorSwatch('black', 'outlineColor')} />
                              <Color name="white" className={colorSwatch('white', 'outlineColor')} />
                              <Color name="focus-ring" className={colorSwatch('focus-ring', 'outlineColor')} />
                            </div>
                            <BaseColorsAccordion />
                          </div>
                        );
                      }

                      if (propertyName === 'fill') {
                        return (
                          <div>
                            <h4 className={style({font: 'ui', fontWeight: 'bold', marginBottom: 8})}>Values</h4>
                            <ul className={style({marginStart: 24, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12, paddingStart: 0})}>
                              <NoneValueListItem />
                              <CurrentColorListItem links={links} />
                            </ul>
                            <div className="sb-unstyled" style={{columnWidth: 120, marginTop: 12}}>
                              <Color name="black" className={colorSwatch('black', 'fill')} />
                              <Color name="white" className={colorSwatch('white', 'fill')} />
                              <Color name="accent" className={colorSwatch('accent', 'fill')} />
                              <Color name="neutral" className={colorSwatch('neutral', 'fill')} />
                              <Color name="negative" className={colorSwatch('negative', 'fill')} />
                              <Color name="informative" className={colorSwatch('informative', 'fill')} />
                              <Color name="positive" className={colorSwatch('positive', 'fill')} />
                              <Color name="notice" className={colorSwatch('notice', 'fill')} />
                              <Color name="gray" className={colorSwatch('gray', 'fill')} />
                              <Color name="red" className={colorSwatch('red', 'fill')} />
                              <Color name="orange" className={colorSwatch('orange', 'fill')} />
                              <Color name="yellow" className={colorSwatch('yellow', 'fill')} />
                              <Color name="chartreuse" className={colorSwatch('chartreuse', 'fill')} />
                              <Color name="celery" className={colorSwatch('celery', 'fill')} />
                              <Color name="green" className={colorSwatch('green', 'fill')} />
                              <Color name="seafoam" className={colorSwatch('seafoam', 'fill')} />
                              <Color name="cyan" className={colorSwatch('cyan', 'fill')} />
                              <Color name="blue" className={colorSwatch('blue', 'fill')} />
                              <Color name="indigo" className={colorSwatch('indigo', 'fill')} />
                              <Color name="purple" className={colorSwatch('purple', 'fill')} />
                              <Color name="fuchsia" className={colorSwatch('fuchsia', 'fill')} />
                              <Color name="magenta" className={colorSwatch('magenta', 'fill')} />
                              <Color name="pink" className={colorSwatch('pink', 'fill')} />
                              <Color name="turquoise" className={colorSwatch('turquoise', 'fill')} />
                              <Color name="cinnamon" className={colorSwatch('cinnamon', 'fill')} />
                              <Color name="brown" className={colorSwatch('brown', 'fill')} />
                              <Color name="silver" className={colorSwatch('silver', 'fill')} />
                            </div>
                            <BaseColorsAccordion />
                          </div>
                        );
                      }

                      if (propertyName === 'stroke') {
                        return (
                          <div>
                            <h4 className={style({font: 'ui', fontWeight: 'bold', marginBottom: 8})}>Values</h4>
                            <ul className={style({marginStart: 24, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12, paddingStart: 0})}>
                              <NoneValueListItem />
                              <CurrentColorListItem links={links} />
                            </ul>
                            <div className="sb-unstyled" style={{columnWidth: 120, marginTop: 12}}>
                              <Color name="black" className={colorSwatch('black', 'stroke')} />
                              <Color name="white" className={colorSwatch('white', 'stroke')} />
                            </div>
                            <BaseColorsAccordion />
                          </div>
                        );
                      }

                      return (
                        <div>
                          <h4 className={style({font: 'ui', fontWeight: 'bold', marginBottom: 8})}>Values</h4>
                          {allValuesAreNumbers ? (
                            <div>
                              <code className={codeStyle}>
                                {values.map((value, i) => (
                                  <React.Fragment key={i}>
                                    {i > 0 && Punctuation(' | ')}
                                    <span className={codeStyles.number}>{value}</span>
                                  </React.Fragment>
                                ))}
                              </code>
                              {propDef.description && (
                                <div className={style({marginTop: 8, font: 'body'})}>
                                  {propDef.description}
                                </div>
                              )}
                            </div>
                          ) : (
                            <ul className={style({marginStart: 24, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 12, paddingStart: 0})}>
                              {values.map((value, i) => {
                                let valueDesc = styleMacroValueDesc[value];

                                // special case for 'full' for border radius property
                                if (value === 'full' && propertyName.includes('Radius')) {
                                  valueDesc = {
                                    description: <>Resolves to <code className={codeStyle}>9999px</code> for fully rounded corners.</>
                                  };
                                }

                                // special case handling for font and spacing specific value descriptions so they don't get rendered for
                                // other properties that may include the same values (e.g. heading in Colors)
                                let shouldShowDescription = false;
                                if (value === 'fontSize' && (propertyName === 'fontSize' || propertyName === 'font')) {
                                  shouldShowDescription = true;
                                } else if (['ui', 'heading', 'title', 'body', 'detail', 'code'].includes(value) && (propertyName === 'lineHeight' || propertyName === 'fontWeight')) {
                                  shouldShowDescription = true;
                                } else if (['text-to-control', 'text-to-visual', 'edge-to-text', 'pill'].includes(value)) {
                                  shouldShowDescription = true;
                                } else if (value === 'baseColors' && propertyName !== 'color' && propertyName !== 'backgroundColor') {
                                  shouldShowDescription = true;
                                } else if (['default', 'colors', 'opacity', 'shadow', 'transform', 'all'].includes(value) && propertyName === 'transition') {
                                  // show description for transition-specific values only when rendering transition property so they don't leak
                                  shouldShowDescription = true;
                                } else if (value === 'screen' && (propertyName === 'backgroundBlendMode' || propertyName === 'mixBlendMode')) {
                                  // don't show dimension description for blend mode screen value
                                  shouldShowDescription = false;
                                } else if (value === 'number') {
                                  // only show number description for sizing properties (width, height, etc.)
                                  shouldShowDescription = sizingProperties.includes(propertyName);
                                } else if (valueDesc && !['ui', 'heading', 'title', 'body', 'detail', 'code', 'fontSize', 'default', 'colors', 'opacity', 'shadow', 'transform', 'all'].includes(value)) {
                                  // Show description for all other values that have one
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
                                // make sure only to show "number" description for sizing properties
                                let shouldShowTypeDescription = typeName !== 'number' || sizingProperties.includes(propertyName);
                                return (
                                  <li key={`type-${i}`} className={style({font: 'body'})}>
                                    <code className={codeStyle}>
                                      <span className={codeStyles.variable}>{typeName}</span>
                                    </code>
                                    {shouldShowTypeDescription && typeDesc?.description && (
                                      <div className={style({marginTop: 4})}>
                                        {typeDesc.description}
                                      </div>
                                    )}
                                    {shouldShowTypeDescription && typeDesc?.body && (
                                      <div className={style({marginTop: 8})}>
                                        {typeDesc.body}
                                      </div>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      );
                    })()}
                    {propDef.description && !allValuesAreNumbers && (
                      <div className={style({font: 'body'})}>
                        {propDef.description}
                      </div>
                    )}
                  </div>
                );
              })()}
            </DisclosurePanel>
          </Disclosure>
        );
      })}
    </Accordion>
  );
}
