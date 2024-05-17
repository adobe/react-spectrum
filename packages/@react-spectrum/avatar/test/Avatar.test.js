import {Avatar} from '../';
import React from 'react';
import {render, screen} from '@react-spectrum/test-utils-internal';

describe('Avatar', () => {
  it('renders an avatar image', () => {
    render(<Avatar src="http://localhost/some_image.png" />);
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'http://localhost/some_image.png');
  });

  it('can render an avatar image with an alt', () => {
    render(<Avatar src="http://localhost/some_image.png" alt="Test avatar" />);
    expect(screen.getByAltText(/test avatar/i)).toBeInTheDocument();
  });

  describe('when given a custom size', () => {
    it('supports custom sizes in units, such as pixels', () => {
      render(<Avatar src="http://localhost/some_image.png" size="80px" />);
      expect(screen.getByRole('img')).toHaveStyle({
        height: '80px',
        width: '80px'
      });
    });

    it('supports custom sizes in numbers', () => {
      render(<Avatar src="http://localhost/some_image.png" size={80} />);
      expect(screen.getByRole('img')).toHaveStyle({
        height: '80px',
        width: '80px'
      });
    });
  });

  it('supports custom class names', () => {
    render(<Avatar src="http://localhost/some_image.png" UNSAFE_className="my-class" />);
    expect(screen.getByRole('img')).toHaveAttribute('class', expect.stringContaining('my-class'));
  });

  it('supports style props', () => {
    render(<Avatar src="http://localhost/some_image.png" isHidden />);
    expect(screen.getByRole('img', {hidden: true})).toBeInTheDocument();
  });

  it('supports custom DOM props', () => {
    render(<Avatar src="http://localhost/some_image.png" data-testid="Test avatar" />);
    expect(screen.getByTestId(/test avatar/i)).toBeInTheDocument();
  });

  describe('when isDisabled = true', () => {
    it('renders a disabled avatar image', () => {
      render(<Avatar src="http://localhost/some_image.png" isDisabled />);
      expect(screen.getByRole('img')).toHaveAttribute('class', expect.stringMatching(/disabled/i));
    });
  });
});
