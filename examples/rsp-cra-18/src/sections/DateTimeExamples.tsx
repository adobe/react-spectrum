import {Calendar, Flex, Divider, DateField, DatePicker, DateRangePicker, RangeCalendar, TimeField} from '@adobe/react-spectrum';

export default function DateTimeExamples() {
  return (
    <>
      <h2>Date and Time</h2>
      <Flex direction="column" gap="size-125">
        <Divider />
        <Calendar aria-label="Event date" />
        <DateField label="Event date" width="size-0"/>
        <DatePicker label="Event date" width="size-0" />
        <DateRangePicker label="Date range" width="300px"/>
        <RangeCalendar aria-label="Trip dates" />
        <TimeField label="Event time" width="size-0"/>
      </Flex>
    </>   
  );
}
