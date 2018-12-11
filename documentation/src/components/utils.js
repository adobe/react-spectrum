import React from 'react';

const indentDefault = '10px';

function renderShape(value, indent) {
  const startObject = 'shape: {';
  const endObject = '}';
  if(value.value) {
    return (
      <div style={{paddingLeft: indent}}>
        <div>{startObject}</div>
        <div style={{paddingLeft: indent}}>
          {Object.keys(value.value).map(key => {
            return (
              <div key={key}>
                {key}: {formatType(value.value[key], indentDefault)}
              </div>
            );
          })}
        </div>
        <div>{endObject}</div>
      </div>
    );
  }
  return (
    <div style={{paddingLeft: indent}}>
      <div>{startObject}{endObject}</div>
    </div>
  );
}

function renderArrayOf(value, indent) {
  if(value.value) {
    return (
      <div style={{paddingLeft: indent}}>
        <div>arrayOf: [</div>
        {formatType(value.value, indentDefault)}
        <div>]</div>
      </div>
    );
  }
  return <div style={{paddingLeft: indent}}>{value.name}</div>;
}

function renderOneOf(value, indent) {
  return (
    <div style={{paddingLeft: indent}}>
      <div>oneOf: [</div>
      {value.value.map(v => <div key={v.name}>{formatType(v, indentDefault)}</div>)}
      <div>]</div>
    </div>
  );
}

export function formatType(type, indent='0px') {
  if (!type) return '';
  if (type.name === 'arrayOf') {
    return renderArrayOf(type, indent);
  }
  if (type.name === 'shape') {
    return renderShape(type, indent);
  }

  if (type.name === 'union') {
    if(Array.isArray(type.value)) {
      return renderOneOf(type, indent);
    }
    return <div style={{paddingLeft: indent}}>{type.value}</div>;
  }
  if (type.name === 'enum') {
    return type.value.map(v => v.value || v.name).join(' | ');
  }
  if (type.name === 'instanceOf') {
    return <div style={{paddingLeft: indent}}>{`instanceOf: ${type.value}`}</div>;
  }

  return <div style={{paddingLeft: indent}}>{type.name}</div>;
}

export function formatMethod(method) {
  let res = [...(method.modifiers || []), `${method.name}(${method.params.map(formatParam).join(', ')})`].join(' ');
  if (method.returns && method.returns[0] && method.returns[0].type.name) {
    res += ': ' + method.returns[0].type.name;
  }

  return res;
}

function formatParam(param) {
  let p = param.name;
  if (param.type && param.type.name) {
    p += ': ' + param.type.name;
  }

  if (param.default) {
    p += ' = ' + param.default;
  }

  return p;
}
