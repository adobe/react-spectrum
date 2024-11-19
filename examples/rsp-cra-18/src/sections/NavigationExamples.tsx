import {Accordion, Disclosure, DisclosureTitle, DisclosurePanel, Flex, Divider, Breadcrumbs, Item, Link, Tabs, TabList, TabPanels} from '@adobe/react-spectrum';

export default function NavigationExamples() {
  return (
    <>
      <h2>Navigation</h2>
      <Flex direction="column" gap="size-125">
        <Divider />
        <Breadcrumbs>
          <Item key="home">Home</Item>
          <Item key="trendy">Trendy</Item>
          <Item key="march 2020 assets">March 2020 Assets</Item>
        </Breadcrumbs>
        <Link href="https://www.imdb.com/title/tt6348138/" target="_blank">
          The missing link.
        </Link>
        <Tabs aria-label="History of Ancient Rome">
          <TabList>
            <Item key="FoR">Founding of Rome</Item>
            <Item key="MaR">Monarchy and Republic</Item>
            <Item key="Emp">Empire</Item>
          </TabList>
          <TabPanels>
            <Item key="FoR">
              Arma virumque cano, Troiae qui primus ab oris.
            </Item>
            <Item key="MaR">
              Senatus Populusque Romanus.
            </Item>
            <Item key="Emp">
              Alea jacta est.
            </Item>
          </TabPanels>
        </Tabs>
        <h3>Accordion</h3>
        <Accordion maxWidth="size-3600">
          <Disclosure id="files">
            <DisclosureTitle>
              Files
            </DisclosureTitle>
            <DisclosurePanel>
              <p>Files content</p>
            </DisclosurePanel>
          </Disclosure>
          <Disclosure id="people">
            <DisclosureTitle>
              People
            </DisclosureTitle>
            <DisclosurePanel>
              <p>People content</p>
            </DisclosurePanel>
          </Disclosure>
        </Accordion>
        <h3>Disclosure</h3>
        <Disclosure>
          <DisclosureTitle>System Requirements</DisclosureTitle>
          <DisclosurePanel>
            <p>Details about system requirements here.</p>
          </DisclosurePanel>
        </Disclosure>
      </Flex>
    </>
  );
}
