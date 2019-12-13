# Divider

```typescript
interface Divider {
  size?: 'S' | 'M' | 'L', // Default L
  orientation?: 'horizontal' | 'vertical' // Default horizontal
}
```

| **v2**             | **v3**        | Notes |
| ------------------ | ------------- | ----- |
| `<Rule>`           | `<Divider>`   |       |
| -                  | `orientation` | added |
| `variant="small"`  | `size="S"`    |       |
| `variant="medium"` | `size="M"`    |       |
| `variant="large"`  | `size="L"`    |       |
