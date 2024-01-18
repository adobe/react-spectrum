import type { MetaFunction } from "@remix-run/node";
import {DatePicker} from '@adobe/react-spectrum';

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Welcome to Remix</h1>
      <DatePicker label="Date" />
    </div>
  );
}
