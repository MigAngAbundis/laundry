// src/components/PostForm.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { PostForm } from './PostForm';
import postsReducer from '../features/posts/postsSlice';
import usersReducer from '../features/users/usersSlice';
import uiReducer from '../features/ui/uiSlice';
import { LaundryTicket } from '../features/posts/types';
import { UserFilter } from '../features/users/usersSlice';

// Mock PrimeReact components
vi.mock('primereact/inputtext', () => ({
  InputText: ({ value, onChange, placeholder, ...props }: any) => (
    <input
      type="text"
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
      data-testid={props['data-testid'] || 'input-text'}
    />
  ),
}));

vi.mock('primereact/button', () => ({
  Button: ({ label, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {label}
    </button>
  ),
}));

vi.mock('primereact/dropdown', () => ({
  Dropdown: ({ value, onChange, options, placeholder, ...props }: any) => (
    <select
      value={value || ''}
      onChange={(e) => onChange({ value: e.target.value })}
      {...props}
      data-testid="dropdown"
    >
      <option value="">{placeholder}</option>
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock('primereact/calendar', () => ({
  Calendar: ({ value, onChange, ...props }: any) => (
    <input
      type="date"
      value={value ? value.toISOString().split('T')[0] : ''}
      onChange={(e) => onChange({ value: new Date(e.target.value) })}
      {...props}
      data-testid="calendar"
    />
  ),
}));

vi.mock('primereact/chips', () => ({
  Chips: ({ value, onChange, ...props }: any) => (
    <input
      type="text"
      value={value?.join(', ') || ''}
      onChange={(e) => onChange({ value: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
      {...props}
      data-testid="chips"
    />
  ),
}));

describe('PostForm', () => {
  let store: ReturnType<typeof configureStore>;
  const mockUsers: UserFilter[] = [
    {
      id: 1,
      username: 'user1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    {
      id: 2,
      username: 'user2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    },
  ];

  const mockTicket: LaundryTicket = {
    id: 1234,
    title: 'Test Ticket',
    userId: 1,
    dateReceived: '2025-01-01T10:00:00Z',
    dateDelivery: '2025-01-03T17:00:00Z',
    status: 'pending',
    tags: ['test'],
  };

  const mockOnSaveSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    store = configureStore({
      reducer: {
        posts: postsReducer,
        users: usersReducer,
        ui: uiReducer,
      },
      preloadedState: {
        users: {
          list: mockUsers,
          status: 'idle',
          error: null,
        },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = (ticket: LaundryTicket | null = null) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <PostForm ticket={ticket} onSaveSuccess={mockOnSaveSuccess} onCancel={mockOnCancel} />
        </BrowserRouter>
      </Provider>
    );
  };

  describe('Form rendering', () => {
    it('should render form in create mode with default values', () => {
      renderComponent(null);

      expect(screen.getByLabelText(/ID del Ticket/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Título/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Cliente/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Estado del Ticket/i)).toBeInTheDocument();
    });

    it('should render form in edit mode with ticket data', () => {
      renderComponent(mockTicket);

      const idInput = screen.getByLabelText(/ID del Ticket/i) as HTMLInputElement;
      const titleInput = screen.getByLabelText(/Título/i) as HTMLInputElement;

      expect(idInput.value).toBe('1234');
      expect(idInput.disabled).toBe(true); // ID should be disabled in edit mode
      expect(titleInput.value).toBe('Test Ticket');
    });

    it('should show helper text for ID field in create mode', () => {
      renderComponent(null);
      expect(screen.getByText(/Debe ser un número de 4 dígitos/i)).toBeInTheDocument();
    });
  });

  describe('Form validation', () => {
    it('should show error when ID is invalid (less than 4 digits)', async () => {
      renderComponent(null);

      const idInput = screen.getByLabelText(/ID del Ticket/i);
      fireEvent.change(idInput, { target: { value: '123' } });
      fireEvent.blur(idInput);

      const submitButton = screen.getByText(/Guardar/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/debe ser un número de exactamente 4 dígitos/i)).toBeInTheDocument();
      });
    });

    it('should show error when ID is invalid (more than 4 digits)', async () => {
      renderComponent(null);

      const idInput = screen.getByLabelText(/ID del Ticket/i);
      fireEvent.change(idInput, { target: { value: '12345' } });
      fireEvent.blur(idInput);

      const submitButton = screen.getByText(/Guardar/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/debe ser un número de exactamente 4 dígitos/i)).toBeInTheDocument();
      });
    });

    it('should show error when title is empty', async () => {
      renderComponent(null);

      const idInput = screen.getByLabelText(/ID del Ticket/i);
      fireEvent.change(idInput, { target: { value: '1234' } });

      const submitButton = screen.getByText(/Guardar/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/título es obligatorio/i)).toBeInTheDocument();
      });
    });

    it('should show error when user is not selected', async () => {
      renderComponent(null);

      const idInput = screen.getByLabelText(/ID del Ticket/i);
      const titleInput = screen.getByLabelText(/Título/i);

      fireEvent.change(idInput, { target: { value: '1234' } });
      fireEvent.change(titleInput, { target: { value: 'Test Ticket' } });

      const submitButton = screen.getByText(/Guardar/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/debe seleccionar un cliente/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form submission', () => {
    it('should call onCancel when cancel button is clicked', () => {
      renderComponent(null);

      const cancelButton = screen.getByText(/Cancelar/i);
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should show error toast when ID is missing in create mode', async () => {
      const dispatchSpy = vi.spyOn(store, 'dispatch');
      renderComponent(null);

      const titleInput = screen.getByLabelText(/Título/i);
      fireEvent.change(titleInput, { target: { value: 'Test Ticket' } });

      const submitButton = screen.getByText(/Guardar/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'ui/showToast',
            payload: expect.objectContaining({
              severity: 'error',
              detail: 'El ID del ticket es requerido',
            }),
          })
        );
      });
    });
  });

  describe('User dropdown', () => {
    it('should populate user options from Redux store', () => {
      renderComponent(null);

      const userDropdown = screen.getByTestId('dropdown');
      expect(userDropdown).toBeInTheDocument();

      const options = Array.from(userDropdown.querySelectorAll('option'));
      expect(options.length).toBeGreaterThan(1); // At least 1 placeholder + users
    });
  });
});

