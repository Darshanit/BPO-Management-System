import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/ui/Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);

    fireEvent.click(screen.getByText('Submit'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies the yellow variant background class by default', () => {
    render(<Button>Default</Button>);
    expect(screen.getByText('Default')).toHaveClass('bg-brutal-yellow');
  });

  it('applies a different variant background class when specified', () => {
    render(<Button variant="pink">Danger</Button>);
    expect(screen.getByText('Danger')).toHaveClass('bg-brutal-pink');
  });

  it('is disabled and does not fire onClick when disabled prop is set', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
