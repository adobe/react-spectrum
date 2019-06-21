// https://github.com/Microsoft/TypeScript/issues/2709 hopefully move more centrally later
declare module '*.css' {
  const content: any;
  export default content;
}
