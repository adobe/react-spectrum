import React from 'react';
import bodyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';
import styles from './docs.css';
import {ResourceCard} from './ResourceCard';
import Lowlight from 'react-lowlight';
import js from 'highlight.js/lib/languages/javascript';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';
import linkStyles from '@adobe/spectrum-css-temp/components/link/vars.css';

Lowlight.registerLanguage('js', js);

export function HeaderInfo(props) {
  let {
    packageData,
    componentNames,
    sourceData
  } = props;

  return (
    <>
      <table className={styles.detailsTable}>
        <tbody>
          <tr>
            <th className={bodyStyles['spectrum-Body--secondary']}>install</th>
            <td className={bodyStyles['spectrum-Body4']}><code className={typographyStyles['spectrum-Code4']}>yarn add {packageData.name}</code></td>
          </tr>
          <tr>
            <th className={bodyStyles['spectrum-Body--secondary']}>version</th>
            <td className={bodyStyles['spectrum-Body4']}>{packageData.version}</td>
          </tr>
          <tr>
            <th className={bodyStyles['spectrum-Body--secondary']}>usage</th>
            <td className={bodyStyles['spectrum-Body4']}>
              <Lowlight language="js" value={`import {${componentNames.join(',')}} from '${packageData.name}'`} inline className={typographyStyles['spectrum-Code4']} />
            </td>
          </tr>
        </tbody>
      </table>
      <div className={styles['resourceCardGroup']}>
        {sourceData.map((source) => (
          <ResourceCard type={source.type} url={source.url} />
        ))}
        <ResourceCard type="GitHub" url={`https://github.com/adobe-private/react-spectrum-v3/tree/master/packages/${encodeURI(packageData.name)}`} />
        <ResourceCard type="NPM" url={`https://www.npmjs.com/package/${encodeURI(packageData.name)}`} />
      </div>
    </>
  );
}
