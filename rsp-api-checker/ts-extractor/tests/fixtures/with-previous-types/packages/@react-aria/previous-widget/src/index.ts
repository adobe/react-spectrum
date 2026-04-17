// Current source — includes the newly added prop `isFresh`.
// This represents a package where the developer added a prop to the
// source .ts file but has not re-run `yarn build` to regenerate the
// `.d.ts` in dist/types/. The extractor must still observe `isFresh`
// when reading the local workspace; otherwise added props silently
// disappear from the diff.
export interface WidgetProps {
  /** Accessible label. */
  label: string;
  /** Whether the widget is disabled. */
  isDisabled?: boolean;
  /** Newly added prop — exists in src/ but not in the previous dist/types/ build. */
  isFresh?: boolean;
}

export declare function useWidget(props: WidgetProps): void;
