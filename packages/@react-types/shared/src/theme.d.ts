export interface CSSModule {
  [className: string]: string
}

export interface Theme {
  light?: CSSModule,
  dark?: CSSModule,
  medium?: CSSModule,
  large?: CSSModule
}
