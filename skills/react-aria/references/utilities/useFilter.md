# use

Filter

Provides localized string search functionality that is useful for filtering or matching items
in a list. Options can be provided to adjust the sensitivity to case, diacritics, and other parameters.

## Introduction

`useFilter` provides functions for filtering or searching based on substring matches. The builtin JavaScript
string methods `startsWith`, `endsWith`, and `includes` could be used for this, but do not implement locale
sensitive matching. `useFilter` provides options to allow ignoring case, diacritics, and Unicode normalization forms,
which are implemented according to locale-specific rules. It automatically uses the current locale set by the application,
either via the default browser language or via the [I18nProvider](I18nProvider.md).

## Example

The following example implements a filterable list using a `contains` matching strategy that ignores both case
and diacritics.

```tsx
'use client';
import React from 'react';
import {useFilter} from 'react-aria';

function Example() {
  const composers = [
    'Wolfgang Amadeus Mozart',
    'Johann Sebastian Bach',
    'Ludwig van Beethoven',
    'Claude Debussy',
    'George Frideric Handel',
    'Frédéric Chopin',
    'Johannes Brahms',
    'Pyotr Ilyich Tchaikovsky',
    'Antonín Dvořák',
    'Felix Mendelssohn',
    'Béla Bartók',
    'Niccolò Paganini'
  ];

  let {contains} = useFilter({
    sensitivity: 'base'
  });

  let [value, setValue] = React.useState('');
  let matchedComposers = composers.filter(composer => contains(composer, value));

  return (
    <>
      <label htmlFor="search-input">Filter: </label>
      <input type="search" id="search-input" value={value} onChange={e => setValue(e.target.value)} />
      <ul style={{height: 300}}>
        {matchedComposers.map((composer, i) =>
          <li key={i}>{composer}</li>)
        }
      </ul>
    </>
  );
}
```

## A

PI

<FunctionAPI
  function={docs.exports.useFilter}
  links={docs.links}
/>

### Filter
