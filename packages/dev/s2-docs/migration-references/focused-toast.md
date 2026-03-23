# Toast migration

## Import changes

- Move `ToastContainer` and `ToastQueue` imports from `@react-spectrum/toast` to `@react-spectrum/s2`.
- Keep a shared `ToastContainer` mounted near the app root or test harness, then update all queue calls to use the S2 import path.

## Queue methods

- S2 supports `ToastQueue.neutral`, `positive`, `negative`, and `info`.
- Re-check options such as `timeout`, `actionLabel`, `onAction`, `shouldCloseOnAction`, and `onClose` after the import move.
- The queue methods still return a close function. Keep programmatic dismissal logic when the existing UX depends on it.

## Common post-codemod blind spots

- Search for every `ToastContainer` mount and every `ToastQueue` usage after moving imports. Shared app roots, secondary entrypoints, and test harnesses are easy to miss.

## Tests and mocks

- Update every toast mock to point at `@react-spectrum/s2`.
- If a test mounted `ToastContainer` from the old package, swap it to the S2 import as part of the same change.
- Re-run the affected tests after the import move. Toast helpers are often mocked in many files and are easy to miss.
