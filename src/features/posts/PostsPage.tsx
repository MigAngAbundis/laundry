// src/features/posts/PostsPage.tsx
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { PostsTable } from '../../features/posts/PostsTable';
import { PostForm } from '../../components/PostForm';
import { LaundryTicket } from './types';
import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../ui/uiSlice';

export const PostsPage = () => {
  const dispatch = useAppDispatch();
  
  // Estado para el modal (Dialog)
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  // Estado para saber si estamos editando o creando
  // Si 'null' -> Creando. Si 'LaundryTicket' -> Editando.
  const [editingTicket, setEditingTicket] = useState<LaundryTicket | null>(null);

  // --- Handlers para el CRUD ---

  const openNew = () => {
    setEditingTicket(null); // Limpiamos cualquier ticket anterior
    setIsDialogVisible(true);
  };

  const openEdit = (ticket: LaundryTicket) => {
    setEditingTicket(ticket); // Establecemos el ticket a editar
    setIsDialogVisible(true);
  };

  const hideDialog = () => {
    setIsDialogVisible(false);
    setEditingTicket(null); // Limpiar al cerrar
  };

  // Se llama desde el PostForm cuando el guardado (create/update) es exitoso
  const onSaveSuccess = (action: 'created' | 'updated') => {
    hideDialog();
    dispatch(showToast({
      severity: 'success',
      summary: 'Éxito',
      detail: `Ticket ${action === 'created' ? 'creado' : 'actualizado'} correctamente.`
    }));
  };

  // --- Contenido de la Toolbar ---

  const leftToolbarTemplate = () => (
    <React.Fragment>
      <Button 
        label="Nuevo Ticket" 
        icon="pi pi-plus" 
        className="p-button-success mr-2" 
        onClick={openNew} 
      />
    </React.Fragment>
  );

  const dialogHeader = editingTicket ? 'Editar Ticket' : 'Crear Nuevo Ticket';

  return (
    <div className="card">
      {/* Barra de herramientas superior */}
      <Toolbar className="mb-4" start={leftToolbarTemplate}></Toolbar>

      {/* La tabla de datos */}
      {/* Pasamos el handler 'openEdit' para que la tabla nos avise
          cuándo se debe editar un item */}
      <PostsTable onEditTicket={openEdit} />

      {/* Modal (Dialog) para crear/editar */}
      <Dialog
        visible={isDialogVisible}
        style={{ width: '450px' }}
        header={dialogHeader}
        modal
        className="p-fluid"
        onHide={hideDialog}
        footer={null} // El formulario tendrá sus propios botones
      >
        {/* Renderizamos el formulario aquí.
          Le pasamos el ticket (o null) y el callback de éxito.
        */}
        <PostForm 
          ticket={editingTicket} 
          onSaveSuccess={onSaveSuccess}
          onCancel={hideDialog}
        />
      </Dialog>
    </div>
  );
};