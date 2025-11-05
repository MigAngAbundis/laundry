// src/features/posts/components/PostsTable.tsx
import React, { useState, useEffect, useRef } from 'react';
import { DataTable, DataTableFilterMeta } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { confirmDialog } from 'primereact/confirmdialog';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useAppDispatch, useAppSelector } from '../../../src/app/hooks';
import { fetchPosts, deletePost } from './postsSlice';
import { fetchUsers, selectAllUsers } from '../users/usersSlice';
import { LaundryTicket } from '../../features/posts/types';
import { showToast } from '../ui/uiSlice';

// En Vite, los archivos en public/ se sirven desde la raíz
const samplePdf = '/assets/laundry-ticket.pdf';

// Configuración del Worker - usar el worker local desde public/
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
console.log('PDF.js Worker URL:', pdfjs.GlobalWorkerOptions.workerSrc);
// Importa PostsToolbar si lo separaste

// --- Añade la prop interface ---
interface PostsTableProps {
    onEditTicket: (ticket: LaundryTicket) => void;
  }

export const PostsTable = ({ onEditTicket }: PostsTableProps) => {  const dispatch = useAppDispatch();
  const { tickets, status } = useAppSelector((state) => state.posts);
  const users = useAppSelector(selectAllUsers);
  
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<LaundryTicket | null>(null);
  const [isPdfDialogVisible, setIsPdfDialogVisible] = useState<boolean>(false);
  const [numPages, setNumPages] = useState<number>(0);
  
  // Opciones para filtros
  const statusOptions = [
    { label: 'Pendiente', value: 'pending' },
    { label: 'Procesando', value: 'processing' },
    { label: 'Listo', value: 'ready' },
    { label: 'Entregado', value: 'delivered' },
  ];

  useEffect(() => {
    dispatch(fetchPosts({ limit: 10, skip: 0 }));
    dispatch(fetchUsers({ limit: 100 }));
  }, [dispatch]);

  // Helper para buscar nombre de usuario
  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Desconocido';
  };

  // ---- Templates de Cuerpo y Filtro ---- //

  const statusBodyTemplate = (rowData: LaundryTicket) => {
    const severityMap: Record<LaundryTicket['status'], 'warning' | 'info' | 'success' | 'secondary'> = {
      pending: 'warning',
      processing: 'info',
      ready: 'success',
      delivered: 'secondary',
    };
    return <Tag severity={severityMap[rowData.status]} value={rowData.status.toUpperCase()} />;
  };

  const actionBodyTemplate = (rowData: LaundryTicket) => {
    return (
      <React.Fragment>
        <Button icon="pi pi-eye" rounded text className="mr-2" onClick={() => viewTicket(rowData)} />
        
        {/* ESTE ES EL CAMBIO */}
        <Button 
          icon="pi pi-pencil" 
          rounded 
          text 
          className="mr-2" 
          onClick={() => onEditTicket(rowData)} // <-- Llama a la prop
        />
        
        <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => confirmDeleteTicket(rowData)} />
      </React.Fragment>
    );
  };
  
  // Filtro de Usuario (Dropdown)
  const userFilterTemplate = (options: any) => {
    return (
      <Dropdown
        value={options.value}
        options={users.map(u => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }))}
        onChange={(e) => options.filterCallback(e.value === null ? null : e.value)}
        placeholder="Buscar por usuario"
        className="p-column-filter"
        showClear
      />
    );
  };

  // Filtro de Status (MultiSelect)
  const statusFilterTemplate = (options: any) => {
    return (
      <MultiSelect
        value={options.value}
        options={statusOptions}
        onChange={(e) => options.filterCallback(e.value === null || e.value.length === 0 ? null : e.value)}
        placeholder="Filtrar status"
        className="p-column-filter"
      />
    );
  };
  
  // ---- Acciones ---- //
  
  const viewTicket = (ticket: LaundryTicket) => {
    // Abrir el Dialog con el PDF
    console.log('Opening PDF dialog for ticket:', ticket.id);
    setIsPdfDialogVisible(true);
    setNumPages(0); // Reset pages when opening
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    console.log('PDF loaded successfully, pages:', numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  };


  const confirmDeleteTicket = (ticket: LaundryTicket) => {
    confirmDialog({
      message: '¿Estás seguro de que quieres eliminar este ticket?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: () => deleteTicket(ticket),
      reject: () => {},
    });
  };

  const deleteTicket = async (ticket: LaundryTicket) => {
    try {
      await dispatch(deletePost(ticket.id)).unwrap();
      dispatch(showToast({ 
        severity: 'success', 
        summary: 'Eliminado', 
        detail: `Ticket ${ticket.id} eliminado correctamente` 
      }));
    } catch (error: any) {
      dispatch(showToast({ 
        severity: 'error', 
        summary: 'Error', 
        detail: `No se pudo eliminar el ticket: ${error || 'Error desconocido'}` 
      }));
    }
  };

  // ---- Header de la Tabla (con Toolbar y Búsqueda Global) ---- //

    const header = (
        <div className="flex flex-wrap justify-content-between gap-2">
          <h4 className="m-0">Gestionar Tickets</h4>
          <span className="p-input-icon-left" style={{ paddingLeft: '0.75rem' }}>
            <i className="pi pi-search" style={{ left: '1rem' }} />
            <InputText
              type="search"
              onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
              placeholder="Buscar ticket..."
              style={{ paddingLeft: '2.5rem' }}
            />
          </span>
          {/* El botón "Nuevo Ticket" se ha movido a PostsPage.tsx */}
        </div>
      );

  return (
    <div className="card">
      <DataTable
        value={tickets}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} tickets"
        dataKey="id"
        loading={status === 'loading'}
        globalFilter={globalFilter}
        header={header}
        emptyMessage="No se encontraron tickets."
        selection={selectedTicket}
        onSelectionChange={(e) => setSelectedTicket(e.value as LaundryTicket)}
        selectionMode="single" // o 'checkbox' para múltiple
        // Filtros
        filterDisplay="menu" // 'row' o 'menu'
      >
        <Column field="id" header="ID" sortable style={{ minWidth: '6rem' }} />
        <Column field="title" header="Título" sortable style={{ minWidth: '16rem' }} />
        <Column
          field="userId"
          header="Usuario"
          body={(rowData) => getUserName(rowData.userId)}
          filter
          dataType="numeric"
          filterMatchMode="equals"
          filterElement={userFilterTemplate}
          showFilterMatchModes={false}
          style={{ minWidth: '12rem' }}
        />
        <Column field="dateReceived" header="Recibido" sortable body={(rowData) => new Date(rowData.dateReceived).toLocaleDateString()} />
        <Column field="dateDelivery" header="Entrega" sortable body={(rowData) => new Date(rowData.dateDelivery).toLocaleDateString()} />
        <Column
          field="status"
          header="Status"
          body={statusBodyTemplate}
          filter
          filterMatchMode="in"
          filterElement={statusFilterTemplate}
          showFilterMatchModes={false}
          style={{ minWidth: '10rem' }}
        />
        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '12rem' }} />
      </DataTable>

      {/* Dialog para mostrar el PDF */}
      <Dialog
        visible={isPdfDialogVisible}
        style={{ width: '90vw', maxWidth: '1200px' }}
        header="Ticket de Lavandería"
        modal
        onHide={() => {
          console.log('Dialog closing');
          setIsPdfDialogVisible(false);
        }}
        footer={
          <Button 
            label="Cerrar" 
            icon="pi pi-times" 
            onClick={() => setIsPdfDialogVisible(false)} 
            className="p-button-text" 
          />
        }
      >
        <div style={{ maxHeight: '80vh', overflow: 'auto', textAlign: 'center', padding: '1rem' }}>
          <p className="mb-3">PDF Path: {samplePdf}</p>
          <Document
            file={samplePdf}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                  <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-3">Cargando PDF...</p>
                </div>
              </div>
            }
            error={
              <div className="flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                  <i className="pi pi-exclamation-triangle" style={{ fontSize: '2rem', color: 'var(--red-500)' }}></i>
                  <p className="mt-3">Error al cargar el PDF.</p>
                  <p className="text-sm text-color-secondary mt-2">Verifica la consola para más detalles.</p>
                  <p className="text-xs text-color-secondary mt-2">Worker URL: {pdfjs.GlobalWorkerOptions.workerSrc}</p>
                  <p className="text-xs text-color-secondary">PDF Path: {String(samplePdf)}</p>
                </div>
              </div>
            }
          >
            {numPages > 0 && (
              <Page 
                pageNumber={1} 
                scale={1.2}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={600}
              />
            )}
          </Document>
        </div>
      </Dialog>
    </div>
  );
};