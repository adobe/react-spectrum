import React from 'react';
import Heading from '@react/react-spectrum/Heading';
import {Table, TR, TD, TH, THead, TBody} from '@react/react-spectrum/Table';
import {formatMethod, formatType} from './utils';

export default function ComponentAPI({component}) {
  const methods = component.methods.filter(m => m.description && !m.docblock.includes('@private'));

  return (
    <section>
      {component.description &&
        <div dangerouslySetInnerHTML={{__html: component.description.childMarkdownRemark.html}} />
      }

      {component.props.length ?
        <section>
          <Heading size={2}>Props</Heading>
          <Table quiet>
            <THead>
              <TH>Prop</TH>
              <TH>Type</TH>
              <TH>Required</TH>
              <TH>Default</TH>
              <TH>Description</TH>
            </THead>
            <TBody>
              {component.props.map(prop => (
                <TR key={prop.name}>
                  <TD><code>{prop.name}</code></TD>
                  <TD className="type-column"><code>{formatType(prop.type)}</code></TD>
                  <TD>{prop.required ? 'Yes' : 'No'}</TD>
                  <TD><code>{prop.defaultValue && prop.defaultValue.value}</code></TD>
                  <TD><div dangerouslySetInnerHTML={{__html: prop.description && prop.description.childMarkdownRemark.html.slice(3, -4)}} /></TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </section>
      : null}

      {methods.length ?
        <section>
          <Heading size={2}>Methods</Heading>
          <Table quiet>
            <THead>
              <TH>Method</TH>
              <TH>Description</TH>
            </THead>
            <TBody>
              {methods.map(method =>
                <TR key={method.name}>
                  <TD><code>{formatMethod(method)}</code></TD>
                  <TD>{method.description}</TD>
                </TR>
              )}
            </TBody>
          </Table>
        </section>
      : null}
    </section>
  );
}
