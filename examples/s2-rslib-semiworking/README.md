# s2-rslib-semiworking

This is an example of Rslib with unplugin-parcel-macros, that seems to work ok - but this is a false positive and there are still issues.

## Reproduction steps

1. `yarn install`
2. `yarn build`
3. Observe it (probably) built fine

But note that ../s2-rslib-notworking _does not_ build. This is because it uses more complex, and more S2 macros, and therefore runs into a nasty race condition.
