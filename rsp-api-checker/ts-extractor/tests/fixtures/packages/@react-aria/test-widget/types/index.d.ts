/** Props for the test widget. */
export interface WidgetProps {
  /** Accessible label. */
  label: string;
  /** Whether the widget is disabled. */
  isDisabled?: boolean;
}

/** Visual variants for the widget. */
export type WidgetVariant = 'primary' | 'secondary';

/** A simple hook. */
export declare function useWidget(props: WidgetProps): void;
