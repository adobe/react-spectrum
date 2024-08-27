import { any } from "prop-types";
import { useState } from "react";
import {
  Group,
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
  label?: string;
}

export function StarRatingGroup({
  ratingCount = 5,
  isEmphasized = false,
  label = "Rating",
  ...other
}: StarRatingGroupProps) {
  let allRatings = Array.from(Array(ratingCount).keys()).map((i) =>
    String(i + 1)
  );

  // Track which rating is hovered at the group level.
  let [hoveredRating, setHoveredRating] =
    useState<string | undefined>(undefined);

  let onPointerOver = (e: any) => {
    if (e.target.dataset?.rating) {
      setHoveredRating(e.target.dataset.rating);
    }
  };

  let onPointerOut = () => {
    setHoveredRating(undefined);
  };

  return (
    <RadioGroup
      orientation="horizontal"
      className="flex flex-col m-auto space-y-10 text-center"
      {...other}
    >
      {({ state }) => (
        <>
          <Label className="text-xl font-semibold mb-200">{label}</Label>
          <Group
            data-name="star-rating-group"
            className="focus-visible:ring group"
          >
            <div
              data-name="star-rating-group"
              className="flex justify-evenly gap-75"
              onPointerOver={onPointerOver}
              onPointerLeave={onPointerOut}
            >
              {allRatings.map((rating) => (
                <StarRating
                  key={rating}
                  rating={rating}
                  selected={state.selectedValue}
                  isEmphasized={isEmphasized}
                  hoveredRating={hoveredRating}
                />
              ))}
            </div>
          </Group>
        </>
      )}
    </RadioGroup>
  );
}

export function StarRating({
  rating,
  selected,
  isEmphasized,
  hoveredRating,
}: {
  rating: string;
  selected: string | null;
  isEmphasized?: boolean;
  hoveredRating: string | undefined;
}) {
  let ratingNum = Number(rating);
  let selectedNum = Number(selected);
  let isFilled =
    hoveredRating !== undefined
      ? ratingNum <= Number(hoveredRating)
      : ratingNum <= selectedNum;
  let fillColor = isEmphasized ? "fill-accent-800" : "fill-gray-700";
  let bgColor = isEmphasized ? "bg-accent-800" : "bg-gray-700";

  return (
    <Radio aria-label={`${rating} stars`} value={rating}>
      {({ isHovered, isSelected }) => (
        <>
          <svg
            data-rating={rating}
            className={isFilled ? fillColor : "dark:fill-white"}
            xmlns="http://www.w3.org/2000/svg"
            width={18}
            height={18}
          >
            {isFilled ? (
              <path d="m9.241.3 2.161 5.715 6.106.289a.255.255 0 0 1 .147.454l-4.77 3.823 1.612 5.9a.255.255 0 0 1-.386.28L9.002 13.4l-5.11 3.358a.255.255 0 0 1-.386-.28l1.612-5.9-4.77-3.821A.255.255 0 0 1 .495 6.3l6.107-.285L8.763.3a.255.255 0 0 1 .478 0Z" />
            ) : (
              <path d="m9.031 2.541 1.777 4.753 5.11.241-3.987 3.2 1.336 4.913-4.266-2.782-4.282 2.808 1.352-4.937-3.987-3.2 5.1-.245ZM9.042.412a.369.369 0 0 0-.349.239L6.486 6.326l-6.1.293a.375.375 0 0 0-.217.667l4.762 3.821L3.318 17a.376.376 0 0 0 .362.475.371.371 0 0 0 .2-.063l5.121-3.351 5.095 3.324a.371.371 0 0 0 .2.062.376.376 0 0 0 .363-.475l-1.595-5.866 4.767-3.826a.375.375 0 0 0-.217-.667l-6.1-.287L9.393.655a.369.369 0 0 0-.351-.243Z" />
            )}
          </svg>
          {isHovered && isSelected && (
            <span
              aria-hidden="true"
              className={`flex w-full h-25 -mb-25 ${bgColor}`}
            />
          )}
        </>
      )}
    </Radio>
  );
}
