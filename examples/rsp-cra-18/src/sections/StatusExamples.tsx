import {Flex, Divider, Badge, InlineAlert, Heading, Content, LabeledValue, Meter, ProgressBar, ProgressCircle, StatusLight, Button} from '@adobe/react-spectrum';
import {ToastContainer, ToastQueue} from '@react-spectrum/toast'

export default function StatusExamples() {
  return (
    <>
      <h2>Status</h2>
      <Flex direction="column" gap="size-125">
        <Divider />
        <Badge variant="positive">Licensed</Badge>
        <InlineAlert width="700px">
          <Heading>Payment Information</Heading>
          <Content>Enter your billing address, shipping address, and payment method to complete your purchase.</Content>
        </InlineAlert>
        <LabeledValue label="File name" value="Budget.xls" />
        <Meter label="Storage space" variant="positive" value={35} />
        <ProgressBar label="Loading…" value={50} />
        <ProgressBar label="Loading…" isIndeterminate />
        <ProgressCircle aria-label="Loading…" value={50} />
        <ProgressCircle aria-label="Loading…" isIndeterminate />
        <StatusLight variant="positive">Ready</StatusLight>
        <ToastContainer />
        <Button
          width="110px"
          onPress={() => ToastQueue.positive('Toast is done!')}
          variant="primary">
          Show toast
        </Button>
      </Flex>
    </>
  );
}
