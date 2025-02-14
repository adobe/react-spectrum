import {
  Label,
  Radio,
  RadioGroup,
  RadioGroupProps,
} from "react-aria-components";

interface SentimentRatingGroupProps extends Omit<RadioGroupProps, "children"> {
  ratings?: string[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export function SentimentRatingGroup({
  ratings = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ...other
}: SentimentRatingGroupProps) {
  return (
    <RadioGroup
      orientation="horizontal"
      className="flex flex-col m-auto space-y-10 text-center"
      {...other}
    >
      <Label className="text-xl font-semibold mb-200">Sentiment Rating</Label>
      <div className="flex justify-between">
        <span>Least Likely</span>
        <span>Most Likely</span>
      </div>
      <div className="flex justify-evenly">
        {ratings.map((rating) => (
          <SentimentRating key={rating} rating={rating} />
        ))}
      </div>
    </RadioGroup>
  );
}

export function SentimentRating({ rating }: { rating: string }) {
  return (
    <Radio
      value={rating}
      className="flex items-center justify-center bg-white border rounded-full disabled:bg-gray-200 disabled:text-gray-400 p-160 m-75 h-200 w-200 focus:outline-hidden focus-visible:ring dark:bg-black selected:bg-accent-800 dark:selected:bg-accent-800 selected:border-accent-800 selected:text-white pressed:bg-gray-200 dark:pressed:bg-gray-200 hover:border-gray-300"
    >
      {rating}
    </Radio>
  );
}
