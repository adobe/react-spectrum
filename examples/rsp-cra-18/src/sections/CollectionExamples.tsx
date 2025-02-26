import {
  ActionMenu,
  Flex,
  Divider,
  Item,
  ListBox,
  ListView,
  MenuTrigger,
  Menu,
  SubmenuTrigger,
  ActionButton,
  TableBody,
  TableView,
  Row,
  Cell,
  TableHeader,
  Column,
  TagGroup,
  Text,
  TreeView,
  TreeViewItem,
  TreeViewItemContent
} from '@adobe/react-spectrum';

import FileTxt from '@spectrum-icons/workflow/FileTxt';
import Folder from '@spectrum-icons/workflow/Folder';

export default function CollectionExamples(){
    return (
      <>
        <h2>Collections</h2>
        <Flex direction="column" gap="size-125">
          <Divider />
          <ActionMenu width="size-0">
            <Item>Cut</Item>
            <Item>Copy</Item>
            <Item>Paste</Item>
          </ActionMenu>
          <ListBox width="size-2400" aria-label="Alignment">
            <Item>Left</Item>
            <Item>Middle</Item>
            <Item>Right</Item>
          </ListBox>
          <ListView
            selectionMode="multiple"
            aria-label="Static ListView items example"
            maxWidth="size-6000"
          >
            <Item>Adobe Photoshop</Item>
            <Item>Adobe InDesign</Item>
            <Item>Adobe AfterEffects</Item>
            <Item>Adobe Illustrator</Item>
            <Item>Adobe Lightroom</Item>
          </ListView>
          <MenuTrigger>
            <ActionButton width="size-800">
              Menu
            </ActionButton>
            <Menu onAction={(key) => alert(key)}>
              <Item key="cut">Cut</Item>
              <Item key="copy">Copy</Item>
              <Item key="paste">Paste</Item>
              <Item key="replace">Replace</Item>
              <SubmenuTrigger>
                <Item key="share">Share</Item>
                <Menu onAction={(key) => alert(key)}>
                  <Item key="copy-link">Copy Link</Item>
                  <SubmenuTrigger>
                    <Item key="email">Email</Item>
                    <Menu onAction={(key) => alert(key)}>
                      <Item key="attachment">Email as Attachment</Item>
                      <Item key="link">Email as Link</Item>
                    </Menu>
                  </SubmenuTrigger>
                  <Item key="sms">SMS</Item>
                </Menu>
              </SubmenuTrigger>
              <Item key="delete">Delete</Item>
            </Menu>
          </MenuTrigger>
          <TableView
            aria-label="Example table with static contents"
            selectionMode="multiple"
            width="size-6000"
          >
            <TableHeader>
              <Column>Name</Column>
              <Column>Type</Column>
              <Column align="end">Date Modified</Column>
            </TableHeader>
            <TableBody>
              <Row>
                <Cell>Games</Cell>
                <Cell>File folder</Cell>
                <Cell>6/7/2020</Cell>
              </Row>
              <Row>
                <Cell>Program Files</Cell>
                <Cell>File folder</Cell>
                <Cell>4/7/2021</Cell>
              </Row>
              <Row>
                <Cell>bootmgr</Cell>
                <Cell>System file</Cell>
                <Cell>11/20/2010</Cell>
              </Row>
              <Row>
                <Cell>log.txt</Cell>
                <Cell>Text Document</Cell>
                <Cell>1/18/2016</Cell>
              </Row>
            </TableBody>
          </TableView>
          <TagGroup aria-label="Static TagGroup items example">
            <Item>News</Item>
            <Item>Travel</Item>
            <Item>Gaming</Item>
            <Item>Shopping</Item>
          </TagGroup>
          <div style={{width: '300px', height: '150px', overflow: 'auto'}}>
            <TreeView disabledKeys={['projects-1']} aria-label="test static tree">
              <TreeViewItem id="Photos" textValue="Photos">
                <TreeViewItemContent>
                  <Text>Photos</Text>
                  <Folder />
                </TreeViewItemContent>
              </TreeViewItem>
              <TreeViewItem id="projects" textValue="Projects">
                <TreeViewItemContent>
                  <Text>Projects</Text>
                  <Folder />
                </TreeViewItemContent>
                <TreeViewItem id="projects-1" textValue="Projects-1">
                  <TreeViewItemContent>
                    <Text>Projects-1</Text>
                    <Folder />
                  </TreeViewItemContent>
                  <TreeViewItem id="projects-1A" textValue="Projects-1A">
                    <TreeViewItemContent>
                      <Text>Projects-1A</Text>
                      <FileTxt />
                    </TreeViewItemContent>
                  </TreeViewItem>
                </TreeViewItem>
                <TreeViewItem id="projects-2" textValue="Projects-2">
                  <TreeViewItemContent>
                    <Text>Projects-2</Text>
                    <FileTxt />
                  </TreeViewItemContent>
                </TreeViewItem>
                <TreeViewItem id="projects-3" textValue="Projects-3">
                  <TreeViewItemContent>
                    <Text>Projects-3</Text>
                    <FileTxt />
                  </TreeViewItemContent>
                </TreeViewItem>
              </TreeViewItem>
            </TreeView>
          </div>
        </Flex>
      </>
    )
}
