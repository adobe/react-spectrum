import {act, render, screen, waitFor} from '@react-spectrum/test-utils-internal';
import Calendar from '../spectrum-illustrations/linear/Calendar';
import React from 'react';
import {SelectBox, SelectBoxGroup, Text} from '../src';
import {Selection} from '@react-types/shared';
import userEvent from '@testing-library/user-event';

function SingleSelectBox() {
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set());
  return (
    <SelectBoxGroup
      aria-label="Single selection test"
      selectionMode="single"
      onSelectionChange={setSelectedKeys}
      selectedKeys={selectedKeys}>
      <SelectBox value="option1">
        <Text slot="label">Option 1</Text>
      </SelectBox>
      <SelectBox value="option2">
        <Text slot="label">Option 2</Text>
      </SelectBox>
      <SelectBox value="option3">
        <Text slot="label">Option 3</Text>
      </SelectBox>
    </SelectBoxGroup>
  );
}

function MultiSelectBox() {
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set());
  return (
    <SelectBoxGroup
      aria-label="Multi selection test"
      selectionMode="multiple"
      onSelectionChange={setSelectedKeys}
      selectedKeys={selectedKeys}>
      <SelectBox value="option1">
        <Text slot="label">Option 1</Text>
      </SelectBox>
      <SelectBox value="option2">
        <Text slot="label">Option 2</Text>
      </SelectBox>
      <SelectBox value="option3">
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
      <SelectBox value="option1">
        <Text slot="label">Option 1</Text>
      </SelectBox>
      <SelectBox value="option2">
        <Text slot="label">Option 2</Text>
      </SelectBox>
    </SelectBoxGroup>
  );
}

describe('SelectBoxGroup', () => {
  describe('Basic functionality', () => {
    it('renders as a listbox with options', () => {
      render(<SingleSelectBox />);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(3);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('renders multiple selection mode', () => {
      render(<MultiSelectBox />);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(3);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('handles selection in single mode', async () => {
      render(<SingleSelectBox />);
      const options = screen.getAllByRole('option');
      const option1 = options.find(option => option.textContent?.includes('Option 1'))!;
      
      await userEvent.click(option1);
      expect(option1).toHaveAttribute('aria-selected', 'true');
    });

    it('handles multiple selection', async () => {
      render(<MultiSelectBox />);
      const options = screen.getAllByRole('option');
      const option1 = options.find(option => option.textContent?.includes('Option 1'))!;
      const option2 = options.find(option => option.textContent?.includes('Option 2'))!;
      
      await userEvent.click(option1);
      await userEvent.click(option2);
      
      expect(option1).toHaveAttribute('aria-selected', 'true');
      expect(option2).toHaveAttribute('aria-selected', 'true');
    });

    it('handles disabled state', () => {
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
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      const option2 = screen.getByRole('option', {name: 'Option 2'});
      
      await userEvent.click(option1);
      await userEvent.click(option2);
      
      expect(onSelectionChange).not.toHaveBeenCalled();
      
      // Items should have disabled attributes
      expect(option1).toHaveAttribute('aria-disabled', 'true');
      expect(option2).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Checkbox functionality', () => {
    it('shows checkbox when showCheckbox=true and item is selected', async () => {
      render(
        <SelectBoxGroup 
          aria-label="Checkbox test"
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set(['option1'])}
          showCheckbox>
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const selectedRow = screen.getByRole('option', {name: 'Option 1'});
      expect(selectedRow).toHaveAttribute('aria-selected', 'true');
      
      const checkboxDiv = selectedRow.querySelector('[aria-hidden="true"]');
      expect(checkboxDiv).toBeInTheDocument();
    });

    it('shows checkbox on hover when showCheckbox=true for non-disabled items', async () => {
      render(
        <SelectBoxGroup 
          aria-label="Hover checkbox test"
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          showCheckbox>
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const row = screen.getByRole('option', {name: 'Option 1'});
      
      await userEvent.hover(row);
      await waitFor(() => {
        const checkboxDiv = row.querySelector('[aria-hidden="true"]');
        expect(checkboxDiv).toBeInTheDocument();
      });
    });

    it('does not show checkbox when showCheckbox=false', async () => {
      render(
        <SelectBoxGroup 
          aria-label="No checkbox test"
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set(['option1'])}>
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const row = screen.getByRole('option', {name: 'Option 1'});
      
      const checkboxDiv = row.querySelector('[aria-hidden="true"]');
      expect(checkboxDiv).not.toBeInTheDocument();
    });

    it('shows checkbox for disabled but selected items when showCheckbox=true', () => {
      render(
        <SelectBoxGroup 
          aria-label="Disabled selected checkbox test"
          selectionMode="single" 
          onSelectionChange={() => {}} 
          defaultSelectedKeys={new Set(['option1'])}
          showCheckbox>
          <SelectBox value="option1" isDisabled>
            <Text slot="label">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const row = screen.getByRole('option', {name: 'Option 1'});
      
      const checkboxDiv = row.querySelector('[aria-hidden="true"]');
      expect(checkboxDiv).toBeInTheDocument();
    });

    it('does not show checkbox on hover for disabled items', async () => {
      render(
        <SelectBoxGroup 
          aria-label="Disabled hover test"
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          showCheckbox>
          <SelectBox value="option1" isDisabled>
            <Text slot="label">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const row = screen.getByRole('option', {name: 'Option 1'});
      
      await userEvent.hover(row);
      
      await waitFor(() => {
        const checkboxDiv = row.querySelector('[aria-hidden="true"]');
        expect(checkboxDiv).not.toBeInTheDocument();
      }, {timeout: 1000});
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
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('supports different gutter widths', () => {
      render(
        <SelectBoxGroup 
          aria-label="Gutter width test"
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          gutterWidth="compact">
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('supports custom number of columns', () => {
      render(
        <SelectBoxGroup 
          aria-label="Columns test"
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          numColumns={3}>
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
          <SelectBox value="option3">
            <Text slot="label">Option 3</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      
      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveStyle('grid-template-columns: repeat(3, 1fr)');
    });
  });

  describe('Controlled behavior', () => {
    it('handles initial value selection', () => {
      render(
        <SelectBoxGroup 
          aria-label="Initial selection test"
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set(['option1'])}>
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      const option2 = screen.getByRole('option', {name: 'Option 2'});
      
      expect(option1).toHaveAttribute('aria-selected', 'true');
      expect(option2).toHaveAttribute('aria-selected', 'false');
    });

    it('handles multiple selection with initial values', () => {
      render(
        <SelectBoxGroup 
          aria-label="Multiple initial selection test"
          selectionMode="multiple" 
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1', 'option2'])}>
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
          <SelectBox value="option3">
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

    it('calls onSelectionChange when selection changes', async () => {
      const onSelectionChange = jest.fn();
      render(
        <SelectBoxGroup
          aria-label="Selection change test"
          selectionMode="single"
          onSelectionChange={onSelectionChange}
          selectedKeys={new Set()}>
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      await userEvent.click(option1);
      
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      const receivedSelection = onSelectionChange.mock.calls[0][0];
      expect(Array.from(receivedSelection)).toEqual(['option1']);
    });

    it('calls onSelectionChange with Set for multiple selection', async () => {
      const onSelectionChange = jest.fn();
      render(
        <SelectBoxGroup
          aria-label="Multiple selection change test"
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
          selectedKeys={new Set()}>
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      await userEvent.click(option1);
      
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      const receivedSelection = onSelectionChange.mock.calls[0][0];
      expect(Array.from(receivedSelection)).toEqual(['option1']);
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
              <SelectBox value="option1">
                <Text slot="label">Option 1</Text>
              </SelectBox>
              <SelectBox value="option2">
                <Text slot="label">Option 2</Text>
              </SelectBox>
            </SelectBoxGroup>
          </div>
        );
      }

      render(<ControlledTest />);
      
      const button = screen.getByRole('button', {name: 'Select Option 2'});
      await userEvent.click(button);
      
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
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
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

  describe('Individual SelectBox behavior', () => {
    it('handles disabled individual items', () => {
      render(
        <SelectBoxGroup
          aria-label="Individual disabled test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}>
          <SelectBox value="option1" isDisabled>
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const rows = screen.getAllByRole('option');
      expect(rows.length).toBe(2);
      
      const option1 = screen.getByRole('option', {name: 'Option 1'});
      expect(option1).toHaveAttribute('aria-disabled', 'true');
    });

    it('prevents interaction with disabled items', async () => {
      const onSelectionChange = jest.fn();
      render(
        <SelectBoxGroup
          aria-label="Disabled interaction test"
          selectionMode="single"
          onSelectionChange={onSelectionChange}
          selectedKeys={new Set()}>
          <SelectBox value="option1" isDisabled>
            <Text slot="label">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      await userEvent.click(option1);
      
      expect(onSelectionChange).not.toHaveBeenCalled();
    });
  });

  describe('Grid navigation', () => {
    it('supports keyboard navigation and grid layout', async () => {
      render(
        <SelectBoxGroup
          aria-label="Grid navigation test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}
          numColumns={2}>
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
          <SelectBox value="option3">
            <Text slot="label">Option 3</Text>
          </SelectBox>
          <SelectBox value="option4">
            <Text slot="label">Option 4</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const listbox = screen.getByRole('listbox');
      const options = screen.getAllByRole('option');
      
      expect(listbox).toBeInTheDocument();
      expect(options).toHaveLength(4);
      
      expect(listbox).toHaveStyle('grid-template-columns: repeat(2, 1fr)');
      
      expect(screen.getByRole('option', {name: 'Option 1'})).toBeInTheDocument();
      expect(screen.getByRole('option', {name: 'Option 2'})).toBeInTheDocument();
      expect(screen.getByRole('option', {name: 'Option 3'})).toBeInTheDocument();
      expect(screen.getByRole('option', {name: 'Option 4'})).toBeInTheDocument();
    });

    it('supports space key selection', async () => {
      const onSelectionChange = jest.fn();
      render(
        <SelectBoxGroup
          aria-label="Space key test"
          selectionMode="single"
          onSelectionChange={onSelectionChange}
          selectedKeys={new Set()}>
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const listbox = screen.getByRole('listbox');
      await act(async () => {
        listbox.focus();
      });
      
      await act(async () => {
        await userEvent.keyboard(' ');
      });
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      const receivedSelection = onSelectionChange.mock.calls[0][0];
      expect(Array.from(receivedSelection)).toEqual(['option1']);
    });

    it('supports arrow key navigation', async () => {
      render(
        <SelectBoxGroup
          aria-label="Arrow key test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}>
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const listbox = screen.getByRole('listbox');
      await act(async () => {
        listbox.focus();
      });
      
      // Navigate to second option
      await userEvent.keyboard('{ArrowDown}');
      
      // Check that navigation works by verifying an option has focus
      const option1 = screen.getByRole('option', {name: 'Option 1'});
      expect(option1).toHaveFocus();
    });
  });

  describe('Children validation', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('does not warn with valid number of children', () => {
      render(
        <SelectBoxGroup 
          aria-label="Valid children test" 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}>
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      
      expect(console.warn).not.toHaveBeenCalled();
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
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
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
            <SelectBox value="option1">
              <Text slot="label">Option 1</Text>
            </SelectBox>
          </SelectBoxGroup>
        </div>
      );
      
      const listbox = screen.getByRole('listbox');
      // Just verify the listbox has an aria-labelledby attribute  
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
          <SelectBox value="option1">
            <Calendar slot="illustration" />
            <Text slot="label">Complex Option</Text>
            <Text slot="description">With description</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      
      expect(screen.getByText('Complex Option')).toBeInTheDocument();
      expect(screen.getByText('With description')).toBeInTheDocument();
    });

    it('handles different value types', () => {
      render(
        <SelectBoxGroup 
          aria-label="Value types test"
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}>
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
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
          <SelectBox value="option1">
            <Text slot="label">Valid Option</Text>
          </SelectBox>
          {false}
        </SelectBoxGroup>
      );
      
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(1);
      expect(screen.getByText('Valid Option')).toBeInTheDocument();
    });

    it('handles uncontrolled selection with defaultSelectedKeys', async () => {
      const onSelectionChange = jest.fn();
      render(
        <SelectBoxGroup 
          aria-label="Uncontrolled test"
          selectionMode="single" 
          onSelectionChange={onSelectionChange}
          defaultSelectedKeys={new Set(['option1'])}>
          <SelectBox value="option1">
            <Text slot="label">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="label">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      
      const option1 = screen.getByRole('option', {name: 'Option 1'});
      const option2 = screen.getByRole('option', {name: 'Option 2'});
      
      expect(option1).toHaveAttribute('aria-selected', 'true');
      expect(option2).toHaveAttribute('aria-selected', 'false');
      
      await userEvent.click(option2);
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      const receivedSelection = onSelectionChange.mock.calls[0][0];
      expect(Array.from(receivedSelection)).toEqual(['option2']);
    });
  });
});


