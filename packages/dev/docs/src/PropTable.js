import React from 'react';
import tableStyles from '@adobe/spectrum-css-temp/components/table/vars.css';

export function PropTable({component, links}) {
  return (
    <table className={`${tableStyles['spectrum-Table']} ${tableStyles['spectrum-Table--quiet']}`}>
      <thead>
        <tr>
          <td className={tableStyles['spectrum-Table-headCell']}>Name</td>
          <td className={tableStyles['spectrum-Table-headCell']}>Type</td>
          <td className={tableStyles['spectrum-Table-headCell']}>Default</td>
          <td className={tableStyles['spectrum-Table-headCell']}>Required</td>
          <td className={tableStyles['spectrum-Table-headCell']}>Description</td>
        </tr>
      </thead>
      <tbody className={tableStyles['spectrum-Table-body']}>
        {Object.keys(component.props.properties).reverse().map((propName, index) => {
          let type = component.props.properties[propName].value.type.toString();
          if (type === 'link') {
            type = links[component.props.properties[propName].value.id].name;
          }
          return (
            <tr key={index} className={tableStyles['spectrum-Table-row']}>
              <td className={tableStyles['spectrum-Table-cell']}>{propName}</td>
              <td className={tableStyles['spectrum-Table-cell']}>{type}</td>
              <td className={tableStyles['spectrum-Table-cell']}>{component.props.properties[propName].default || '-'}</td>
              <td className={tableStyles['spectrum-Table-cell']}>{!component.props.properties[propName].optional ? 'true' : null}</td>
              <td className={tableStyles['spectrum-Table-cell']}>{component.props.properties[propName].description}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
