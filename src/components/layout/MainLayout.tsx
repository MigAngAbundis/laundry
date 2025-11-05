// src/components/layout/MainLayout.tsx
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';

export const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    {
      label: 'Tickets',
      icon: 'pi pi-list',
      command: () => navigate('/posts'),
      className: location.pathname === '/posts' || location.pathname === '/' ? 'active-route' : '',
    },
    {
      label: 'Usuarios',
      icon: 'pi pi-users',
      command: () => navigate('/users'),
      className: location.pathname === '/users' ? 'active-route' : '',
    },
    {
      label: 'Documentos PDF',
      icon: 'pi pi-file-pdf',
      command: () => navigate('/docs'),
      className: location.pathname === '/docs' ? 'active-route' : '',
    },
  ];

  const endTemplate = () => (
    <div className="flex align-items-center gap-2">
      <span className="text-sm">
        <i className="pi pi-user mr-2"></i>
        {user?.firstName} {user?.lastName}
      </span>
      <Button
        label="Cerrar Sesión"
        icon="pi pi-sign-out"
        className="p-button-text p-button-danger"
        onClick={handleLogout}
      />
    </div>
  );

  return (
    <div className="main-layout">
      <Menubar model={menuItems} end={endTemplate} className="mb-3" />
      <div className="layout-content">
        <Outlet />
      </div>
    </div>
  );
};

