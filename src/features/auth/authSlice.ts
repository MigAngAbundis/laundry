// src/features/auth/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials, User } from './types';

// Constants for localStorage keys
const STORAGE_KEY_TOKEN = 'auth_token';
const STORAGE_KEY_USER = 'auth_user';

// Helper functions for localStorage persistence
const saveAuthToStorage = (token: string, user: User): void => {
  try {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save auth data to localStorage:', error);
  }
};

const loadAuthFromStorage = (): { token: string | null; user: User | null } => {
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEY_USER);
    
    if (!token || !userStr) {
      return { token: null, user: null };
    }
    
    const user = JSON.parse(userStr) as User;
    return { token, user };
  } catch (error) {
    console.error('Failed to load auth data from localStorage:', error);
    // Clear corrupted data
    clearAuthFromStorage();
    return { token: null, user: null };
  }
};

const clearAuthFromStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
  } catch (error) {
    console.error('Failed to clear auth data from localStorage:', error);
  }
};

// Import API helper
import { apiRequest } from '../../config/api';

// Mock API function (simulates login) - Keep for now as backend doesn't have login endpoint
const mockLoginAPI = (creds: LoginCredentials): Promise<{ token: string; user: User }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (creds.username === 'kminchelle' && creds.password === 'admin123') {
        const mockToken = 'jwt-mock-token-12345';
        resolve({
          token: mockToken,
          user: { 
            id: 1, 
            username: 'kminchelle', 
            email: 'kmin@example.com',
            firstName: 'Kmin',
            lastName: 'Chell',
            gender: 'female',
            image: 'https://i.pravatar.cc/150?img=1',
          },
        });
      } else {
        reject(new Error('Credenciales incorrectas'));
      }
    }, 500);
  });
};

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const data = await mockLoginAPI(credentials);
      // Persist both token and user to localStorage
      saveAuthToStorage(data.token, data.user);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// GET /auth/me - Get current user profile
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiRequest('/auth/me');
      const user = await response.json() as User;
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user');
    }
  }
);

export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const { token } = loadAuthFromStorage();
      
      if (!token) {
        return rejectWithValue('No session found');
      }
      
      // Validate token with backend by fetching user profile
      const result = await dispatch(fetchCurrentUser());
      
      if (fetchCurrentUser.fulfilled.match(result)) {
        return { token, user: result.payload };
      } else {
        throw new Error(result.payload as string || 'Failed to fetch user');
      }
    } catch (error: any) {
      // Clear invalid session data
      clearAuthFromStorage();
      return rejectWithValue(error.message || 'Session expired');
    }
  }
);

// Initialize state with stored auth data
const storedAuth = loadAuthFromStorage();
const initialState: AuthState = {
  user: storedAuth.user,
  token: storedAuth.token,
  status: 'idle',
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      clearAuthFromStorage();
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.token = null;
        state.user = null;
      })
      // Fetch current user cases
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.user = null;
      })
      // Restore session cases
      .addCase(restoreSession.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload as string;
        state.token = null;
        state.user = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;