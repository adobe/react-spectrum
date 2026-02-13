
import {act, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {
  ActionMenu,
  MenuItem,
  Text,
  TreeView,
  TreeViewItem,
  TreeViewItemContent
} from '../src';
import {AriaTreeTests} from '../../../react-aria-components/test/AriaTree.test-util';
import {DisabledBehavior} from '@react-types/shared';
import FileTxt from '../s2wf-icons/S2_Icon_FileText_20_N.svg';
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import React, {useState} from 'react';
import userEvent from '@testing-library/user-event';

AriaTreeTests({
  prefix: 'spectrum2-static',
  setup: () => {
    let offsetWidth, offsetHeight;

    beforeAll(function () {
      offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 1000);
      offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 1000);
    });

    afterAll(function () {
      offsetWidth.mockReset();
      offsetHeight.mockReset();
    });
  },
  renderers: {
    // todo - we don't support isDisabled on TreeViewItems?
    standard: () => render(
      <TreeView aria-label="test tree">
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
        <TreeViewItem id="school" textValue="school">
          <TreeViewItemContent>
            <Text>School</Text>
            <Folder />
          </TreeViewItemContent>
          <TreeViewItem id="homework-1" textValue="homework-1">
            <TreeViewItemContent>
              <Text>Homework-1</Text>
              <Folder />
            </TreeViewItemContent>
            <TreeViewItem id="homework-1A" textValue="homework-1A">
              <TreeViewItemContent>
                <Text>Homework-1A</Text>
                <FileTxt />
              </TreeViewItemContent>
            </TreeViewItem>
          </TreeViewItem>
          <TreeViewItem id="homework-2" textValue="homework-2">
            <TreeViewItemContent>
              <Text>Homework-2</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
          <TreeViewItem id="homework-3" textValue="homework-3">
            <TreeViewItemContent>
              <Text>Homework-3</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
      </TreeView>
    ),
    singleSelection: () => render(
      <TreeView aria-label="test tree" selectionMode="single" disabledKeys={['school']} disabledBehavior="selection">
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
        <TreeViewItem id="school" textValue="school">
          <TreeViewItemContent>
            <Text>School</Text>
            <Folder />
          </TreeViewItemContent>
          <TreeViewItem id="homework-1" textValue="homework-1">
            <TreeViewItemContent>
              <Text>Homework-1</Text>
              <Folder />
            </TreeViewItemContent>
            <TreeViewItem id="homework-1A" textValue="homework-1A">
              <TreeViewItemContent>
                <Text>Homework-1A</Text>
                <FileTxt />
              </TreeViewItemContent>
            </TreeViewItem>
          </TreeViewItem>
          <TreeViewItem id="homework-2" textValue="homework-2">
            <TreeViewItemContent>
              <Text>Homework-2</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
          <TreeViewItem id="homework-3" textValue="homework-3">
            <TreeViewItemContent>
              <Text>Homework-3</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
      </TreeView>
    ),
    allInteractionsDisabled: () => render(
      <TreeView aria-label="test tree" selectionMode="single" disabledKeys={['school']} disabledBehavior="all">
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
        <TreeViewItem id="school" textValue="school">
          <TreeViewItemContent>
            <Text>School</Text>
            <Folder />
          </TreeViewItemContent>
          <TreeViewItem id="homework-1" textValue="homework-1">
            <TreeViewItemContent>
              <Text>Homework-1</Text>
              <Folder />
            </TreeViewItemContent>
            <TreeViewItem id="homework-1A" textValue="homework-1A">
              <TreeViewItemContent>
                <Text>Homework-1A</Text>
                <FileTxt />
              </TreeViewItemContent>
            </TreeViewItem>
          </TreeViewItem>
          <TreeViewItem id="homework-2" textValue="homework-2">
            <TreeViewItemContent>
              <Text>Homework-2</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
          <TreeViewItem id="homework-3" textValue="homework-3">
            <TreeViewItemContent>
              <Text>Homework-3</Text>
              <FileTxt />
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
      </TreeView>
    )
  }
});


describe('TreeView', () => {
  let user;
  let offsetWidth, offsetHeight;

  beforeAll(function () {
    user = userEvent.setup({delay: null, pointerMap});
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 400);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 200);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => {jest.runAllTimers();});
  });

  afterAll(function () {
    offsetWidth.mockReset();
    offsetHeight.mockReset();
  });

  it('should not disable interactive items if the row is in disabledKeys and disabledBehavior is selection', async() => {
    let {getAllByLabelText, getByRole} = render(
      <TreeView expandedKeys={['projects']} aria-label="Test tree" disabledKeys={['projects-1']} disabledBehavior="selection" selectionMode="single">
        <TreeViewItem id="projects" textValue="Projects">
          <TreeViewItemContent>
            <Text>Projects</Text>
            <Folder />
            <ActionMenu>
              <MenuItem id="edit">
                <Text>Edit</Text>
              </MenuItem>
              <MenuItem id="delete">
                <Text>Delete</Text>
              </MenuItem>
            </ActionMenu>
          </TreeViewItemContent>
          <TreeViewItem id="projects-1" textValue="Projects-1">
            <TreeViewItemContent>
              <Text>Projects-1</Text>
              <Folder />
              <ActionMenu>
                <MenuItem id="edit">
                  <Text>Edit</Text>
                </MenuItem>
                <MenuItem id="delete">
                  <Text>Delete</Text>
                </MenuItem>
              </ActionMenu>
            </TreeViewItemContent>
          </TreeViewItem>
          <TreeViewItem id="projects-2" textValue="Projects-2">
            <TreeViewItemContent>
              <Text>Projects-2</Text>
              <FileTxt />
              <ActionMenu>
                <MenuItem id="edit">
                  <Text>Edit</Text>
                </MenuItem>
                <MenuItem id="delete">
                  <Text>Delete</Text>
                </MenuItem>
              </ActionMenu>
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
      </TreeView>
    );

    let buttons = getAllByLabelText('More actions');
    let button = buttons[1];
    expect(button).not.toHaveAttribute('data-disabled');

    await user.click(button);
    let menu = getByRole('menu');
    expect(menu).toBeInTheDocument();
  });

  it('should not disable interactive items if the row isDisabled and disabledBehavior is selection', async () => {
    let {getAllByLabelText, getByRole} = render(
      <TreeView expandedKeys={['projects']} aria-label="Test tree" disabledBehavior="selection">
        <TreeViewItem id="projects" textValue="Projects">
          <TreeViewItemContent>
            <Text>Projects</Text>
            <Folder />
            <ActionMenu>
              <MenuItem id="edit">
                <Text>Edit</Text>
              </MenuItem>
              <MenuItem id="delete">
                <Text>Delete</Text>
              </MenuItem>
            </ActionMenu>
          </TreeViewItemContent>
          <TreeViewItem id="projects-1" textValue="Projects-1" isDisabled>
            <TreeViewItemContent>
              <Text>Projects-1</Text>
              <Folder />
              <ActionMenu>
                <MenuItem id="edit">
                  <Text>Edit</Text>
                </MenuItem>
                <MenuItem id="delete">
                  <Text>Delete</Text>
                </MenuItem>
              </ActionMenu>
            </TreeViewItemContent>
          </TreeViewItem>
          <TreeViewItem id="projects-2" textValue="Projects-2">
            <TreeViewItemContent>
              <Text>Projects-2</Text>
              <FileTxt />
              <ActionMenu>
                <MenuItem id="edit">
                  <Text>Edit</Text>
                </MenuItem>
                <MenuItem id="delete">
                  <Text>Delete</Text>
                </MenuItem>
              </ActionMenu>
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
      </TreeView>
    );

    let buttons = getAllByLabelText('More actions');
    let button = buttons[1];
    expect(button).not.toHaveAttribute('data-disabled');

    await user.click(button);
    let menu = getByRole('menu');
    expect(menu).toBeInTheDocument();
  });

  it('should disable interactive items if the row is in disabledKeys and disabledBehavior is all', async () => {
    let {getAllByLabelText, queryByRole} = render(
      <TreeView expandedKeys={['projects']} aria-label="Test tree" disabledKeys={['projects-1']} disabledBehavior="all">
        <TreeViewItem id="projects" textValue="Projects">
          <TreeViewItemContent>
            <Text>Projects</Text>
            <Folder />
            <ActionMenu>
              <MenuItem id="edit">
                <Text>Edit</Text>
              </MenuItem>
              <MenuItem id="delete">
                <Text>Delete</Text>
              </MenuItem>
            </ActionMenu>
          </TreeViewItemContent>
          <TreeViewItem id="projects-1" textValue="Projects-1">
            <TreeViewItemContent>
              <Text>Projects-1</Text>
              <Folder />
              <ActionMenu>
                <MenuItem id="edit">
                  <Text>Edit</Text>
                </MenuItem>
                <MenuItem id="delete">
                  <Text>Delete</Text>
                </MenuItem>
              </ActionMenu>
            </TreeViewItemContent>
          </TreeViewItem>
          <TreeViewItem id="projects-2" textValue="Projects-2">
            <TreeViewItemContent>
              <Text>Projects-2</Text>
              <FileTxt />
              <ActionMenu>
                <MenuItem id="edit">
                  <Text>Edit</Text>
                </MenuItem>
                <MenuItem id="delete">
                  <Text>Delete</Text>
                </MenuItem>
              </ActionMenu>
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
      </TreeView>
    );

    let buttons = getAllByLabelText('More actions');
    let button = buttons[1];
    expect(button).toHaveAttribute('data-disabled');

    await user.click(button);
    let menu = queryByRole('menu');
    expect(menu).not.toBeInTheDocument();
  });

  it('should disable interactive items if the row isDisabled and disabledBehavior is all', async () => {
    let {getAllByLabelText, queryByRole} = render(
      <TreeView expandedKeys={['projects']} aria-label="Test tree" disabledBehavior="all">
        <TreeViewItem id="projects" textValue="Projects">
          <TreeViewItemContent>
            <Text>Projects</Text>
            <Folder />
            <ActionMenu>
              <MenuItem id="edit">
                <Text>Edit</Text>
              </MenuItem>
              <MenuItem id="delete">
                <Text>Delete</Text>
              </MenuItem>
            </ActionMenu>
          </TreeViewItemContent>
          <TreeViewItem id="projects-1" textValue="Projects-1" isDisabled>
            <TreeViewItemContent>
              <Text>Projects-1</Text>
              <Folder />
              <ActionMenu>
                <MenuItem id="edit">
                  <Text>Edit</Text>
                </MenuItem>
                <MenuItem id="delete">
                  <Text>Delete</Text>
                </MenuItem>
              </ActionMenu>
            </TreeViewItemContent>
          </TreeViewItem>
          <TreeViewItem id="projects-2" textValue="Projects-2">
            <TreeViewItemContent>
              <Text>Projects-2</Text>
              <FileTxt />
              <ActionMenu>
                <MenuItem id="edit">
                  <Text>Edit</Text>
                </MenuItem>
                <MenuItem id="delete">
                  <Text>Delete</Text>
                </MenuItem>
              </ActionMenu>
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
      </TreeView>
    );

    let buttons = getAllByLabelText('More actions');
    let button = buttons[1];
    expect(button).toHaveAttribute('data-disabled');

    await user.click(button);
    let menu = queryByRole('menu');
    expect(menu).not.toBeInTheDocument();
  });

  it('if the previously focused item is disabled, the focus should move to the first item when coming back to the collection', async () => {
    function Example() {
      let [disabledBehavior, setDisabledBehavior] = useState<DisabledBehavior>('selection');
      return (
        <>
          <button>Before</button>
          <TreeView aria-label="Test tree" disabledBehavior={disabledBehavior} disabledKeys={['school']}>
            <TreeViewItem id="projects" textValue="Projects">
              <TreeViewItemContent>
                <Text>Projects</Text>o
                <Folder />
                <ActionMenu>
                  <MenuItem id="edit">
                    <Text>Edit</Text>
                  </MenuItem>
                  <MenuItem id="delete">
                    <Text>Delete</Text>
                  </MenuItem>
                </ActionMenu>
              </TreeViewItemContent>
            </TreeViewItem>
            <TreeViewItem id="school" textValue="School">
              <TreeViewItemContent>
                <Text>School</Text>o
                <Folder />
                <ActionMenu>
                  <MenuItem id="edit">
                    <Text>Edit</Text>
                  </MenuItem>
                  <MenuItem id="delete">
                    <Text>Delete</Text>
                  </MenuItem>
                </ActionMenu>
              </TreeViewItemContent>
              <TreeViewItem id="homework-1" textValue="Homework-1" isDisabled>
                <TreeViewItemContent>
                  <Text>Homework-1</Text>
                  <Folder />
                  <ActionMenu>
                    <MenuItem id="edit">
                      <Text>Edit</Text>
                    </MenuItem>
                    <MenuItem id="delete">
                      <Text>Delete</Text>
                    </MenuItem>
                  </ActionMenu>
                </TreeViewItemContent>
              </TreeViewItem>
            </TreeViewItem>
          </TreeView>
          <button onClick={() => setDisabledBehavior('all')}>After</button>
        </>
      );
    }

    let {getAllByRole, getByRole} = render(<Example />);
    await user.click(document.body);

    let rows = getAllByRole('row');
    let afterButton = getByRole('button', {name: 'After'});
    await user.click(rows[1]);
    expect(document.activeElement).toBe(rows[1]);

    await user.click(afterButton);
    await user.tab({shift: true});
    await user.tab({shift: true});
    await user.tab();
    expect(document.activeElement).toBe(rows[0]);
  });
});
