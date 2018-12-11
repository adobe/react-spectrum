import React from 'react';
import Heading from '@react/react-spectrum/Heading';
import {Table, TR, TD, TH, THead, TBody} from '@react/react-spectrum/Table';
import Checkmark from '@react/react-spectrum/Icon/Checkmark';
import {formatMethod} from './utils';

export default function ClassAPI({node}) {
  let methods = node.members.instance.filter(member => !member.tags || !member.tags.some(tag => tag.title === 'type'));
  let properties = node.members.instance.filter(member => member.tags && member.tags.some(tag => tag.title === 'type'));
  let tag;

  return (
    <section>
      {node.description &&
        <div dangerouslySetInnerHTML={{__html: node.description.childMarkdownRemark.html}} />
      }

      {properties.length ?
        <section>
          <Heading size={2}>Properties</Heading>
          <Table quiet>
            <THead>
              <TH>Property</TH>
              <TH>Description</TH>
              <TH>Default</TH>
            </THead>
            <TBody>
              {properties.map(property =>
                <TR key={property.name}>
                  <TD><code>{property.name}</code></TD>
                  <TD><div dangerouslySetInnerHTML={{__html: property.description && property.description.childMarkdownRemark.html.slice(3, -4)}} /></TD>
                  <TD>{(property.tags && (tag = property.tags.find(tag => tag.title === 'default')) && tag.description) || ''}</TD>
                </TR>
              )}
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
              <TH>Abstract</TH>
              <TH>Description</TH>
            </THead>
            <TBody>
              {methods.map(method =>
                <TR key={method.name}>
                  <TD><code>{formatMethod(method)}</code></TD>
                  <TD>{method.abstract ? <Checkmark size="S" /> : null}</TD>
                  <TD><div dangerouslySetInnerHTML={{__html: method.description && method.description.childMarkdownRemark.html.slice(3, -4)}} /></TD>
                </TR>
              )}
            </TBody>
          </Table>
        </section>
      : null}
    </section>
  );
}
