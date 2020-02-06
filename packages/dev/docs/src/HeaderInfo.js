import React from 'react';
import bodyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';
import styles from './docs.css';


export function HeaderInfo(props) {
  let {
    headerData,
    componentNames
  } = props;
  return (
    <table className={styles.detailsTable}>
      <tbody>
        <tr>
          <th className={bodyStyles['spectrum-Body--secondary']}>install</th>
          <td className={bodyStyles['spectrum-Body4']}><pre>yarn install {headerData.name}</pre></td>
        </tr>
        <tr>
          <th className={bodyStyles['spectrum-Body--secondary']}>npm</th>
          <td className={bodyStyles['spectrum-Body4']}><a href="#" title={headerData.name}>{headerData.name}</a></td>
        </tr>
        <tr>
          <th className={bodyStyles['spectrum-Body--secondary']}>version</th>
          <td className={bodyStyles['spectrum-Body4']}>{headerData.version}</td>
        </tr>
        <tr>
          <th className={bodyStyles['spectrum-Body--secondary']}>source</th>
          <td className={bodyStyles['spectrum-Body4']}><a href={`https://github.com/adobe-private/react-spectrum-v3/tree/master/packages/s${encodeURI(headerData.name)}`} title="github">github</a></td>
        </tr>
        <tr>
          <th className={bodyStyles['spectrum-Body--secondary']}>usage</th>
          <td className={bodyStyles['spectrum-Body4']}><pre>{`import {${componentNames.join(',')}} from '${headerData.name}'`}</pre></td>
        </tr>
      </tbody>
    </table>
  );
}
