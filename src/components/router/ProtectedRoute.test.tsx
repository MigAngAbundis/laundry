// src/components/router/ProtectedRoute.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import authReducer from '../../features/auth/authSlice';

describe('ProtectedRoute', () => {
  let store: ReturnType<typeof configureStore>;

  const createStore = (authState: any) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: authState,
      },
    });
  };

  const renderWithRouter = (store: ReturnType<typeof configureStore>, initialEntries = ['/protected']) => {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </Provider>
    );
  };

  describe('when user is authenticated', () => {
    it('should render protected content when token and user are present', () => {
      store = createStore({
        token: 'valid-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          gender: 'male',
          image: 'https://example.com/image.jpg',
        },
        status: 'succeeded',
        error: null,
      });

      renderWithRouter(store);
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('when user is not authenticated', () => {
    it('should not render protected content when no token', () => {
      store = createStore({
        token: null,
        user: null,
        status: 'idle',
        error: null,
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/protected']}>
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(store.getState().auth.token).toBeNull();
    });

    it('should not render protected content when no user', () => {
      store = createStore({
        token: 'some-token',
        user: null,
        status: 'idle',
        error: null,
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/protected']}>
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(store.getState().auth.user).toBeNull();
    });

    it('should not render protected content when both token and user are missing', () => {
      store = createStore({
        token: null,
        user: null,
        status: 'idle',
        error: null,
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/protected']}>
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(store.getState().auth.token).toBeNull();
      expect(store.getState().auth.user).toBeNull();
    });
  });

  describe('when loading', () => {
    it('should show loading spinner when status is loading', () => {
      store = createStore({
        token: 'token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          gender: 'male',
          image: 'https://example.com/image.jpg',
        },
        status: 'loading',
        error: null,
      });

      renderWithRouter(store);
      expect(screen.getByText(/Cargando sesión/i)).toBeInTheDocument();
    });
  });
});

