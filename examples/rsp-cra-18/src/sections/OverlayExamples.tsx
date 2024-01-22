import {Flex, Divider, DialogTrigger, ActionButton, AlertDialog, ContextualHelp, Heading, Content, Text, Dialog, Header, ButtonGroup, Button, Tooltip, TooltipTrigger} from '@adobe/react-spectrum';

export default function OverlayExamples() {
  return (
    <>
      <h2>Overlay</h2>
      <Flex direction="column" gap="size-125">
        <Divider />
        <DialogTrigger>
          <ActionButton width="size-800">Save</ActionButton>
          <AlertDialog
            title="Low Disk Space"
            variant="warning"
            primaryActionLabel="Confirm">
            You are running low on disk space.
            Delete unnecessary files to free up space.
          </AlertDialog>
        </DialogTrigger>
        <ContextualHelp alignSelf="start" variant="info">
          <Heading>Need help?</Heading>
          <Content>
            <Text>
              If you're having issues accessing your account, contact our customer
              support team for help.
            </Text>
          </Content>
        </ContextualHelp>
        <DialogTrigger>
        <ActionButton width="150px">Check connectivity</ActionButton>
        {(close) => (
          <Dialog>
            <Heading>Internet Speed Test</Heading>
            <Header>Connection status: Connected</Header>
            <Divider />
            <Content>
              <Text>
                Start speed test?
              </Text>
            </Content>
            <ButtonGroup>
              <Button variant="secondary" onPress={close}>Cancel</Button>
              <Button variant="accent" onPress={close}>Confirm</Button>
            </ButtonGroup>
          </Dialog>
        )}
        </DialogTrigger>
        <DialogTrigger type="popover">
          <ActionButton width="100px">Disk Status</ActionButton>
          <Dialog>
            <Heading>C://</Heading>
            <Divider />
            <Content>
              <Text>
                50% disk space remaining.
              </Text>
            </Content>
          </Dialog>
        </DialogTrigger>
        <TooltipTrigger>
          <ActionButton aria-label="Edit Name" width="60px">Edit</ActionButton>
          <Tooltip>Change Name</Tooltip>
        </TooltipTrigger>
      </Flex>
    </>
  );
}
