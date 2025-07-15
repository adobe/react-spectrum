import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
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
      <SelectBox value="option1">Option 1</SelectBox>
      <SelectBox value="option2">Option 2</SelectBox>
      <SelectBox value="option3">Option 3</SelectBox>
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
      <SelectBox value="option1">Option 1</SelectBox>
      <SelectBox value="option2">Option 2</SelectBox>
      <SelectBox value="option3">Option 3</SelectBox>
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
      <SelectBox value="option1">Option 1</SelectBox>
      <SelectBox value="option2">Option 2</SelectBox>
    </SelectBoxGroup>
  );
}

describe('SelectBox', () => {
  describe('Basic functionality', () => {
    it('renders single select mode', () => {
      render(<SingleSelectBox />);
      expect(screen.getAllByRole('radio')).toHaveLength(3);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('renders multiple select mode', () => {
      render(<MultiSelectBox />);
      expect(screen.getAllByRole('checkbox')).toHaveLength(3);
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('handles multiple selection', async () => {
      render(<MultiSelectBox />);
      const checkboxes = screen.getAllByRole('checkbox');
      const option1 = checkboxes.find(cb => cb.getAttribute('value') === 'option1')!;
      const option2 = checkboxes.find(cb => cb.getAttribute('value') === 'option2')!;
      
      await userEvent.click(option1);
      await userEvent.click(option2);
      
      expect(option1).toBeChecked();
      expect(option2).toBeChecked();
    });

    it('handles disabled state', () => {
      render(<DisabledSelectBox />);
      const inputs = screen.getAllByRole('radio');
      inputs.forEach(input => {
        expect(input).toBeDisabled();
      });
    });
  });

  describe('Props and configuration', () => {
    it('supports different sizes', () => {
      render(
        <SelectBoxGroup selectionMode="single" onSelectionChange={() => {}} value="" size="L" label="Size test">
          <SelectBox value="option1">Option 1</SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('radio')).toBeInTheDocument();
    });

    it('supports horizontal orientation', () => {
      render(
        <SelectBoxGroup selectionMode="single" onSelectionChange={() => {}} value="" orientation="horizontal" label="Orientation test">
          <SelectBox value="option1">Option 1</SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('radio')).toBeInTheDocument();
    });

    it('supports custom number of columns', () => {
      render(
        <SelectBoxGroup selectionMode="single" onSelectionChange={() => {}} value="" numColumns={3} label="Columns test">
          <SelectBox value="option1">Option 1</SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('radio')).toBeInTheDocument();
    });

    it('supports labels with aria-label', () => {
      render(
        <SelectBoxGroup selectionMode="single" onSelectionChange={() => {}} value="" label="Choose an option">
          <SelectBox value="option1">Option 1</SelectBox>
        </SelectBoxGroup>
      );
      
      expect(screen.getByLabelText('Choose an option')).toBeInTheDocument();
    });

    it('supports required state', () => {
      render(
        <SelectBoxGroup selectionMode="single" onSelectionChange={() => {}} value="" isRequired label="Required test">
          <SelectBox value="option1">Option 1</SelectBox>
        </SelectBoxGroup>
      );
      const group = screen.getByRole('radiogroup');
      expect(group).toBeRequired();
    });
  });

  describe('Controlled behavior', () => {
    it('handles initial value selection', () => {
      render(
        <SelectBoxGroup selectionMode="single" onSelectionChange={() => {}} value="option1" label="Initial value test">
          <SelectBox value="option1">Option 1</SelectBox>
          <SelectBox value="option2">Option 2</SelectBox>
        </SelectBoxGroup>
      );

      const radios = screen.getAllByRole('radio');
      const option1 = radios.find(radio => radio.getAttribute('value') === 'option1')!;
      expect(option1).toBeChecked();
    });

    it('handles multiple selection with initial values', () => {
      render(
        <SelectBoxGroup 
          selectionMode="multiple" 
          onSelectionChange={() => {}}
          value={['option1', 'option2']}
          label="Multiple initial test">
          <SelectBox value="option1">Option 1</SelectBox>
          <SelectBox value="option2">Option 2</SelectBox>
          <SelectBox value="option3">Option 3</SelectBox>
        </SelectBoxGroup>
      );

      const checkboxes = screen.getAllByRole('checkbox');
      const option1 = checkboxes.find(cb => cb.getAttribute('value') === 'option1')!;
      const option2 = checkboxes.find(cb => cb.getAttribute('value') === 'option2')!;
      const option3 = checkboxes.find(cb => cb.getAttribute('value') === 'option3')!;
      
      expect(option1).toBeChecked();
      expect(option2).toBeChecked();
      expect(option3).not.toBeChecked();
    });
  });

  describe('Controlled values', () => {
    it('handles controlled single selection', async () => {
      const ControlledSingleSelect = () => {
        const [value, setValue] = React.useState('option1');
        return (
          <SelectBoxGroup
            selectionMode="single"
            onSelectionChange={(val) => setValue(val as string)}
            value={value}
            label="Controlled single select">
            <SelectBox value="option1">Option 1</SelectBox>
            <SelectBox value="option2">Option 2</SelectBox>
            <SelectBox value="option3">Option 3</SelectBox>
          </SelectBoxGroup>
        );
      };

      render(<ControlledSingleSelect />);
      const radios = screen.getAllByRole('radio');
      const option1 = radios.find(radio => radio.getAttribute('value') === 'option1')!;
      const option2 = radios.find(radio => radio.getAttribute('value') === 'option2')!;
      
      expect(option1).toBeChecked();
      expect(option2).not.toBeChecked();
      
      await userEvent.click(option2);
      expect(option2).toBeChecked();
      expect(option1).not.toBeChecked();
    });

    it('handles controlled multiple selection', async () => {
      const ControlledMultiSelect = () => {
        const [value, setValue] = React.useState(['option1']);
        return (
          <SelectBoxGroup
            selectionMode="multiple"
            onSelectionChange={(val) => setValue(val as string[])}
            value={value}
            label="Controlled multi select">
            <SelectBox value="option1">Option 1</SelectBox>
            <SelectBox value="option2">Option 2</SelectBox>
            <SelectBox value="option3">Option 3</SelectBox>
          </SelectBoxGroup>
        );
      };

      render(<ControlledMultiSelect />);
      const checkboxes = screen.getAllByRole('checkbox');
      const option1 = checkboxes.find(cb => cb.getAttribute('value') === 'option1')!;
      const option2 = checkboxes.find(cb => cb.getAttribute('value') === 'option2')!;
      
      expect(option1).toBeChecked();
      expect(option2).not.toBeChecked();
      
      await userEvent.click(option2);
      expect(option1).toBeChecked();
      expect(option2).toBeChecked();
    });

         it('controlled value works as expected', () => {
       render(
         <SelectBoxGroup
           selectionMode="single"
           onSelectionChange={() => {}}
           value="option2"
           label="Controlled test">
           <SelectBox value="option1">Option 1</SelectBox>
           <SelectBox value="option2">Option 2</SelectBox>
         </SelectBoxGroup>
       );

       const radios = screen.getAllByRole('radio');
       const option1 = radios.find(radio => radio.getAttribute('value') === 'option1')!;
       const option2 = radios.find(radio => radio.getAttribute('value') === 'option2')!;
       
       expect(option1).not.toBeChecked();
       expect(option2).toBeChecked();
     });

    it('calls onSelectionChange when controlled value changes', async () => {
      const onSelectionChange = jest.fn();
      const ControlledWithCallback = () => {
        const [value, setValue] = React.useState('option1');
        return (
          <SelectBoxGroup
            selectionMode="single"
            onSelectionChange={(val) => {
              setValue(val as string);
              onSelectionChange(val);
            }}
            value={value}
            label="Controlled callback test">
            <SelectBox value="option1">Option 1</SelectBox>
            <SelectBox value="option2">Option 2</SelectBox>
          </SelectBoxGroup>
        );
      };

      render(<ControlledWithCallback />);
      const radios = screen.getAllByRole('radio');
      const option2 = radios.find(radio => radio.getAttribute('value') === 'option2')!;
      
      await userEvent.click(option2);
      expect(onSelectionChange).toHaveBeenCalledWith('option2');
    });

    it('handles external controlled value changes', () => {
      const ControlledExternal = ({externalValue}: {externalValue: string}) => (
        <SelectBoxGroup
          selectionMode="single"
          onSelectionChange={() => {}}
          value={externalValue}
          label="External controlled test">
          <SelectBox value="option1">Option 1</SelectBox>
          <SelectBox value="option2">Option 2</SelectBox>
        </SelectBoxGroup>
      );

      const {rerender} = render(<ControlledExternal externalValue="option1" />);
      const radios = screen.getAllByRole('radio');
      const option1 = radios.find(radio => radio.getAttribute('value') === 'option1')!;
      const option2 = radios.find(radio => radio.getAttribute('value') === 'option2')!;
      
      expect(option1).toBeChecked();
      expect(option2).not.toBeChecked();
      
      rerender(<ControlledExternal externalValue="option2" />);
      expect(option1).not.toBeChecked();
      expect(option2).toBeChecked();
    });
  });

  describe('Individual SelectBox behavior', () => {
    it('shows checkbox indicator when hovered', async () => {
      render(
        <SelectBoxGroup selectionMode="single" onSelectionChange={() => {}} value="" label="Hover test">
          <SelectBox value="option1">Option 1</SelectBox>
        </SelectBoxGroup>
      );
      
      const label = screen.getByText('Option 1').closest('label')!;
      await userEvent.hover(label);
      
      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
      });
    });

    it('handles disabled individual items', () => {
      render(
        <SelectBoxGroup
          selectionMode="single"
          onSelectionChange={() => {}}
          value="option2"
          label="Individual disabled test"
        >
          <SelectBox value="option1" isDisabled>Option 1</SelectBox>
          <SelectBox value="option2">Option 2</SelectBox>
        </SelectBoxGroup>
      );

      const radios = screen.getAllByRole('radio');
      const option1 = radios.find(radio => radio.getAttribute('value') === 'option1')!;
      const option2 = radios.find(radio => radio.getAttribute('value') === 'option2')!;
      
      expect(option1).toBeDisabled();
      expect(option2).not.toBeDisabled();
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
        expect.objectContaining({
          message: expect.stringContaining('at least a title')
        })
      );
    });

    it('validates maximum children', () => {
      const manyChildren = Array.from({length: 10}, (_, i) => (
        <SelectBox key={i} value={`option${i}`}>Option {i}</SelectBox>
      ));
      
      render(
        <SelectBoxGroup onSelectionChange={() => {}} value="" label="Max children test">
          {manyChildren}
        </SelectBoxGroup>
      );
      
      expect(console.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('more than 9 children')
        })
      );
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA roles', () => {
      render(
        <SelectBoxGroup selectionMode="single" onSelectionChange={() => {}} value="" label="ARIA test">
          <SelectBox value="option1">Option 1</SelectBox>
          <SelectBox value="option2">Option 2</SelectBox>
          <SelectBox value="option3">Option 3</SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });

    it('has proper ARIA roles for multiple selection', () => {
      render(
        <SelectBoxGroup selectionMode="multiple" onSelectionChange={() => {}} value={[]} label="ARIA multi test">
          <SelectBox value="option1">Option 1</SelectBox>
          <SelectBox value="option2">Option 2</SelectBox>
          <SelectBox value="option3">Option 3</SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('group')).toBeInTheDocument();
      expect(screen.getAllByRole('checkbox')).toHaveLength(3);
    });

    it('associates labels correctly', () => {
      render(
        <SelectBoxGroup selectionMode="single" onSelectionChange={() => {}} value="" label="Choose option">
          <SelectBox value="option1">Option 1</SelectBox>
        </SelectBoxGroup>
      );
      
      expect(screen.getByLabelText('Choose option')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles empty value', () => {
      render(
        <SelectBoxGroup selectionMode="single" onSelectionChange={() => {}} value="" label="Empty value test">
          <SelectBox value="">Empty</SelectBox>
        </SelectBoxGroup>
      );
      
      const radio = screen.getByRole('radio');
      expect(radio).toHaveAttribute('value', '');
    });

    it('handles complex children', () => {
      render(
        <SelectBoxGroup selectionMode="single" onSelectionChange={() => {}} value="" label="Complex children test">
          <SelectBox value="option1">
            <div>
              <h3>Title</h3>
              <p>Description</p>
            </div>
          </SelectBox>
        </SelectBoxGroup>
      );
      
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('handles different gutter widths', () => {
      render(
        <SelectBoxGroup selectionMode="single" onSelectionChange={() => {}} value="" gutterWidth="compact" label="Gutter test">
          <SelectBox value="option1">Option 1</SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('radio')).toBeInTheDocument();
    });

    it('handles emphasized style', () => {
      render(
        <SelectBoxGroup selectionMode="single" onSelectionChange={() => {}} value="" isEmphasized label="Emphasized test">
          <SelectBox value="option1">Option 1</SelectBox>
        </SelectBoxGroup>
      );
      expect(screen.getByRole('radio')).toBeInTheDocument();
    });
  });
});


