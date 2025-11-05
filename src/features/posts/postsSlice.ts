// src/features/posts/postsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { LaundryTicket, NewLaundryTicket, PostsState } from './types';
import { apiRequest } from '../../config/api';

// Estado inicial
const initialState: PostsState = {
  tickets: [],
  status: 'idle',
  error: null,
};

// --- Async Thunks ---

// GET /posts?limit=10&skip=0
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (params: { limit?: number; skip?: number } = {}, { rejectWithValue }) => {
    try {
      const limit = params?.limit || 10;
      const skip = params?.skip || 0;
      const response = await apiRequest(`/posts?limit=${limit}&skip=${skip}`);
      const data = await response.json();
      return data.posts as LaundryTicket[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// GET /posts/search?q=<texto>
export const searchPosts = createAsyncThunk(
  'posts/searchPosts',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/posts/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.posts as LaundryTicket[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// POST /posts/add
export const addNewPost = createAsyncThunk(
  'posts/addNewPost',
  async (newTicket: NewLaundryTicket | LaundryTicket, { rejectWithValue }) => {
    try {
      const response = await apiRequest('/posts/add', {
        method: 'POST',
        body: JSON.stringify(newTicket),
      });
      return await response.json() as LaundryTicket;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// PUT /posts/:id
export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async (updatedTicket: LaundryTicket, { rejectWithValue }) => {
    try {
      const response = await apiRequest(`/posts/${updatedTicket.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedTicket),
      });
      return await response.json() as LaundryTicket;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// DELETE /posts/:id
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (ticketId: number, { rejectWithValue }) => {
    try {
      await apiRequest(`/posts/${ticketId}`, {
        method: 'DELETE',
      });
      return ticketId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// --- El Slice ---

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Aquí irían reductores síncronos si los necesitaras
    // ej: setFilter, clearSelection, etc.
  },
  // Manejo de los thunks asíncronos
  extraReducers: (builder) => {
    builder
      // GET /posts
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<LaundryTicket[]>) => {
        state.status = 'succeeded';
        state.tickets = action.payload;
        state.error = null;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || action.error.message || null;
      })
      
      // GET /posts/search
      .addCase(searchPosts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(searchPosts.fulfilled, (state, action: PayloadAction<LaundryTicket[]>) => {
        state.status = 'succeeded';
        state.tickets = action.payload;
        state.error = null;
      })
      .addCase(searchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || action.error.message || null;
      })
      
      // POST /posts/add
      .addCase(addNewPost.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(addNewPost.fulfilled, (state, action: PayloadAction<LaundryTicket>) => {
        state.status = 'succeeded';
        state.tickets.push(action.payload);
        state.error = null;
      })
      .addCase(addNewPost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || action.error.message || null;
      })
      
      // PUT /posts/:id
      .addCase(updatePost.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action: PayloadAction<LaundryTicket>) => {
        state.status = 'succeeded';
        const updatedTicket = action.payload;
        const index = state.tickets.findIndex(t => t.id === updatedTicket.id);
        if (index !== -1) {
          state.tickets[index] = updatedTicket;
        }
        state.error = null;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || action.error.message || null;
      })
      
      // DELETE /posts/:id
      .addCase(deletePost.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action: PayloadAction<number>) => {
        state.status = 'succeeded';
        const deletedId = action.payload;
        state.tickets = state.tickets.filter(t => t.id !== deletedId);
        state.error = null;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string || action.error.message || null;
      });
  },
});

// Selectores (opcional pero recomendado)
export const selectAllPosts = (state: RootState) => state.posts.tickets;
export const selectPostsStatus = (state: RootState) => state.posts.status;

export default postsSlice.reducer;