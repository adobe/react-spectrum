import clsx from 'clsx';
import {getAnchorProps} from './utils';
import {Image} from './Image';
import React from 'react';
import styles from './ExampleCard.css';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';
import {useId} from 'react-aria';

export function ExampleCard(props) {
  let titleId = useId();
  let descriptionId = useId();
  return (
    <a href={props.url} className={styles.exampleCard} {...getAnchorProps(props.url)} aria-labelledby={titleId} aria-describedby={descriptionId} data-hover={styles['is-hovered']}>
      {props.children
        ? React.cloneElement(props.children, {'aria-hidden': true})
        : <Image src={props.preview} alt="" className={null} style={props.cover ? {objectFit: 'cover'} : undefined} />
      }
      <div id={titleId} className={clsx(typographyStyles['spectrum-Body3'], styles.cardTitle)}>{props.title}</div>
      <div id={descriptionId} className={clsx(typographyStyles['spectrum-Body4'], styles.cardDescription)}>{props.description}</div>
    </a>
  );
}
