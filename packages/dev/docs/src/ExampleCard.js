import clsx from 'clsx';
import {Image} from './Image';
import React from 'react';
import styles from './ExampleCard.css';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

export function ExampleCard(props) {
  return (
    <a href={props.url} rel="noreferrer" target="_blank" className={clsx(typographyStyles['spectrum-Body3'], styles.exampleCard)}>
      <Image src={props.preview} alt={props.title} className={null} />
      <div className={styles.cardTitle}>{props.title}</div>
      <div className={clsx(typographyStyles['spectrum-Body4'], styles.cardDescription)}>{props.description}</div>
    </a>
  );
}
