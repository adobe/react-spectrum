import {act, render, screen, waitFor} from '@testing-library/react';
import {Button, Text} from '../src';
import React from 'react';
import {SelectBox} from '../src/SelectBox';
import {SelectBoxGroup} from '../src/SelectBoxGroup';
import userEvent from '@testing-library/user-event';

function SingleSelectBox() {
  const [value, setValue] = React.useState('');
  return (
    <SelectBoxGroup
      selectionMode="single"
      onSelectionChange={(val) => setValue(val as string)}
      value={value}
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
  const [value, setValue] = React.useState<string[]>([]);
  return (
    <SelectBoxGroup
      selectionMode="multiple"
      onSelectionChange={(val) => setValue(val as string[])}
      value={value}
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
      value=""
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
    it('renders as a grid with rows', () => {
      render(<SingleSelectBox />);
      expect(screen.getByRole('grid', {name: 'Single select test'})).toBeInTheDocument();
      expect(screen.getAllByRole('row')).toHaveLength(3);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('renders multiple selection mode', () => {
      render(<MultiSelectBox />);
      expect(screen.getByRole('grid', {name: 'Multi select test'})).toBeInTheDocument();
      expect(screen.getAllByRole('row')).toHaveLength(3);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('handles selection in single mode', async () => {
      render(<SingleSelectBox />);
      const rows = screen.getAllByRole('row');
      const option1 = rows.find(row => row.textContent?.includes('Option 1'))!;
      
      await userEvent.click(option1);
      expect(option1).toHaveAttribute('aria-selected', 'true');
    });

    it('handles multiple selection', async () => {
      render(<MultiSelectBox />);
      const rows = screen.getAllByRole('row');
      const option1 = rows.find(row => row.textContent?.includes('Option 1'))!;
      const option2 = rows.find(row => row.textContent?.includes('Option 2'))!;
      
      await userEvent.click(option1);
      await userEvent.click(option2);
      
      expect(option1).toHaveAttribute('aria-selected', 'true');
      expect(option2).toHaveAttribute('aria-selected', 'true');
    });

    it('handles disabled state', () => {
      render(<DisabledSelectBox />);
      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
      
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(0);
    });
  });

  describe('Visual checkbox indicators', () => {
    it('shows checkbox when item is selected', async () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          value="option1" 
          label="Checkbox test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const selectedRow = screen.getByRole('row', {name: 'Option 1'});
      expect(selectedRow).toHaveAttribute('aria-selected', 'true');
      
      const checkbox = selectedRow.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeChecked();
    });

    it('shows checkbox on hover for non-disabled items', async () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          value="" 
          label="Hover test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const row = screen.getByRole('row', {name: 'Option 1'});
      
      await userEvent.hover(row);
      await waitFor(() => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        expect(checkbox).toBeInTheDocument();
      });
    });

    it('does not show checkbox on hover for disabled items', async () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          value="" 
          label="Disabled hover test">
          <SelectBox value="option1" isDisabled>
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const row = screen.getByRole('row', {name: 'Option 1'});
      
      await userEvent.hover(row);
      
      await waitFor(() => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        expect(checkbox).not.toBeInTheDocument();
      }, {timeout: 1000});
    });

    it('shows checkbox for disabled but selected items', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          defaultValue="option1"
          label="Disabled selected test">
          <SelectBox value="option1" isDisabled>
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const row = screen.getByRole('row', {name: 'Option 1'});
      
      const checkbox = row.querySelector('input[type="checkbox"]');
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeChecked();
    });
  });

  describe('Props and configuration', () => {
    it('supports different sizes', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          value="" 
          size="L" 
          label="Size test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('grid', {name: 'Size test'})).toBeInTheDocument();
    });

    it('supports horizontal orientation', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          value="" 
          orientation="horizontal" 
          label="Orientation test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('grid', {name: 'Orientation test'})).toBeInTheDocument();
    });

    it('supports required state', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          value="" 
          isRequired 
          label="Required test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      const grid = screen.getByRole('grid', {name: 'Required test'});
      expect(grid).toBeInTheDocument();
      expect(screen.getByText('Required test')).toBeInTheDocument();
    });

    it('supports error message and validation', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          value="" 
          isInvalid 
          errorMessage="Please select an option"
          label="Validation test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      const grid = screen.getByRole('grid', {name: 'Validation test'});
      expect(grid).toBeInTheDocument();
      
      expect(screen.getByText('Please select an option')).toBeInTheDocument();
      
      const errorMessage = screen.getByText('Please select an option');
      expect(grid.getAttribute('aria-describedby')).toBe(errorMessage.id);
    });
  });

  describe('Controlled behavior', () => {
    it('handles initial value selection', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          value="option1" 
          label="Initial value test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('row', {name: 'Option 1'});
      const option2 = screen.getByRole('row', {name: 'Option 2'});
      
      expect(option1).toHaveAttribute('aria-selected', 'true');
      expect(option2).toHaveAttribute('aria-selected', 'false');
    });

    it('handles multiple selection with initial values', () => {
      render(
        <SelectBoxGroup 
          selectionMode="multiple" 
          onSelectionChange={() => {}}
          value={['option1', 'option2']}
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

      const option1 = screen.getByRole('row', {name: 'Option 1'});
      const option2 = screen.getByRole('row', {name: 'Option 2'});
      const option3 = screen.getByRole('row', {name: 'Option 3'});
      
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
          value=""
          label="Callback test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('row', {name: 'Option 1'});
      await userEvent.click(option1);
      
      expect(onSelectionChange).toHaveBeenCalledWith('option1');
    });

    it('calls onSelectionChange with array for multiple selection', async () => {
      const onSelectionChange = jest.fn();
      render(
        <SelectBoxGroup
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
          value={[]}
          label="Multiple callback test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('row', {name: 'Option 1'});
      await userEvent.click(option1);
      
      expect(onSelectionChange).toHaveBeenCalledWith(['option1']);
    });
  });

  describe('Form integration', () => {
    it('creates hidden inputs for form submission', () => {
      const {container} = render(
        <SelectBoxGroup
          selectionMode="multiple"
          onSelectionChange={() => {}}
          value={['option1', 'option2']}
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
          value="option1"
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
            value={['option1', 'option3']}
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
          value=""
          label="Individual disabled test">
          <SelectBox value="option1" isDisabled>
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(2);
    });

    it('prevents interaction with disabled items', async () => {
      const onSelectionChange = jest.fn();
      render(
        <SelectBoxGroup
          selectionMode="single"
          onSelectionChange={onSelectionChange}
          value=""
          label="Disabled interaction test">
          <SelectBox value="option1" isDisabled>
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const option1 = screen.getByRole('row', {name: 'Option 1'});
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
          value=""
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

      const grid = screen.getByRole('grid');
      const rows = screen.getAllByRole('row');
      
      expect(grid).toBeInTheDocument();
      expect(rows).toHaveLength(4);
      
      expect(grid).toHaveStyle('grid-template-columns: repeat(2, 1fr)');
      
      expect(screen.getByRole('row', {name: 'Option 1'})).toBeInTheDocument();
      expect(screen.getByRole('row', {name: 'Option 2'})).toBeInTheDocument();
      expect(screen.getByRole('row', {name: 'Option 3'})).toBeInTheDocument();
      expect(screen.getByRole('row', {name: 'Option 4'})).toBeInTheDocument();
    });

    it('supports space key selection', async () => {
      const onSelectionChange = jest.fn();
      render(
        <SelectBoxGroup
          selectionMode="single"
          onSelectionChange={onSelectionChange}
          value=""
          label="Space key test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );

      const grid = screen.getByRole('grid');
      await act(async () => {
        grid.focus();
      });
      
      await act(async () => {
        await userEvent.keyboard(' ');
      });
      expect(onSelectionChange).toHaveBeenCalledWith('option1');
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
        <SelectBoxGroup onSelectionChange={() => {}} value="" label="Min children test">
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
        <SelectBoxGroup onSelectionChange={() => {}} value="" label="Max children test">
          {manyChildren}
        </SelectBoxGroup>
      );
      
      expect(console.error).toHaveBeenCalledWith(
        'Invalid content. SelectBox cannot have more than 9 children.'
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper grid structure', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          value="" 
          label="ARIA test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
          <SelectBox value="option2">
            <Text slot="text">Option 2</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      
      expect(screen.getByRole('grid', {name: 'ARIA test'})).toBeInTheDocument();
      expect(screen.getAllByRole('row')).toHaveLength(2);
      expect(screen.getAllByRole('gridcell')).toHaveLength(2);
    });

    it('associates labels correctly', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          value="" 
          label="Choose option">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      
      const grid = screen.getByRole('grid', {name: 'Choose option'});
      expect(grid).toBeInTheDocument();
    });

    it('supports aria-describedby for error messages', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          value="" 
          isInvalid
          errorMessage="Error occurred"
          label="Error test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      
      const grid = screen.getByRole('grid');
      const errorMessage = screen.getByText('Error occurred');
      
      expect(grid).toHaveAttribute('aria-describedby');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles complex children with slots', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          value="" 
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
          value="" 
          label="Empty value test">
          <SelectBox value="">
            <Text slot="text">Empty Value</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      
      const row = screen.getByRole('row', {name: 'Empty Value'});
      expect(row).toBeInTheDocument();
    });

    it('handles different gutter widths', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          value="" 
          gutterWidth="compact" 
          label="Gutter test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('grid', {name: 'Gutter test'})).toBeInTheDocument();
    });

    it('handles emphasized style', () => {
      render(
        <SelectBoxGroup 
          selectionMode="single" 
          onSelectionChange={() => {}} 
          value="" 
          label="Emphasized test">
          <SelectBox value="option1">
            <Text slot="text">Option 1</Text>
          </SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('grid', {name: 'Emphasized test'})).toBeInTheDocument();
    });
  });
});


