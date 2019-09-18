## V3 Development

### Adding a new component
We have included a package generator for convenience in getting started with a new component. Run:

`yarn plop`

This will start a series of prompts. You can create a React Spectrum component or a standalone single package (useful for tools). 

If doing a standalone, the scope name should be all lower case. Do NOT include the `@`

If doing a React Spectrum component, and you have an idea of what it will need, you can add all three (aria/spectrum/stately) at once, or you can pick and choose. The generated files may still contain references to the others packages, but we figured it was easier to delete than to add.

- package names should be all lowercase
- component names should be PascalCase
- component css should be the name of the spectrum-css package, if multiple are required, you can add more manually


### Useful patterns

#### Testing for V2/V3 parity
When writing tests for V3 components that are in V2, it's helpful to write tests that run the same set of asserts against both. If you look in the Button component, you can find examples of this. Jest makes it easy with a string pattern before each test that looks like this:
```
it.each`
    Name          | Component        | props
    ${'Button'}   | ${ActionButton}  | ${{onPress: onPressSpy, holdAffordance: true}}
    ${'V2Button'} | ${V2Button}      | ${{variant: 'action', onClick: onPressSpy, holdAffordance: true}}
  `('$Name has hold affordance', function ({Component, props}) {
```
Name is to create a way of differentiating which test ran and is used in the description of the test.

Each column header can be used inside the test or description. To use it in the test, you can destructure in the test arguments. Each row after the headers corresponds to a test run.

We typically use `Component` for each of the renderable components we want to send through the test.

Since v2 and v3 API's have changed, it's best to send in a props object so that the components are as similar as possible. In this example, we can see that v3 uses onPress instead of the v2 onClick.

#### Avoiding cloneElement?
#### ???s
