import {AriaLabelingProps, DOMProps} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {SVGAttributes} from 'react';

export interface IllustrationProps extends DOMProps, AriaLabelingProps {}

export function getIllustrationProps(props: IllustrationProps): SVGAttributes<SVGElement> {
  let hasLabel = props['aria-label'] || props['aria-labelledby'];
  return {
    ...filterDOMProps(props, {labelable: true}),
    role: hasLabel ? 'img' : undefined,
    'aria-hidden': hasLabel ? undefined : true
  };
}
