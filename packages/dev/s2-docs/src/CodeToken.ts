import {ReactElement} from 'react';

export enum TokenType {
  keyword = 0,
  string = 1,
  number = 2,
  property = 3,
  attribute = property,
  function = 4,
  tag = TokenType.function,
  constructor = tag,
  comment = 5,
  variable = 6,
  import = 7
}

export type Token = TokenType | string | ReactElement;
