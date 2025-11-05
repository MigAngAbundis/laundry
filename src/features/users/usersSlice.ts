// src/features/users/usersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { apiRequest } from '../../config/api';

// Tipo de usuario basado en la estructura de dummyjson.com
export interface UserFilter {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  image?: string;
  age?: number;
  gender?: string;
  address?: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  company?: {
    name: string;
    department: string;
  };
}

// Tipo de respuesta de dummyjson.com
interface DummyJsonUsersResponse {
  users: UserFilter[];
  total: number;
  skip: number;
  limit: number;
}

export interface UsersState {
  list: UserFilter[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: UsersState = {
  list: [],
  status: 'idle',
  error: null,
};

// Fetch users from backend API (which fetches from dummyjson.com)
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: { limit?: number } = {}, { rejectWithValue }) => {
    try {
      const limit = params.limit || 100;
      const response = await apiRequest(`/users?limit=${limit}`);
      const data = await response.json();
      return data.users as UserFilter[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Error al cargar usuarios');
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<UserFilter[]>) => {
        state.status = 'idle';
        state.list = action.payload;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = usersSlice.actions;

// Selectores
export const selectAllUsers = (state: RootState) => state.users.list;

export default usersSlice.reducer;