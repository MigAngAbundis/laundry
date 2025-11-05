// src/features/auth/LoginPage.tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';

import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { loginUser } from './authSlice';
import { showToast } from '../ui/uiSlice';
import { LoginCredentials } from './types';

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, status, error } = useAppSelector((state) => state.auth);

  // Pre-llenamos con las credenciales de prueba
  const { control, handleSubmit, formState: { errors } } = useForm<LoginCredentials>({
    defaultValues: {
      username: 'kminchelle',
      password: 'admin123',
    },
  });

  // 1. Redirigir si ya está logueado
  useEffect(() => {
    if (token) {
      navigate('/posts', { replace: true });
    }
  }, [token, navigate]);

  // 2. Handler para el submit del formulario
  const onSubmit = async (data: LoginCredentials) => {
    try {
      // 'unwrap' maneja el 'rejectWithValue' y lanzará un error si falla
      await dispatch(loginUser(data)).unwrap(); 
      
      // El 'useEffect' de arriba se encargará de la redirección
      dispatch(showToast({
        severity: 'success',
        summary: '¡Bienvenido!',
        detail: 'Login exitoso.'
      }));

    } catch (rejectedValueOrSerializedError) {
      // El error viene del 'rejectWithValue' en el slice
      dispatch(showToast({
        severity: 'error',
        summary: 'Error de Login',
        detail: (rejectedValueOrSerializedError as string) || 'Credenciales incorrectas'
      }));
    }
  };

  // 3. Helper para mostrar errores de validación de RHF
  const getFormErrorMessage = (name: 'username' | 'password') => {
    return errors[name] && <small className="p-error">{errors[name]?.message}</small>;
  };

  return (
    <div className="flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Card title="Inicio de Sesión" style={{ width: '25rem' }}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
          
          {/* Campo Username */}
          <div className="field">
            <label htmlFor="username">Usuario</label>
            <Controller
              name="username"
              control={control}
              rules={{ required: 'El usuario es obligatorio.' }}
              render={({ field, fieldState }) => (
                <InputText
                  id={field.name}
                  {...field}
                  autoFocus
                  className={classNames({ 'p-invalid': fieldState.error })}
                />
              )}
            />
            {getFormErrorMessage('username')}
          </div>

          {/* Campo Password */}
          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <Controller
              name="password"
              control={control}
              rules={{ required: 'La contraseña es obligatoria.' }}
              render={({ field, fieldState }) => (
                <Password
                  id={field.name}
                  {...field}
                  toggleMask
                  feedback={false}
                  className={classNames({ 'p-invalid': fieldState.error })}
                />
              )}
            />
            {getFormErrorMessage('password')}
          </div>

          {/* Botón de Submit */}
          <div className="field">
            <Button
              type="submit"
              label="Ingresar"
              icon="pi pi-sign-in"
              loading={status === 'loading'}
              className="mt-2"
            />
          </div>
        </form>
      </Card>
    </div>
  );
};