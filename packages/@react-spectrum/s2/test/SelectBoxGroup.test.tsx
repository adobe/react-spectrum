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
          isCheckboxHidden
          label="Checkbox disabled test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const selectedRow = screen.getByRole('option', {name: 'Option 1'});
      // Should not show checkbox when isCheckboxHidden is true at group level
      const checkboxDiv = selectedRow.querySelector('[aria-hidden="true"]');
      expect(checkboxDiv).not.toBeInTheDocument();
    });

    it('supports individual visibility controls', () => {
      render(
        <SelectBoxGroup
          selectionMode="multiple"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1'])}
          label="Individual disabled test">
          <SelectBox value="option1" isCheckboxHidden>
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const selectedRow = screen.getByRole('option', {name: 'Option 1'});
      // Should not show checkbox when individual isCheckboxHidden is true
      const checkboxDiv = selectedRow.querySelector('[aria-hidden="true"]');
      expect(checkboxDiv).not.toBeInTheDocument();
    });

    it('shows elements when both group and individual are false', () => {
      render(
        <SelectBoxGroup
          selectionMode="multiple"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1'])}
          isCheckboxHidden={false}
          label="Both enabled test">
          <SelectBox value="option1" isCheckboxHidden={false}>
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const selectedRow = screen.getByRole('option', {name: 'Option 1'});
      // Should show checkbox when both group and individual are false
      const checkboxDiv = selectedRow.querySelector('[aria-hidden="true"]');
      expect(checkboxDiv).toBeInTheDocument();
    });

    it('hides elements when either group or individual is true', () => {
      render(
        <SelectBoxGroup
          selectionMode="multiple"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1', 'option2'])}
          isCheckboxHidden
          label="OR logic test">
          <SelectBox value="option1" isCheckboxHidden={false}>
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      // Both should be hidden due to OR logic
      const option1 = screen.getByRole('option', {name: 'Option 1'});
      const option2 = screen.getByRole('option', {name: 'Option 2'});
      
      const checkbox1 = option1.querySelector('[aria-hidden="true"]');
      const checkbox2 = option2.querySelector('[aria-hidden="true"]');
      
      expect(checkbox1).not.toBeInTheDocument();
      expect(checkbox2).not.toBeInTheDocument();
    });

    it('tests all visibility control combinations for labels and illustrations', () => {
      render(
        <SelectBoxGroup
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1', 'option2', 'option3', 'option4'])}
          label="All combinations test">
          <SelectBox value="option1">
            <Calendar slot="icon" />
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2" isLabelHidden>
            <Calendar slot="icon" />
            <Text slot="text">Option 2</Text>
          </SelectBox>
          <SelectBox value="option3" isIllustrationHidden>
            <Calendar slot="icon" />
            <Text slot="text">Option 3</Text>
          </SelectBox>
          <SelectBox value="option4" isLabelHidden isIllustrationHidden>
            <Calendar slot="icon" />
            <Text slot="text">Option 4</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      // Option 1: both enabled (false || false = false, so show)
      const option1 = screen.getByRole('option', {name: 'Option 1'});
      expect(option1.textContent).toContain('Option 1');

      // Option 2: label disabled (true || false = true, so hide label)
      const option2 = screen.getByRole('option', {name: 'Option 2'});
      expect(option2).toBeInTheDocument();

      // Option 3: icon disabled (false || true = true, so hide icon)
      const option3 = screen.getByRole('option', {name: 'Option 3'});
      expect(option3.textContent).toContain('Option 3');

      // Option 4: both disabled
      const option4 = screen.getByRole('option', {name: 'Option 4'});
      expect(option4).toBeInTheDocument();
    });

    it('respects visibility controls during hover interactions', async () => {
      render(
        <SelectBoxGroup
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set()}
          isCheckboxHidden
          label="Hover with visibility test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2" isCheckboxHidden={false}>
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      const option2 = screen.getByRole('option', {name: 'Option 2'});

      // Hover option1 - should not show checkbox due to group disabled
      await userEvent.hover(option1);
      await waitFor(() => {
        const checkbox1 = option1.querySelector('[aria-hidden="true"]');
        expect(checkbox1).not.toBeInTheDocument();
      });

      // Hover option2 - should not show checkbox due to OR logic
      await userEvent.hover(option2);
      await waitFor(() => {
        const checkbox2 = option2.querySelector('[aria-hidden="true"]');
        expect(checkbox2).not.toBeInTheDocument();
      });
    });

    it('handles form integration with visibility controls', () => {
      const {container} = render(
        <SelectBoxGroup
          selectionMode="multiple"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1', 'option2'])}
          name="test-visibility"
          isCheckboxHidden
          label="Form with visibility test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2" isCheckboxHidden={false}>
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      // Form integration should work regardless of visibility controls
      const hiddenInputs = container.querySelectorAll('input[type="hidden"][name="test-visibility"]');
      expect(hiddenInputs).toHaveLength(2);
      expect(hiddenInputs[0]).toHaveValue('option1');
      expect(hiddenInputs[1]).toHaveValue('option2');
    });

    it('handles selection state changes with visibility controls', async () => {
      const onSelectionChange = jest.fn();
      render(
        <SelectBoxGroup
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
          selectedKeys={new Set()}
          isCheckboxHidden
          label="Selection with visibility test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('option', {name: 'Option 1'});
      
      // Should still be able to select even with checkbox hidden
      await userEvent.click(option1);
      
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
            <Calendar slot="icon" />
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

    it('handles keyboard navigation with visibility controls', async () => {
      const onSelectionChange = jest.fn();
      render(
        <SelectBoxGroup
          selectionMode="single"
          onSelectionChange={onSelectionChange}
          selectedKeys={new Set()}
          isCheckboxHidden
          label="Keyboard with visibility test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const listbox = screen.getByRole('listbox');
      await act(async () => {
        listbox.focus();
      });
      
      // Navigate with arrow keys
      await act(async () => {
        await userEvent.keyboard('{ArrowDown}');
      });
      
      // Select with space - the first option should be focused/selected by default
      await act(async () => {
        await userEvent.keyboard(' ');
      });
      
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      const receivedSelection = onSelectionChange.mock.calls[0][0];
      expect(Array.from(receivedSelection)).toEqual(['option1']);
    });

    it('maintains proper ARIA attributes with visibility controls', () => {
      render(
        <SelectBoxGroup
          selectionMode="multiple"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1'])}
          isCheckboxHidden
          isRequired
          isInvalid
          errorMessage="Test error"
          label="ARIA with visibility test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-multiselectable', 'true');
      
      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
      expect(options[1]).toHaveAttribute('aria-selected', 'false');
      
      const errorMessage = screen.getByText('Test error');
      expect(listbox).toHaveAttribute('aria-describedby', errorMessage.id);
    });

    it('handles horizontal orientation with visibility controls', () => {
      render(
        <SelectBoxGroup
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['option1'])}
          orientation="horizontal"
          isCheckboxHidden
          label="Horizontal visibility test">
          <SelectBox value="option1">
            <Calendar slot="icon" />
            <Text slot="text">Option 1</Text>
            <Text slot="description">Description</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option = screen.getByRole('option', {name: 'Option 1'});
      expect(option).toBeInTheDocument();
      
      // Checkbox should be hidden due to group setting
      const checkbox = option.querySelector('[aria-hidden="true"]');
      expect(checkbox).not.toBeInTheDocument();
      
      expect(option.textContent).toContain('Option 1');
      expect(option.textContent).toContain('Description');
    });

    it('validates children count with visibility controls', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <SelectBoxGroup 
          onSelectionChange={() => {}} 
          selectedKeys={new Set()} 
          isCheckboxHidden
          label="Too many children test">
          {Array.from({length: 12}, (_, i) => (
            <SelectBox key={i} value={`option${i}`}>
              <Text slot="text">Option {i}</Text>
            </SelectBox>
          ))}
        </SelectBoxGroup>
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid content. SelectBox cannot have more than 9 children.'
      );
      
      consoleSpy.mockRestore();
    });

    it('handles complex slot combinations with visibility controls', () => {
      render(
        <SelectBoxGroup
          selectionMode="single"
          onSelectionChange={() => {}}
          selectedKeys={new Set(['complex'])}
          label="Complex slots test">
          <SelectBox value="complex">
            
            <Text slot="text">Complex Item</Text>
            <Text slot="description">With multiple slots</Text>
            <div>Additional content</div>
            <span>More content</span>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option = screen.getByRole('option', {name: 'Complex Item'});
      expect(option).toBeInTheDocument();
      
      // Should show checkbox since item is selected and not disabled
      const checkbox = option.querySelector('[aria-hidden="true"]');
      expect(checkbox).toBeInTheDocument();
      
      expect(option.textContent).toContain('Complex Item');
      expect(option.textContent).toContain('With multiple slots');
      expect(option.textContent).toContain('Additional content');
      expect(option.textContent).toContain('More content');
    });

    it('handles rapid selection changes with visibility controls', async () => {
      const onSelectionChange = jest.fn();
      render(
        <SelectBoxGroup
          selectionMode="single"
          onSelectionChange={onSelectionChange}
          selectedKeys={new Set()}
          isCheckboxHidden
          label="Rapid selection test">
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

      const options = screen.getAllByRole('option');
      
      // Rapidly click multiple options - in single mode, only last selection matters
      await userEvent.click(options[0]);
      await userEvent.click(options[1]);
      await userEvent.click(options[2]);
      
      expect(onSelectionChange).toHaveBeenCalledTimes(3);
      
      const finalSelection = onSelectionChange.mock.calls[2][0];
      expect(Array.from(finalSelection)).toEqual(['option3']);
    });
  });
});


