import {DOMProps, FlexStyleProps} from '@react-types/shared';
import {ReactElement} from 'react';

export interface FlexProps extends DOMProps, FlexStyleProps {
  children?: ReactElement | ReactElement[]
}
