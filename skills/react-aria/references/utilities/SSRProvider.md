# S

SRProvider

When using SSR with React Aria in React 16 or 17, applications must be wrapped in an SSRProvider.
This ensures that auto generated ids are consistent between the client and server.

<InlineAlert variant="notice">
  <Heading>React 16 or 17 only</Heading>
  <Content>If you're using React 18 or newer, `SSRProvider` is not necessary and can be removed from your app. React Aria uses the [React.useId](https://react.dev/reference/react/useId) hook internally when using React 18, which ensures ids are consistent.</Content>
</InlineAlert>

```tsx
import {SSRProvider} from '@react-aria/ssr';

<SSRProvider>
  <YourApp />
</SSRProvider>
```

## Introduction

If you're using React 16 or 17, `SSRProvider` should be used as a wrapper for the entire application during server side rendering.
It works together with the [useId](useId.md) hook to ensure that auto generated ids are consistent
between the client and server by resetting the id internal counter on each request.

## A

PI

### S

SRProvider

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | — | Your application here. |
