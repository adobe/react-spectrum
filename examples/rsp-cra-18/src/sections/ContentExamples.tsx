import {Flex, Divider, Avatar, Content, Footer, Header, Heading, IllustratedMessage, Image, Keyboard, Text, View, TextField, Well} from '@adobe/react-spectrum';
import NotFound from '@spectrum-icons/illustrations/NotFound';

export default function ContentExamples() {
  return (
    <>
      <h2>Content</h2>
      <Flex direction="column" gap="size-125">
        <Divider />
        <Avatar src="https://i.imgur.com/kJOwAdv.png" alt="default Adobe avatar" />
        <Content>Content is king</Content>
        <Text>Content above</Text>
        <Divider />
        <Text>Content below</Text>
        <Footer>&copy; All rights reserved.</Footer>
        <Header>Cute cats</Header>
        <Heading level={4}>Edit</Heading>
        <IllustratedMessage width="500px">
          <NotFound />
          <Heading>No results</Heading>
          <Content>Try another search</Content>
        </IllustratedMessage>
        <Image src="https://i.imgur.com/Z7AzH2c.png" alt="Sky and roof" width="500px" height="250"/>
        <Keyboard>⌘V</Keyboard>
        <Text>Paste</Text>
        <View
          width="500px"
          borderWidth="thin"
          borderColor="dark"
          borderRadius="medium"
          padding="size-250">
          <TextField label="Name" />
        </View>
        <Well width="500px">
          Better a little which is well done, than a great deal imperfectly.
        </Well>
      </Flex>
    </>
  )
}
