// src/App.tsx
import React, { useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { AppRoutes } from '@/components/router/AppRoutes';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { hideToast } from '@/features/ui/uiSlice';
import { restoreSession } from '@/features/auth/authSlice';
import { ConfirmDialog } from 'primereact/confirmdialog';

function App() {
  const toast = useRef<Toast>(null);
  const { toast: toastMessage } = useAppSelector((state) => state.ui);
  const { token, user, status } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Restore and validate session on app mount if we have stored auth data
  // This ensures the session is valid even after page reload
  useEffect(() => {
    // Run once on mount to validate stored session
    // Check localStorage directly to avoid closure issues
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken && status === 'idle') {
      dispatch(restoreSession());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    if (toastMessage && toast.current) {
      toast.current.show(toastMessage);
      // Limpiar el toast del estado después de mostrarlo
      dispatch(hideToast());
    }
  }, [toastMessage, dispatch]);

  return (
    <div className="app">
      {/* Toast y Dialogs globales */}
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* El Navbar/Logout iría aquí o en un Layout */}
      
      <main className="app-content">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;