// src/features/users/UsersPage.tsx
import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchUsers, selectAllUsers } from './usersSlice';
import { showToast } from '../ui/uiSlice';

export const UsersPage = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const { status, error } = useAppSelector((state) => state.users);
  const [globalFilter, setGlobalFilter] = useState<string>('');

  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers({ limit: 12 }));
    }
  }, [dispatch, users.length]);

  // Helper para mostrar el nombre completo
  const fullNameBodyTemplate = (rowData: any) => {
    return `${rowData.firstName} ${rowData.lastName}`;
  };

  // Helper para mostrar la dirección completa
  const addressBodyTemplate = (rowData: any) => {
    if (!rowData.address) return '-';
    const { address, city, state, postalCode } = rowData.address;
    return `${address}, ${city}, ${state} ${postalCode}`;
  };

  // Helper para mostrar la compañía
  const companyBodyTemplate = (rowData: any) => {
    if (!rowData.company) return '-';
    return `${rowData.company.name} (${rowData.company.department})`;
  };

  // Helper para mostrar la imagen del usuario
  const imageBodyTemplate = (rowData: any) => {
    return (
      <img
        src={rowData.image || 'https://via.placeholder.com/40'}
        alt={`${rowData.firstName} ${rowData.lastName}`}
        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
        }}
      />
    );
  };

  // Header con búsqueda global
  const header = (
    <div className="flex flex-wrap justify-content-between gap-2">
      <h4 className="m-0">Gestión de Usuarios</h4>
      <div className="flex gap-2">
        <span className="p-input-icon-left" style={{ paddingLeft: '0.75rem' }}>
          <i className="pi pi-search" style={{ left: '1rem' }} />
          <InputText
            type="search"
            onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
            placeholder="Buscar usuario..."
            style={{ paddingLeft: '2.5rem' }}
          />
        </span>
        <Button
          icon="pi pi-refresh"
          label="Actualizar"
          onClick={() => dispatch(fetchUsers({ limit: 12 }))}
          loading={status === 'loading'}
        />
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="card">
        <Card>
          <div className="flex flex-column align-items-center justify-content-center gap-3" style={{ padding: '2rem' }}>
            <i className="pi pi-exclamation-triangle" style={{ fontSize: '3rem', color: 'var(--red-500)' }}></i>
            <h3>Error al cargar usuarios</h3>
            <p>{error}</p>
            <Button
              label="Reintentar"
              icon="pi pi-refresh"
              onClick={() => dispatch(fetchUsers({}))}
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="card">
      <DataTable
        value={users}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
        dataKey="id"
        loading={status === 'loading'}
        globalFilter={globalFilter}
        header={header}
        emptyMessage="No se encontraron usuarios."
        responsiveLayout="scroll"
      >
        <Column
          header="Foto"
          body={imageBodyTemplate}
          style={{ minWidth: '80px', textAlign: 'center' }}
        />
        <Column field="id" header="ID" sortable style={{ minWidth: '6rem' }} />
        <Column
          header="Nombre Completo"
          body={fullNameBodyTemplate}
          sortable
          sortField="firstName"
          style={{ minWidth: '16rem' }}
        />
        <Column field="username" header="Usuario" sortable style={{ minWidth: '12rem' }} />
        <Column field="email" header="Email" sortable style={{ minWidth: '18rem' }} />
        <Column field="phone" header="Teléfono" sortable style={{ minWidth: '12rem' }} />
        <Column field="age" header="Edad" sortable style={{ minWidth: '8rem' }} />
        <Column field="gender" header="Género" sortable style={{ minWidth: '10rem' }} />
        <Column
          header="Dirección"
          body={addressBodyTemplate}
          style={{ minWidth: '20rem' }}
        />
        <Column
          header="Compañía"
          body={companyBodyTemplate}
          style={{ minWidth: '16rem' }}
        />
      </DataTable>
    </div>
  );
};

