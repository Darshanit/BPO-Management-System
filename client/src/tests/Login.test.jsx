import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import Login from '../pages/auth/Login';
import { AuthProvider } from '../contexts/AuthContext';

// Mock the auth service so no real network calls happen during tests
vi.mock('../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    refresh: vi.fn().mockRejectedValue(new Error('no session')),
    getMe: vi.fn(),
  },
}));

import { authService } from '../services/auth.service';

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );

describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authService.refresh.mockRejectedValue(new Error('no session'));
  });

  it('renders email and password fields plus a submit button', async () => {
    renderLogin();
    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting an empty form', async () => {
    const user = userEvent.setup();
    renderLogin();

    await screen.findByLabelText(/email/i);
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('calls authService.login with the entered credentials on submit', async () => {
    authService.login.mockResolvedValue({
      data: { data: { accessToken: 'fake-token', user: { name: 'Jane', role: 'employee' } } },
    });

    const user = userEvent.setup();
    renderLogin();

    await user.type(await screen.findByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'jane@example.com',
        password: 'Password123',
      });
    });
  });
});
