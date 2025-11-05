// src/components/router/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import { LoginPage } from './../../features/auth/LoginPage';
import { PostsPage } from './../../features/posts/PostsPage';
import { PdfViewerPage } from '../../features/docs/PdfViewerPage';
import { UsersPage } from '../../features/users/UsersPage';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../layout/MainLayout';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<PostsPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/docs" element={<PdfViewerPage />} />
        </Route>
      </Route>

      {/* Ruta para 404 */}
      <Route path="*" element={<div>404 - No Encontrado</div>} />
    </Routes>
  );
};