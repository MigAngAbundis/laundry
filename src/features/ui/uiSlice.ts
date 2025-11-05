// src/features/ui/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ToastMessage {
  severity: 'success' | 'info' | 'warn' | 'error';
  summary: string;
  detail: string;
}

interface UiState {
  toast: ToastMessage | null;
  isLoading: boolean;
}

const initialState: UiState = {
  toast: null,
  isLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<ToastMessage>) => {
      state.toast = action.payload;
    },
    hideToast: (state) => {
      state.toast = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { showToast, hideToast, setLoading } = uiSlice.actions;
export default uiSlice.reducer;