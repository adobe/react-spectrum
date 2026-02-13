import {act, pointerMap, render, screen, waitFor} from '@react-spectrum/test-utils-internal';
import Calendar from '../spectrum-illustrations/linear/Calendar';
import React from 'react';
import {SelectBox, SelectBoxGroup, Text} from '../src';
import {Selection} from '@react-types/shared';
import {User} from '@react-aria/test-utils';
import userEvent from '@testing-library/user-event';

function ControlledSingleSelectBox() {
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set());
  return (
    <SelectBoxGroup
      aria-label="Single selection test"
      selectionMode="single"
      onSelectionChange={setSelectedKeys}
      selectedKeys={selectedKeys}>
      <SelectBox id="option1" textValue="Option 1">
        <Text slot="label">Option 1</Text>
      </SelectBox>
      <SelectBox id="option2" textValue="Option 2">
        <Text slot="label">Option 2</Text>
      </SelectBox>
      <SelectBox id="option3" textValue="Option 3">
        <Text slot="label">Option 3</Text>
      </SelectBox>
    </SelectBoxGroup>
  );
}

function ControlledMultiSelectBox() {
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set());
  return (
    <SelectBoxGroup
      aria-label="Multi selection test"
      selectionMode="multiple"
      onSelectionChange={setSelectedKeys}
      selectedKeys={selectedKeys}>
      <SelectBox id="option1" textValue="Option 1">
        <Text slot="label">Option 1</Text>
      </SelectBox>
      <SelectBox id="option2" textValue="Option 2">
        <Text slot="label">Option 2</Text>
      </SelectBox>
      <SelectBox id="option3" textValue="Option 3">
        <Text slot="label">Option 3</Text>
      </SelectBox>
    </SelectBoxGroup>
  );
}

function UncontrolledSelectBox({selectionMode = 'single'}: {selectionMode?: 'single' | 'multiple'}) {
  return (
    <SelectBoxGroup
      aria-label="Uncontrolled selection test"
      selectionMode={selectionMode}>
      <SelectBox id="option1" textValue="Option 1">
        <Text slot="label">Option 1</Text>
      </SelectBox>
      <SelectBox id="option2" textValue="Option 2">
        <Text slot="label">Option 2</Text>
      </SelectBox>
      <SelectBox id="option3" textValue="Option 3">
        <Text slot="label">Option 3</Text>
      </SelectBox>
    </SelectBoxGroup>
  );
}

function DisabledSelectBox() {
  return (
    <SelectBoxGroup
      aria-label="Disabled test"
      selectionMode="single"
      onSelectionChange={() => {}}
      selectedKeys={new Set()}
      isDisabled>
      <SelectBox id="option1" textValue="Option 1">
        <Text slot="label">Option 1</Text>
      </SelectBox>
      <SelectBox id="option2" textValue="Option 2">
        <Text slot="label">Option 2</Text>
      </SelectBox>
    </SelectBoxGroup>
  );
}

describe('SelectBoxGroup', () => {
  let user;
  let testUtilUser = new User();

  beforeAll(function () {
    jest.useFakeTimers();
    user = userEvent.setup({delay: null, pointerMap});
  });

  afterEach(() => {
    jest.clearAllMocks();
    act(() => jest.runAllTimers());
  });

  afterAll(function () {
    jest.restoreAllMocks();
  });

  describe('Basic functionality', () => {
    it('renders as a listbox with options', () => {
      render(<ControlledSingleSelectBox />);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(3);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('renders multiple selection mode', () => {
      render(<ControlledMultiSelectBox />);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(3);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  describe('Uncontrolled behavior', () => {
    it('handles uncontrolled click selection in single mode', async () => {
      render(<UncontrolledSelectBox selectionMode="single" />);
      let listboxTester = testUtilUser.createTester('ListBox', {root: screen.getByRole('listbox')});

      await listboxTester.toggleOptionSelection({option: 0});
      expect(listboxTester.options()[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('handles uncontrolled click selection in multiple mode', async () => {
      render(<UncontrolledSelectBox selectionMode="multiple" />);
      let listboxTester = testUtilUser.createTester('ListBox', {root: screen.getByRole('listbox')});

      await listboxTester.toggleOptionSelection({option: 0});
      await listboxTester.toggleOptionSelection({option: 1});

      expect(listboxTester.options()[0]).toHaveAttribute('aria-selected', 'true');
      expect(listboxTester.options()[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('handles uncontrolled selection toggle', async () => {
      render(<UncontrolledSelectBox selectionMode="single" />);
      let listboxTester = testUtilUser.createTester('ListBox', {root: screen.getByRole('listbox')});

      await listboxTester.toggleOptionSelection({option: 0});
      expect(listboxTester.options()[0]).toHaveAttribute('aria-selected', 'true');

      // Toggle off in single mode by selecting another
      await listboxTester.toggleOptionSelection({option: 1});
      expect(listboxTester.options()[0]).toHaveAttribute('aria-selected', 'false');
      expect(listboxTester.options()[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('handles uncontrolled keyboard selection', async () => {
      render(<UncontrolledSelectBox selectionMode="single" />);
      await user.tab();

      await act(async () => {
        await user.keyboard(' ');
      });

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      expect(option1).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Controlled behavior', () => {
    it('handles controlled selection in single mode', async () => {
      render(<ControlledSingleSelectBox />);
      let listboxTester = testUtilUser.createTester('ListBox', {root: screen.getByRole('listbox')});

      await listboxTester.toggleOptionSelection({option: 0});
      expect(listboxTester.options()[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('handles controlled multiple selection', async () => {
      render(<ControlledMultiSelectBox />);
      let listboxTester = testUtilUser.createTester('ListBox', {root: screen.getByRole('listbox')});

      await listboxTester.toggleOptionSelection({option: 0});
      await listboxTester.toggleOptionSelection({option: 1});

      expect(listboxTester.options()[0]).toHaveAttribute('aria-selected', 'true');
      expect(listboxTester.options()[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('calls onSelectionChange when selection changes in controlled mode', async () => {
      const onSelectionChange = jest.fn();
      const TestComponent = () => {
        const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set());
        return (
          <SelectBoxGroup
            aria-label="Selection change test"
            selectionMode="single"
            onSelectionChange={(keys) => {
              setSelectedKeys(keys);
              onSelectionChange(keys);
            }}
            selectedKeys={selectedKeys}>
            <SelectBox id="option1" textValue="Option 1">
              <Text slot="label">Option 1</Text>
            </SelectBox>
            <SelectBox id="option2" textValue="Option 2">
              <Text slot="label">Option 2</Text>
            </SelectBox>
          </SelectBoxGroup>
        );
      };

      render(<TestComponent />);
      const option1 = screen.getByRole('option', {name: 'Option 1'});
      await user.click(option1);

      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      const receivedSelection = onSelectionChange.mock.calls[0][0];
      expect(Array.from(receivedSelection)).toEqual(['option1']);
    });

    it('calls onSelectionChange with Set for multiple selection in controlled mode', async () => {
      const onSelectionChange = jest.fn();
      const TestComponent = () => {
        const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set());
        return (
          <SelectBoxGroup
            aria-label="Multiple selection change test"
            selectionMode="multiple"
            onSelectionChange={(keys) => {
              setSelectedKeys(keys);
              onSelectionChange(keys);
            }}
            selectedKeys={selectedKeys}>
            <SelectBox id="option1" textValue="Option 1">
              <Text slot="label">Option 1</Text>
            </SelectBox>
            <SelectBox id="option2" textValue="Option 2">
              <Text slot="label">Option 2</Text>
            </SelectBox>
          </SelectBoxGroup>
        );
      };

      render(<TestComponent />);
      const option1 = screen.getByRole('option', {name: 'Option 1'});
      await user.click(option1);

      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      const receivedSelection = onSelectionChange.mock.calls[0][0];
      expect(Array.from(receivedSelection)).toEqual(['option1']);
    });
  });

  describe('Disabled behavior', () => {
    it('renders disabled state correctly', () => {
      render(<DisabledSelectBox />);
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();

      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
    });

    it('prevents interaction when group is disabled', async () => {
      const onSelectionChange = jest.fn();
      render(
        <SelectBoxGroup
          aria-label="Group disabled test"
          selectionMode="single"
          onSelectionChange={onSelectionChange}
          selectedKeys={new Set()}
          isDisabled>
          <SelectBox id="option1" textValue="Option 1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox id="option2" textValue="Option 2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      const option2 = screen.getByRole('option', {name: 'Option 2'});
      await user.click(option1);
      await user.click(option2);
      expect(onSelectionChange).not.toHaveBeenCalled();

      expect(option1).toHaveAttribute('aria-disabled', 'true');
      expect(option2).toHaveAttribute('aria-disabled', 'true');
    });

    it('prevents uncontrolled interaction when group is disabled', async () => {
      render(
        <SelectBoxGroup
          aria-label="Uncontrolled disabled test"
          selectionMode="single"
          isDisabled>
          <SelectBox id="option1" textValue="Option 1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox id="option2" textValue="Option 2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      const option2 = screen.getByRole('option', {name: 'Option 2'});

      await user.click(option1);
      await user.click(option2);

      // should have disabled attributes and no selection
      expect(option1).toHaveAttribute('aria-disabled', 'true');
      expect(option2).toHaveAttribute('aria-disabled', 'true');
      expect(option1).toHaveAttribute('aria-selected', 'false');
      expect(option2).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Checkbox functionality', () => {
    it('shows checkbox when item is selected in controlled mode', async () => {
      render(
        <SelectBoxGroup
          aria-label="Checkbox test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1'])}>
          <SelectBox id="option1" textValue="Option 1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox id="option2" textValue="Option 2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const selectedRow = screen.getByRole('option', {name: 'Option 1'});
      expect(selectedRow).toHaveAttribute('aria-selected', 'true');

      const checkboxDiv = selectedRow.querySelector('[aria-hidden="true"]');
      expect(checkboxDiv).toBeInTheDocument();
    });

    it('shows checkbox when item is selected in uncontrolled mode', async () => {
      render(<UncontrolledSelectBox selectionMode="single" />);

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      await user.click(option1);

      expect(option1).toHaveAttribute('aria-selected', 'true');
      const checkboxDiv = option1.querySelector('[aria-hidden="true"]');
      expect(checkboxDiv).toBeInTheDocument();
    });

    it('shows checkbox on hover for non-disabled items in controlled mode', async () => {
      render(
        <SelectBoxGroup
          aria-label="Hover checkbox test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}>
          <SelectBox id="option1" textValue="Option 1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const row = screen.getByRole('option', {name: 'Option 1'});

      await user.hover(row);
      await waitFor(() => {
        const checkboxDiv = row.querySelector('[aria-hidden="true"]');
        expect(checkboxDiv).toBeInTheDocument();
      });
    });

    it('shows checkbox on hover for non-disabled items in uncontrolled mode', async () => {
      render(<UncontrolledSelectBox selectionMode="single" />);

      const row = screen.getByRole('option', {name: 'Option 1'});

      await user.hover(row);
      await waitFor(() => {
        const checkboxDiv = row.querySelector('[aria-hidden="true"]');
        expect(checkboxDiv).toBeInTheDocument();
      });
    });

    it('shows checkbox for disabled but selected items', () => {
      render(
        <SelectBoxGroup
          aria-label="Disabled selected checkbox test"
          selectionMode="single"
          onSelectionChange={() => {}}
          defaultSelectedKeys={new Set(['option1'])}>
          <SelectBox id="option1" textValue="Option 1" isDisabled>
            <Text slot="label">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const row = screen.getByRole('option', {name: 'Option 1'});

      const checkboxDiv = row.querySelector('[aria-hidden="true"]');
      expect(checkboxDiv).toBeInTheDocument();
    });

    it('shows checkbox for disabled items (always show checkboxes)', async () => {
      render(
        <SelectBoxGroup
          aria-label="Disabled hover test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}>
          <SelectBox id="option1" textValue="Option 1" isDisabled>
            <Text slot="label">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const row = screen.getByRole('option', {name: 'Option 1'});

      // checkbox always present
      const checkboxDiv = row.querySelector('[aria-hidden="true"]');
      expect(checkboxDiv).toBeInTheDocument();
    });
  });

  describe('Props and configuration', () => {
    it('supports different orientations', () => {
      render(
        <SelectBoxGroup
          aria-label="Horizontal test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}
          orientation="horizontal">
          <SelectBox id="option1" textValue="Option 1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('auto-fits columns based on orientation (vertical)', () => {
      render(
        <div style={{width: 600}}>
          <SelectBoxGroup
            aria-label="Auto-fit test vertical"
            selectionMode="single"
            onSelectionChange={() => {}}
            selectedKeys={new Set()}
            orientation="vertical">
            <SelectBox id="option1" textValue="Option 1">
              <Text slot="label">Option 1</Text>
            </SelectBox>
            <SelectBox id="option2" textValue="Option 2">
              <Text slot="label">Option 2</Text>
            </SelectBox>
            <SelectBox id="option3" textValue="Option 3">
              <Text slot="label">Option 3</Text>
            </SelectBox>
          </SelectBoxGroup>
        </div>
      );

      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });

    it('auto-fits columns based on orientation (horizontal)', () => {
      render(
        <div style={{width: 800}}>
          <SelectBoxGroup
            aria-label="Auto-fit test horizontal"
            selectionMode="single"
            onSelectionChange={() => {}}
            selectedKeys={new Set()}
            orientation="horizontal">
            <SelectBox id="option1" textValue="Option 1">
              <Text slot="label">Option 1</Text>
            </SelectBox>
            <SelectBox id="option2" textValue="Option 2">
              <Text slot="label">Option 2</Text>
            </SelectBox>
          </SelectBoxGroup>
        </div>
      );

      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });
  });

  describe('Controlled behavior', () => {
    it('handles initial id selection', () => {
      render(
        <SelectBoxGroup
          aria-label="Initial selection test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1'])}>
          <SelectBox id="option1" textValue="Option 1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox id="option2" textValue="Option 2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      const option2 = screen.getByRole('option', {name: 'Option 2'});

      expect(option1).toHaveAttribute('aria-selected', 'true');
      expect(option2).toHaveAttribute('aria-selected', 'false');
    });

    it('handles multiple selection with initial ids', () => {
      render(
        <SelectBoxGroup
          aria-label="Multiple initial selection test"
          selectionMode="multiple"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1', 'option2'])}>
          <SelectBox id="option1" textValue="Option 1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox id="option2" textValue="Option 2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
          <SelectBox id="option3" textValue="Option 3">
            <Text slot="label">Option 3</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      const option2 = screen.getByRole('option', {name: 'Option 2'});
      const option3 = screen.getByRole('option', {name: 'Option 3'});

      expect(option1).toHaveAttribute('aria-selected', 'true');
      expect(option2).toHaveAttribute('aria-selected', 'true');
      expect(option3).toHaveAttribute('aria-selected', 'false');
    });

    it('handles uncontrolled selection with defaultSelectedKeys', async () => {
      render(
        <SelectBoxGroup
          aria-label="Uncontrolled defaultSelectedKeys test"
          selectionMode="single"
          defaultSelectedKeys={new Set(['option1'])}>
          <SelectBox id="option1" textValue="Option 1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox id="option2" textValue="Option 2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      const option2 = screen.getByRole('option', {name: 'Option 2'});

      expect(option1).toHaveAttribute('aria-selected', 'true');
      expect(option2).toHaveAttribute('aria-selected', 'false');

      // click should update selection
      await user.click(option2);
      expect(option1).toHaveAttribute('aria-selected', 'false');
      expect(option2).toHaveAttribute('aria-selected', 'true');
    });

    it('handles uncontrolled multiple selection with defaultSelectedKeys', async () => {
      render(
        <SelectBoxGroup
          aria-label="Uncontrolled multiple defaultSelectedKeys test"
          selectionMode="multiple"
          defaultSelectedKeys={new Set(['option1', 'option2'])}>
          <SelectBox id="option1" textValue="Option 1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox id="option2" textValue="Option 2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
          <SelectBox id="option3" textValue="Option 3">
            <Text slot="label">Option 3</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      const option2 = screen.getByRole('option', {name: 'Option 2'});
      const option3 = screen.getByRole('option', {name: 'Option 3'});

      expect(option1).toHaveAttribute('aria-selected', 'true');
      expect(option2).toHaveAttribute('aria-selected', 'true');
      expect(option3).toHaveAttribute('aria-selected', 'false');

      await user.click(option3);
      expect(option1).toHaveAttribute('aria-selected', 'true');
      expect(option2).toHaveAttribute('aria-selected', 'true');
      expect(option3).toHaveAttribute('aria-selected', 'true');

      // click should remove from selection
      await user.click(option1);
      expect(option1).toHaveAttribute('aria-selected', 'false');
      expect(option2).toHaveAttribute('aria-selected', 'true');
      expect(option3).toHaveAttribute('aria-selected', 'true');
    });

    it('handles controlled component updates', async () => {
      function ControlledTest() {
        const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set());

        return (
          <div>
            <button onClick={() => setSelectedKeys(new Set(['option2']))}>
              Select Option 2
            </button>
            <SelectBoxGroup
              aria-label="Controlled test"
              selectionMode="single"
              onSelectionChange={setSelectedKeys}
              selectedKeys={selectedKeys}>
              <SelectBox id="option1" textValue="Option 1">
                <Text slot="label">Option 1</Text>
              </SelectBox>
              <SelectBox id="option2" textValue="Option 2">
                <Text slot="label">Option 2</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>
        );
      }

      render(<ControlledTest />);

      const button = screen.getByRole('button', {name: 'Select Option 2'});
      await user.click(button);

      const option2 = screen.getByRole('option', {name: 'Option 2'});
      expect(option2).toHaveAttribute('aria-selected', 'true');
    });

    it('handles "all" selection', () => {
      render(
        <SelectBoxGroup
          aria-label="All selection test"
          selectionMode="multiple"
          onSelectionChange={() => {}}
          selectedKeys="all">
          <SelectBox id="option1" textValue="Option 1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox id="option2" textValue="Option 2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      const option2 = screen.getByRole('option', {name: 'Option 2'});

      expect(option1).toHaveAttribute('aria-selected', 'true');
      expect(option2).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Grid navigation', () => {
    it('supports keyboard navigation and grid layout', async () => {
      render(
        <SelectBoxGroup
          aria-label="Grid navigation test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}>
          <SelectBox id="option1" textValue="Option 1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox id="option2" textValue="Option 2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
          <SelectBox id="option3" textValue="Option 3">
            <Text slot="label">Option 3</Text>
          </SelectBox>
          <SelectBox id="option4" textValue="Option 4">
            <Text slot="label">Option 4</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const listbox = screen.getByRole('listbox');
      const options = screen.getAllByRole('option');

      expect(listbox).toBeInTheDocument();
      expect(options).toHaveLength(4);
    });

    it('supports space key selection in uncontrolled mode', async () => {
      render(<UncontrolledSelectBox selectionMode="single" />);
      const option1 = screen.getByRole('option', {name: 'Option 1'});

      await user.tab();
      await user.keyboard(' ');

      expect(option1).toHaveAttribute('aria-selected', 'true');
    });

    it('supports arrow key navigation', async () => {
      render(
        <SelectBoxGroup
          aria-label="Arrow key test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}>
          <SelectBox id="option1" textValue="Option 1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox id="option2" textValue="Option 2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      await user.tab();

      await user.keyboard('{ArrowDown}');

      // check that navigation works by verifying an option has focus
      const option1 = screen.getByRole('option', {name: 'Option 1'});
      expect(option1).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has proper listbox structure', () => {
      render(
        <SelectBoxGroup
          aria-label="Accessibility test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}>
          <SelectBox id="option1" textValue="Option 1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox id="option2" textValue="Option 2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(2);
    });

    it('supports aria-label and aria-labelledby', () => {
      render(
        <div>
          <h2 id="test-label">My SelectBoxGroup</h2>
          <SelectBoxGroup
            aria-labelledby="test-label"
            selectionMode="single"
            onSelectionChange={() => {}}
            selectedKeys={new Set()}>
            <SelectBox id="option1" textValue="Option 1">
              <Text slot="label">Option 1</Text>
            </SelectBox>
          </SelectBoxGroup>
        </div>
      );

      const listbox = screen.getByRole('listbox');
      // verify the listbox has an aria-labelledby attribute
      expect(listbox).toHaveAttribute('aria-labelledby');
      expect(listbox.getAttribute('aria-labelledby')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('handles complex children with slots', () => {
      render(
        <SelectBoxGroup
          aria-label="Complex children test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}
          orientation="horizontal">
          <SelectBox id="option1" textValue="Option 1">
            <Calendar slot="illustration" />
            <Text slot="label">Complex Option</Text>
            <Text slot="description">With description</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      expect(screen.getByText('Complex Option')).toBeInTheDocument();
      expect(screen.getByText('With description')).toBeInTheDocument();
    });

    it('handles different id types', () => {
      render(
        <SelectBoxGroup
          aria-label="id types test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}>
          <SelectBox id="option1" textValue="Option 1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox id="option2" textValue="Option 2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      const option2 = screen.getByRole('option', {name: 'Option 2'});
      expect(option1).toBeInTheDocument();
      expect(option2).toBeInTheDocument();
    });

    it('handles empty children gracefully', () => {
      render(
        <SelectBoxGroup
          aria-label="Empty children test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}>
          {null}
          {undefined}
          <SelectBox id="option1" textValue="Option 1">
            <Text slot="label">Valid Option</Text>
          </SelectBox>
          {false}
        </SelectBoxGroup>
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(1);
      expect(screen.getByText('Valid Option')).toBeInTheDocument();
    });

    it('handles individual disabled items', () => {
      render(
        <SelectBoxGroup
          aria-label="Individual disabled test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}>
          <SelectBox id="option1" textValue="Option 1" isDisabled>
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox id="option2" textValue="Option 2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const rows = screen.getAllByRole('option');
      expect(rows.length).toBe(2);

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      expect(option1).toHaveAttribute('aria-disabled', 'true');
    });

    it('prevents interaction with individually disabled items', async () => {
      const onSelectionChange = jest.fn();
      render(
        <SelectBoxGroup
          aria-label="Disabled interaction test"
          selectionMode="single"
          onSelectionChange={onSelectionChange}
          selectedKeys={new Set()}>
          <SelectBox id="option1" textValue="Option 1" isDisabled>
            <Text slot="label">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      await user.click(option1);

      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it('prevents uncontrolled interaction with individually disabled items', async () => {
      render(
        <SelectBoxGroup
          aria-label="Uncontrolled disabled interaction test"
          selectionMode="single">
          <SelectBox id="option1" textValue="Option 1" isDisabled>
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox id="option2" textValue="Option 2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      const option2 = screen.getByRole('option', {name: 'Option 2'});

      await user.click(option1);
      expect(option1).toHaveAttribute('aria-disabled', 'true');
      expect(option1).toHaveAttribute('aria-selected', 'false');

      // clicking enabled item should still work
      await user.click(option2);
      expect(option2).toHaveAttribute('aria-selected', 'true');
    });
  });
});
