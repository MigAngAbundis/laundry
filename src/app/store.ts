// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import postsReducer from '../features/posts/postsSlice';
import usersReducer from '../features/users/usersSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    users: usersReducer,
    ui: uiReducer,
  },
});

// Inferir los tipos `RootState` y `AppDispatch`
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;