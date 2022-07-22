import clsx from 'clsx';
import {getAnchorProps} from './utils';
import {Image} from './Image';
import React from 'react';
import styles from './ExampleCard.css';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

export function ExampleCard(props) {
  return (
    <a href={props.url} className={styles.exampleCard} {...getAnchorProps(props.url)}>
      {props.children || <Image src={props.preview} alt={props.title} className={null} />}
      <div className={clsx(typographyStyles['spectrum-Body3'], styles.cardTitle)}>{props.title}</div>
      <div className={clsx(typographyStyles['spectrum-Body4'], styles.cardDescription)}>{props.description}</div>
    </a>
  );
}
