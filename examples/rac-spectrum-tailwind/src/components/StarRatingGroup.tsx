import StarOutline from "@spectrum-icons/workflow/StarOutline";
import Star from "@spectrum-icons/workflow/StarOutline";
import {
  Label,
  Radio,
  RadioGroup,
  RadioGroupProps,
} from "react-aria-components";

interface StarRatingGroupProps extends Omit<RadioGroupProps, "children"> {
  ratingCount?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  isEmphasized?: boolean;
}

export function StarRatingGroup({
  ratingCount = 5,
  isEmphasized = false,
  ...other
}: StarRatingGroupProps) {
  let allRatings = Array.from(Array(ratingCount).keys()).map((i) => String(i));
  return (
    <RadioGroup
      orientation="horizontal"
      className="flex flex-col m-auto space-y-10 text-center"
      {...other}
    >
      {({ state }) => (
        <>
          <Label className="text-xl font-semibold">Star Rating</Label>
          <div className="flex justify-evenly p-50">
            {allRatings.map((rating) => (
              <StarRating
                key={rating}
                rating={rating}
                selected={state.selectedValue}
                isEmphasized={isEmphasized}
              />
            ))}
          </div>
        </>
      )}
    </RadioGroup>
  );
}

export function StarRating({
  rating,
  selected,
  isEmphasized,
}: {
  rating: string;
  selected: string | null;
  isEmphasized?: boolean;
}) {
  let ratingNum = Number(rating);
  let selectedNum = Number(selected);
  let isFilled = ratingNum <= selectedNum;

  return (
    <Radio value={rating}>
      <svg
        className={isFilled && isEmphasized ? "fill-accent-800" : ""}
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
      >
        {isFilled ? (
          <path d="m9.241.3 2.161 5.715 6.106.289a.255.255 0 0 1 .147.454l-4.77 3.823 1.612 5.9a.255.255 0 0 1-.386.28L9.002 13.4l-5.11 3.358a.255.255 0 0 1-.386-.28l1.612-5.9-4.77-3.821A.255.255 0 0 1 .495 6.3l6.107-.285L8.763.3a.255.255 0 0 1 .478 0Z" />
        ) : (
          <path d="m9.031 2.541 1.777 4.753 5.11.241-3.987 3.2 1.336 4.913-4.266-2.782-4.282 2.808 1.352-4.937-3.987-3.2 5.1-.245ZM9.042.412a.369.369 0 0 0-.349.239L6.486 6.326l-6.1.293a.375.375 0 0 0-.217.667l4.762 3.821L3.318 17a.376.376 0 0 0 .362.475.371.371 0 0 0 .2-.063l5.121-3.351 5.095 3.324a.371.371 0 0 0 .2.062.376.376 0 0 0 .363-.475l-1.595-5.866 4.767-3.826a.375.375 0 0 0-.217-.667l-6.1-.287L9.393.655a.369.369 0 0 0-.351-.243Z" />
        )}
      </svg>
    </Radio>
  );
}
