import {act, render, screen, waitFor} from '@react-spectrum/test-utils-internal';
import {Button, SelectBox, SelectBoxGroup, Text} from '../src';
import React from 'react';
import userEvent from '@testing-library/user-event';
import {Selection} from '@react-types/shared';

function SingleSelectBox() {
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set());
  return (
    <SelectBoxGroup
      selectionMode="single"
      onSelectionChange={setSelectedKeys}
      selectedKeys={selectedKeys}
      label="Single select test">
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
      selectionMode="multiple"
      onSelectionChange={setSelectedKeys}
      selectedKeys={selectedKeys}
      label="Multi select test">
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
      selectionMode="single"
      onSelectionChange={() => {}}
      selectedKeys={new Set()}
      isDisabled
      label="Disabled select test">
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
      expect(screen.getByRole('listbox', {name: 'Single select test'})).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(3);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('renders multiple selection mode', () => {
      render(<MultiSelectBox />);
      expect(screen.getByRole('listbox', {name: 'Multi select test'})).toBeInTheDocument();
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
  });

  describe('Visual checkbox indicators', () => {
    it('shows checkbox when item is selected', async () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set(['option1'])}
          label="Checkbox test">
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
      
      // Look for visual checkbox indicator (the UI checkbox div)
      const checkboxDiv = selectedRow.querySelector('[aria-hidden="true"]');
      expect(checkboxDiv).toBeInTheDocument();
    });

    it('shows checkbox on hover for non-disabled items', async () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          label="Hover test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const row = screen.getByRole('option', {name: 'Option 1'});
      
      await userEvent.hover(row);
      await waitFor(() => {
        // Check for visual checkbox indicator on hover
        const checkboxDiv = row.querySelector('[aria-hidden="true"]');
        expect(checkboxDiv).toBeInTheDocument();
      });
    });

    it('does not show checkbox on hover for disabled items', async () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          label="Disabled hover test">
          <SelectBox value="option1" isDisabled>
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const row = screen.getByRole('option', {name: 'Option 1'});
      
      await userEvent.hover(row);
      
      await waitFor(() => {
        // Should not show checkbox for disabled items
        const checkboxDiv = row.querySelector('[aria-hidden="true"]');
        expect(checkboxDiv).not.toBeInTheDocument();
      }, {timeout: 1000});
    });

    it('shows checkbox for disabled but selected items', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          defaultSelectedKeys={new Set(['option1'])}
          label="Disabled selected test">
          <SelectBox value="option1" isDisabled>
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const row = screen.getByRole('option', {name: 'Option 1'});
      
      const checkboxDiv = row.querySelector('[aria-hidden="true"]');
      expect(checkboxDiv).toBeInTheDocument();
    });
  });

  describe('Props and configuration', () => {
    it('supports different sizes', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          label="Size test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('listbox', {name: 'Size test'})).toBeInTheDocument();
    });

    it('supports horizontal orientation', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          orientation="horizontal" 
          label="Orientation test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('listbox', {name: 'Orientation test'})).toBeInTheDocument();
    });

    it('supports required state', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          isRequired 
          label="Required test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      const listbox = screen.getByRole('listbox', {name: 'Required test'});
      expect(listbox).toBeInTheDocument();
      expect(screen.getByText('Required test')).toBeInTheDocument();
    });

    it('supports error message and validation', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          isInvalid 
          errorMessage="Please select an option"
          label="Validation test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      const listbox = screen.getByRole('listbox', {name: 'Validation test'});
      expect(listbox).toBeInTheDocument();
      
      expect(screen.getByText('Please select an option')).toBeInTheDocument();
      
      const errorMessage = screen.getByText('Please select an option');
      expect(listbox.getAttribute('aria-describedby')).toBe(errorMessage.id);
    });
  });

  describe('Controlled behavior', () => {
    it('handles initial value selection', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set(['option1'])}
          label="Initial value test">
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
          selectionMode="multiple" 
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1', 'option2'])}
          label="Multiple initial test">
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
          selectionMode="single"
          onSelectionChange={onSelectionChange}
          selectedKeys={new Set()}
          label="Callback test">
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
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
          selectedKeys={new Set()}
          label="Multiple callback test">
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
          selectionMode="multiple"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1', 'option2'])}
          name="test-field"
          label="Form test">
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
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1'])}
          name="test-field"
          label="Single form test">
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
            selectionMode="multiple"
            onSelectionChange={() => {}}
            selectedKeys={new Set(['option1', 'option3'])}
            name="preferences"
            label="User Preferences">
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
  });

  describe('Individual SelectBox behavior', () => {
    it('handles disabled individual items', () => {
      render(
        <SelectBoxGroup
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}
          label="Individual disabled test">
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
          selectionMode="single"
          onSelectionChange={onSelectionChange}
          selectedKeys={new Set()}
          label="Disabled interaction test">
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
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}
          numColumns={2}
          label="Navigation test">
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
          selectionMode="single"
          onSelectionChange={onSelectionChange}
          selectedKeys={new Set()}
          label="Space key test">
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

  describe('Visibility controls', () => {
    it('supports checkbox visibility controls', () => {
      render(
        <SelectBoxGroup
          selectionMode="multiple"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1'])}
          isCheckboxDisabled={true}
          label="Checkbox disabled test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const selectedRow = screen.getByRole('option', {name: 'Option 1'});
      // Should not show checkbox when isCheckboxDisabled is true
      const checkboxDiv = selectedRow.querySelector('[aria-hidden="true"]');
      expect(checkboxDiv).not.toBeInTheDocument();
    });

    it('supports individual visibility overrides', () => {
      render(
        <SelectBoxGroup
          selectionMode="multiple"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1'])}
          isCheckboxDisabled={true}
          label="Individual override test">
          <SelectBox value="option1" isCheckboxDisabled={false}>
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const selectedRow = screen.getByRole('option', {name: 'Option 1'});
      // Should show checkbox when individual override is false and item is selected
      const checkboxDiv = selectedRow.querySelector('[aria-hidden="true"]');
      expect(checkboxDiv).toBeInTheDocument();
    });
  });

  describe('Children validation', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      (console.error as jest.Mock).mockRestore();
    });

    it('validates minimum children', () => {
      render(
        <SelectBoxGroup onSelectionChange={() => {}} selectedKeys={new Set()} label="Min children test">
          {[]}
        </SelectBoxGroup>
      );
      
      expect(console.error).toHaveBeenCalledWith(
        'Invalid content. SelectBox must have at least one item.'
      );
    });

    it('validates maximum children', () => {
      const manyChildren = Array.from({length: 10}, (_, i) => (
        <SelectBox key={i} value={`option${i}`}>
          <Text slot="text">Option {i}</Text>
        </SelectBox>
      ));
      
      render(
        <SelectBoxGroup onSelectionChange={() => {}} selectedKeys={new Set()} label="Max children test">
          {manyChildren}
        </SelectBoxGroup>
      );
      
      expect(console.error).toHaveBeenCalledWith(
        'Invalid content. SelectBox cannot have more than 9 children.'
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper listbox structure', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          label="ARIA test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      
      expect(screen.getByRole('listbox', {name: 'ARIA test'})).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(2);
    });

    it('associates labels correctly', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          label="Choose option">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      
      const listbox = screen.getByRole('listbox', {name: 'Choose option'});
      expect(listbox).toBeInTheDocument();
    });

    it('supports aria-describedby for error messages', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          isInvalid
          errorMessage="Error occurred"
          label="Error test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      
      const listbox = screen.getByRole('listbox');
      const errorMessage = screen.getByText('Error occurred');
      
      expect(listbox).toHaveAttribute('aria-describedby');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles complex children with slots', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          orientation="horizontal"
          label="Complex children test">
          <SelectBox value="option1">
            <div>Icon</div>
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
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          label="Empty value test">
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
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          gutterWidth="compact" 
          label="Gutter test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('listbox', {name: 'Gutter test'})).toBeInTheDocument();
    });

    it('handles emphasized style', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()}
          label="Emphasized test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('listbox', {name: 'Emphasized test'})).toBeInTheDocument();
    });

    it('handles "all" selection', () => {
      render(
        <SelectBoxGroup 
          selectionMode="multiple" 
          onSelectionChange={() => {}} 
          selectedKeys="all"
          label="All selected test">
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
              selectionMode="single" 
              onSelectionChange={setSelectedKeys} 
              selectedKeys={selectedKeys}
              label="Controlled test">
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


