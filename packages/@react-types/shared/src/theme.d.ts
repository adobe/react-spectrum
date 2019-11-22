export interface CSSModule {
  [className: string]: string
}

export interface Theme {
  global?: CSSModule,
  light?: CSSModule,
  dark?: CSSModule,
  medium?: CSSModule,
  large?: CSSModule
}
