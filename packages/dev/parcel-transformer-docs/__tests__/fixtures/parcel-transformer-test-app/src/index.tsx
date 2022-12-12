import React from 'react';

export let n: number = 4;

let name = 'foo';
export let s = name;

function foo() {
  return 'foo';
}
export let f = foo();

export function App(props) {
  return <div />;
}

function App2(props) {
  return <div />;
}
export {App2 as App2Real};
