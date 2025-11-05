// src/features/auth/types.ts

// Lo que envías en el body del POST /auth/login
export interface LoginCredentials {
    username: string;
    password: string;
  }
  
  // El objeto de usuario que recibes del API (ej. /auth/me)
  export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    image: string;
    // ...puedes añadir más campos que esperes del API
  }
  
  // Cómo se ve el estado de autenticación en tu store de Redux
  export interface AuthState {
    user: User | null;
    token: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null | undefined; // 'undefined' es para el 'rejectWithValue'
  }