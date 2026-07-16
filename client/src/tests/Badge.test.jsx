import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../components/ui/Badge';

describe('Badge', () => {
  it('renders its children text', () => {
    render(<Badge status="approved">Approved</Badge>);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('maps a known status to its color class', () => {
    render(<Badge status="approved">Approved</Badge>);
    expect(screen.getByText('Approved')).toHaveClass('bg-brutal-green');
  });

  it('maps "rejected" to the pink/danger color', () => {
    render(<Badge status="rejected">Rejected</Badge>);
    expect(screen.getByText('Rejected')).toHaveClass('bg-brutal-pink');
  });

  it('falls back to yellow for an unrecognized status', () => {
    render(<Badge status="some_unknown_status">Mystery</Badge>);
    expect(screen.getByText('Mystery')).toHaveClass('bg-brutal-yellow');
  });

  it('derives the status from children when no status prop is passed', () => {
    render(<Badge>completed</Badge>);
    expect(screen.getByText('completed')).toHaveClass('bg-brutal-green');
  });

  it('normalizes spaces to underscores when matching status keys', () => {
    render(<Badge status="in progress">In Progress</Badge>);
    expect(screen.getByText('In Progress')).toHaveClass('bg-brutal-blue');
  });
});
