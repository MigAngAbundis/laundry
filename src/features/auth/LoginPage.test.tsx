// src/features/auth/LoginPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { LoginPage } from './LoginPage';
import authReducer from './authSlice';
import uiReducer from '../ui/uiSlice';

// Mock PrimeReact components
vi.mock('primereact/card', () => ({
  Card: ({ title, children, ...props }: any) => (
    <div data-testid="card" {...props}>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

vi.mock('primereact/inputtext', () => ({
  InputText: ({ value, onChange, ...props }: any) => (
    <input
      type="text"
      value={value || ''}
      onChange={onChange}
      {...props}
      data-testid={props['data-testid'] || 'input-text'}
    />
  ),
}));

vi.mock('primereact/password', () => ({
  Password: ({ value, onChange, ...props }: any) => (
    <input
      type="password"
      value={value || ''}
      onChange={onChange}
      {...props}
      data-testid="password-input"
    />
  ),
}));

vi.mock('primereact/button', () => ({
  Button: ({ label, onClick, disabled, loading, ...props }: any) => (
    <button onClick={onClick} disabled={disabled || loading} {...props}>
      {loading ? 'Loading...' : label}
    </button>
  ),
}));

// Mock react-router-dom before imports
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    store = configureStore({
      reducer: {
        auth: authReducer,
        ui: uiReducer,
      },
      preloadedState: {
        auth: {
          token: null,
          user: null,
          status: 'idle',
          error: null,
        },
      },
    });
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );
  };

  describe('Form rendering', () => {
    it('should render login form with default values', () => {
      renderComponent();

      expect(screen.getByText(/Inicio de Sesión/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Usuario/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
      expect(screen.getByText(/Ingresar/i)).toBeInTheDocument();

      const usernameInput = screen.getByLabelText(/Usuario/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/Contraseña/i) as HTMLInputElement;

      expect(usernameInput.value).toBe('kminchelle');
      expect(passwordInput.value).toBe('admin123');
    });

    it('should show submit button', () => {
      renderComponent();
      expect(screen.getByText(/Ingresar/i)).toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('should show error when username is empty', async () => {
      renderComponent();

      const usernameInput = screen.getByLabelText(/Usuario/i);
      fireEvent.change(usernameInput, { target: { value: '' } });
      fireEvent.blur(usernameInput);

      const submitButton = screen.getByText(/Ingresar/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/usuario es obligatorio/i)).toBeInTheDocument();
      });
    });

    it('should show error when password is empty', async () => {
      renderComponent();

      const passwordInput = screen.getByLabelText(/Contraseña/i);
      fireEvent.change(passwordInput, { target: { value: '' } });
      fireEvent.blur(passwordInput);

      const submitButton = screen.getByText(/Ingresar/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/contraseña es obligatoria/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading state', () => {
    it('should show loading state when status is loading', () => {
      store = configureStore({
        reducer: {
          auth: authReducer,
          ui: uiReducer,
        },
        preloadedState: {
          auth: {
            token: null,
            user: null,
            status: 'loading',
            error: null,
          },
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter>
            <LoginPage />
          </MemoryRouter>
        </Provider>
      );

      const submitButton = screen.getByText(/Loading/i);
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form submission', () => {
    it('should have submit button enabled when form is valid', () => {
      renderComponent();
      const submitButton = screen.getByText(/Ingresar/i);
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });
});

