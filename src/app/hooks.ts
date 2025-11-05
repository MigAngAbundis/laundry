// src/app/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Usa estos hooks tipados en toda tu aplicación en lugar de `useDispatch` y `useSelector` planos
export function useAppDispatch() {
  return useDispatch<AppDispatch>();
}

export function useAppSelector<T>(selector: (state: RootState) => T): T {
  return useSelector(selector);
}