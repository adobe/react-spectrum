import {act, render, screen, waitFor} from '@react-spectrum/test-utils-internal';
import {Button, SelectBox, SelectBoxGroup, Text} from '../src';
import Calendar from '../spectrum-illustrations/linear/Calendar';
import React from 'react';
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
        <Text slot="text">Option 1</Text>
      </SelectBox>
      <SelectBox value="option2">
        <Text slot="text">Option 2</Text>
      </SelectBox>
      <SelectBox value="option3">
        <Text slot="text">Option 3</Text>
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
        <Text slot="text">Option 1</Text>
      </SelectBox>
      <SelectBox value="option2">
        <Text slot="text">Option 2</Text>
      </SelectBox>
      <SelectBox value="option3">
        <Text slot="text">Option 3</Text>
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
        <Text slot="text">Option 1</Text>
      </SelectBox>
      <SelectBox value="option2">
        <Text slot="text">Option 2</Text>
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
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
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
          isCheckboxSelection>
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
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
          isCheckboxSelection>
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
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
            <Text slot="text">Option 1</Text>
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
          isCheckboxSelection>
          <SelectBox value="option1" isDisabled>
            <Text slot="text">Option 1</Text>
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
          isCheckboxSelection>
          <SelectBox value="option1" isDisabled>
            <Text slot="text">Option 1</Text>
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
    it('supports different sizes', () => {
      render(
        <SelectBoxGroup 
          aria-label="Size test"
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}>
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('supports horizontal orientation', () => {
      render(
        <SelectBoxGroup 
          aria-label="Horizontal test"
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          orientation="horizontal">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('listbox')).toBeInTheDocument();
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
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
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
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
          <SelectBox value="option3">
            <Text slot="text">Option 3</Text>
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
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
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
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      await userEvent.click(option1);
      
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      const receivedSelection = onSelectionChange.mock.calls[0][0];
      expect(Array.from(receivedSelection)).toEqual(['option1']);
    });
  });

  describe('Form integration', () => {
    it('creates hidden inputs for form submission', () => {
      const {container} = render(
        <SelectBoxGroup
          aria-label="Form integration test"
          selectionMode="multiple"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1', 'option2'])}
          name="test-field">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const hiddenInputs = container.querySelectorAll('input[type="hidden"][name="test-field"]');
      expect(hiddenInputs).toHaveLength(2);
      expect(hiddenInputs[0]).toHaveValue('option1');
      expect(hiddenInputs[1]).toHaveValue('option2');
    });

    it('creates single hidden input for single selection', () => {
      const {container} = render(
        <SelectBoxGroup
          aria-label="Single form test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1'])}
          name="test-field">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const hiddenInput = container.querySelector('input[type="hidden"][name="test-field"]');
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveValue('option1');
    });

    it('works with form submission using S2 Button', async () => {
      const onSubmit = jest.fn();
      render(
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const values = formData.getAll('preferences');
            onSubmit(values);
          }}>
          <SelectBoxGroup
            aria-label="Form submission test"
            selectionMode="multiple"
            onSelectionChange={() => {}}
            selectedKeys={new Set(['option1', 'option3'])}
            name="preferences">
            <SelectBox value="option1">
              <Text slot="text">Newsletter</Text>
            </SelectBox>
            <SelectBox value="option2">
              <Text slot="text">Marketing</Text>
            </SelectBox>
            <SelectBox value="option3">
              <Text slot="text">Updates</Text>
            </SelectBox>
          </SelectBoxGroup>
          <Button type="submit" variant="accent">
            Submit Preferences
          </Button>
        </form>
      );

      const submitButton = screen.getByRole('button', {name: 'Submit Preferences'});
      expect(submitButton).toBeInTheDocument();

      await userEvent.click(submitButton);
      
      expect(onSubmit).toHaveBeenCalledWith(['option1', 'option3']);
    });

    it('creates hidden inputs for form submission in single mode', () => {
      render(
        <SelectBoxGroup
          aria-label="Single form submission test"
          selectionMode="single"
          selectedKeys={new Set(['option2'])}
          name="test-field">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
          <SelectBox value="option3">
            <Text slot="text">Option 3</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const hiddenInput = screen.getByDisplayValue('option2');
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveAttribute('type', 'hidden');
      expect(hiddenInput).toHaveAttribute('name', 'test-field');
    });

    it('creates multiple hidden inputs for form submission in multiple mode', () => {
      render(
        <SelectBoxGroup
          aria-label="Multiple form submission test"
          selectionMode="multiple"
          selectedKeys={new Set(['option1', 'option3'])}
          name="test-field">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
          <SelectBox value="option3">
            <Text slot="text">Option 3</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const hiddenInputs = screen.getAllByDisplayValue(/option[13]/);
      expect(hiddenInputs).toHaveLength(2);
      expect(hiddenInputs[0]).toHaveAttribute('type', 'hidden');
      expect(hiddenInputs[0]).toHaveAttribute('name', 'test-field');
      expect(hiddenInputs[1]).toHaveAttribute('type', 'hidden');
      expect(hiddenInputs[1]).toHaveAttribute('name', 'test-field');
    });

    it('creates empty hidden input when no options selected in multiple mode', () => {
      render(
        <SelectBoxGroup
          aria-label="Empty selection test"
          selectionMode="multiple"
          selectedKeys={new Set()}
          name="test-field">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const hiddenInput = screen.getByDisplayValue('');
      expect(hiddenInput).toBeInTheDocument();
      expect(hiddenInput).toHaveAttribute('type', 'hidden');
      expect(hiddenInput).toHaveAttribute('name', 'test-field');
    });

    it('does not create hidden inputs when name prop is not provided', () => {
      render(
        <SelectBoxGroup
          aria-label="No name prop test"
          selectionMode="single"
          selectedKeys={new Set(['option1'])}>
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const hiddenInputs = document.querySelectorAll('input[type="hidden"]');
      expect(hiddenInputs).toHaveLength(0);
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
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const rows = screen.getAllByRole('option');
      expect(rows.length).toBe(2);
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
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      await userEvent.click(option1);
      
      expect(onSelectionChange).not.toHaveBeenCalled();
    });
  });

  describe('Grid navigation', () => {
    it('supports keyboard navigation', async () => {
      render(
        <SelectBoxGroup
          aria-label="Grid navigation test"
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}
          numColumns={2}>
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
          <SelectBox value="option3">
            <Text slot="text">Option 3</Text>
          </SelectBox>
          <SelectBox value="option4">
            <Text slot="text">Option 4</Text>
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
            <Text slot="text">Option 1</Text>
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
  });

  describe('Children validation', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      (console.error as jest.Mock).mockRestore();
    });

    it('validates maximum children', () => {
      const manyChildren = Array.from({length: 10}, (_, i) => (
        <SelectBox key={i} value={`option${i}`}>
          <Text slot="text">Option {i}</Text>
        </SelectBox>
      ));
      
      render(
        <SelectBoxGroup 
          aria-label="Max children test" 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}>
          {manyChildren}
        </SelectBoxGroup>
      );
      
      expect(console.error).toHaveBeenCalledWith(
        'Invalid content. SelectBoxGroup cannot have more than 9 children.'
      );
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
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(2);
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
            <Text slot="text">Complex Option</Text>
            <Text slot="description">With description</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      
      expect(screen.getByText('Complex Option')).toBeInTheDocument();
      expect(screen.getByText('With description')).toBeInTheDocument();
    });

    it('handles empty string values', () => {
      render(
        <SelectBoxGroup 
          aria-label="Empty value test"
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}>
          <SelectBox value="">
            <Text slot="text">Empty Value</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      
      const row = screen.getByRole('option', {name: 'Empty Value'});
      expect(row).toBeInTheDocument();
    });

    it('handles different gutter widths', () => {
      render(
        <SelectBoxGroup 
          aria-label="Gutter width test"
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          gutterWidth="compact">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('handles "all" selection', () => {
      render(
        <SelectBoxGroup 
          aria-label="All selection test"
          selectionMode="multiple" 
          onSelectionChange={() => {}} 
          selectedKeys="all">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      
      const option1 = screen.getByRole('option', {name: 'Option 1'});
      const option2 = screen.getByRole('option', {name: 'Option 2'});
      
      expect(option1).toHaveAttribute('aria-selected', 'true');
      expect(option2).toHaveAttribute('aria-selected', 'true');
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
                <Text slot="text">Option 1</Text>
              </SelectBox>
              <SelectBox value="option2">
                <Text slot="text">Option 2</Text>
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
  });
});


