// src/features/auth/authSlice.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logout, clearError, fetchCurrentUser } from './authSlice';
import type { AuthState, User } from './types';
import * as apiModule from '../../config/api';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock the api module
vi.mock('../../config/api', () => ({
  apiRequest: vi.fn(),
  getAuthToken: vi.fn(() => null),
}));

describe('authSlice reducer', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    gender: 'male',
    image: 'https://example.com/image.jpg',
  };

  const initialState: AuthState = {
    user: mockUser,
    token: 'test-token',
    status: 'succeeded',
    error: null,
  };

  it('should handle initial state', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
  });

  it('should handle logout', () => {
    const state = authReducer(initialState, logout());
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
  });

  it('should clear error', () => {
    const stateWithError: AuthState = {
      ...initialState,
      error: 'Some error',
    };
    const state = authReducer(stateWithError, clearError());
    expect(state.error).toBeNull();
  });

  describe('fetchCurrentUser', () => {
    it('should fetch current user successfully', async () => {
      // Mock successful API response
      vi.mocked(apiModule.apiRequest).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response);

      // Act
      const result = await store.dispatch(fetchCurrentUser());

      // Assert
      expect(result.type).toBe('auth/fetchCurrentUser/fulfilled');
      expect(result.payload).toEqual(mockUser);

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.status).toBe('succeeded');
      expect(state.error).toBeNull();
    });

    it('should handle fetch current user error', async () => {
      // Mock API error
      vi.mocked(apiModule.apiRequest).mockRejectedValueOnce(
        new Error('Unauthorized')
      );

      // Act
      const result = await store.dispatch(fetchCurrentUser());

      // Assert
      expect(result.type).toBe('auth/fetchCurrentUser/rejected');
      
      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Unauthorized');
    });
  });
});
