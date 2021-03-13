# Unified Extensibility Platform


## Setup Notes

The package.json explicitly uses react(-dom) 16.13.1 for the following reasons:
1. That is the exact version the root react-spectrum/node_modules has installed.
2. This means the root `yarn install` does NOT install a local `react`.
3. This prevents `invalid hook` errors from occuring at runtime.
4. If we leave out the `dependencies: { react }` entry or move it to peerDependencies then parcel HMR does not work on linked react components.