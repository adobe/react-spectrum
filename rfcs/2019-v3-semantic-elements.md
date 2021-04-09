<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 2019-10-31
- RFC PR: (leave this empty, to be filled in later)
- Authors: Rob Snow, Devon Govett

# React Spectrum v3 Semantic Elements

## Summary

Common elements should be useable everywhere and should have the right styles on them for where they are used.

## Motivation

There are many components that have headers/titles, descriptions, avatars, common types of components.
These pieces can have vastly different styles based on where they are used.

Some approaches that have been tried.

  - Specialized components for each type of container
    - Dialog with DialogHeader, DialogFooter...
    - Card with CardHeader, CardFooter...
    - becomes many variation components that do the same thing but apply different styles
  - Use CSS pattern matching
    - doesn't work well with css modules
    - if element selectors are used instead of classes, it's hard to predict usage
  - Styled components
    - doesn't work well with spectrum css

## Proposal

Create elements that represent real DOM nodes that are used in content.
Heading to represent `<h1>`..., Section for `<section>`, Avatar for a type of `<img>`, Preview for a different type of `<img>`.
These components all support reading from the context object where they will pick up the className they should apply.

We can consider Semantic Elements to be a subset of [Slots]('./2019-v3-slots.md') because there may be many elements that are semantically descriptions. Slots gives us that flexibility. Semantic elements have a default slot that is their name.

Consider these examples

Card
```jsx
<Card>
  <CardHeader />
  <CardDescription />
  <CardFooter />
</Card>
```

Dialog
```jsx
<Dialog>
  <DialogHeader />
  <DialogDescription />
  <DialogFooter />
</Dialog>
```

This is the kind of component pattern we have used before. Instead, let's reuse our components and have something more like this:

Card
```jsx
<Card>
  <Header />
  <Description />
  <Footer />
</Card>
```

Dialog
```jsx
<Dialog>
  <Header />
  <Description />
  <Footer />
</Dialog>
```

We also want to enable arbitrary DOM structure and still maintain the right styles on semantic elements.
In this example, Card would provide the classes on the context and even if they are nested, the class will still get applied.

```jsx
<Card>
  <div>
    <Header>Title</Header>
    <Button>X</Button>
  </div>
  <Description>Description goes here</Description>
</Card>
```


## Design Example

Design should be able to give us two component designs that have clearly semantically similar children.
In this case both have a very clear headings, bodies, and buttons.
The headings have different font sizes, but the rest are the same.

![Image of Dialog](images/semantic-elements/Dialog.png)
![Image of Card](images/semantic-elements/Card.png)


## CSS Example

For the CSS, we might get something like this.
```css
/* @adobe/spectrum-css/components/card/vars.css */
.spectrum-Card {
  border: 1px solid lightgrey;
  border-radius: 4px;
  background: white;
}

.spectrum-Card-title {
    font-size: 14px;
}
-------------------------------------
/* @adobe/spectrum-css/components/dialog/vars.css */
.spectrum-Dialog {
  border: 1px solid lightgrey;
  border-radius: 4px;
  background: white;
}

.spectrum-Dialog-title {
    font-size: 18px;
}
```
There would be some limitations, we'd have to accept the general form of descendent, we might not be able to guarantee direct child or any other DOM structure pattern matching.

```jsx
import styles from '@adobe/spectrum-css/components/card/vars.css';
export const Card = (props) => {

  return (
    <div className={classNames(styles, 'spectrum-Card')}>
      <SlotContext.Provider
        value={{
          title: classNames(styles, 'spectrum-Card-title')
        }}>
        {props.children}
      </SlotContext.Provider>
    </div>
  );
};
```

## React Example

This might be roughly how we'd implement a Semantic Element, the idea being that they look on some context object for the appropriate className to apply.
We could have Semantic Elements clear out the context after they've consumed it, this could help prevent accidental trickle down, but wouldn't guarantee it, so it may not be a good idea.

```jsx
export const Heading = (props) => {
  let { heading } = useSlotProvider();

  return (
    <h1 className={classNames(styles, heading, props.className)}>
      <SlotContext.Provider
        value={{
          avatar: null,
          heading: null,
          text: null,
          section: null,
          spacer: null,
          item: null
        }}>
        {props.children}
      </SlotContext.Provider>
    </h1>
  );
};
```

Components expecting to have Semantic Elements as children might then look something like this.
They reference their own CSS Module and supply key value pairs where the key is the name of the semantic element that the value or className should be applied to.
Not shown, they'd probably want to allow an override for this.

```jsx
export const Card = (props) => {

  return (
    <div className={classNames(styles, 'spectrum-Card')}>
      <SlotContext.Provider
        value={{
          heading: classNames(styles, 'heading'),
          description: classNames(styles, 'description')
        }}>
        {props.children}
      </SlotContext.Provider>
    </div>
  );
};
```



## What will this take

 - Buy in from Spectrum CSS
 - Buy in from Design
