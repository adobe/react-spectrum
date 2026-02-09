
export interface MyToastContent {
  title: string;
  description?: string;
  timeout?: number
}

// only added so we can have a component/type for the props we want to send to the actual toast example
export function MyToast(props: MyToastContent) {
  return <div />;
}
