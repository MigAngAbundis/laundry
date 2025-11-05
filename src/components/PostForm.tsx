// src/features/posts/components/PostForm.tsx
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Chips } from 'primereact/chips';
import { classNames } from 'primereact/utils';

import { useAppDispatch, useAppSelector } from './../app/hooks';
import { LaundryTicket, NewLaundryTicket, TicketStatus } from './../features/posts/types';
import { addNewPost, updatePost } from './../features/posts/postsSlice';
import { fetchUsers, selectAllUsers } from '../features/users/usersSlice';
import { showToast } from '../features/ui/uiSlice';

interface PostFormProps {
  ticket: LaundryTicket | null;    // null si es 'nuevo', objeto si es 'editar'
  onSaveSuccess: (action: 'created' | 'updated') => void;
  onCancel: () => void;
}

// Tipo para el formulario: usa Date en lugar de string para las fechas
type PostFormData = Omit<LaundryTicket, 'dateReceived' | 'dateDelivery'> & {
  dateReceived: Date;
  dateDelivery: Date;
};

// Opciones para el Dropdown de Status
const statusOptions: { label: string, value: TicketStatus }[] = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'Procesando', value: 'processing' },
  { label: 'Listo', value: 'ready' },
  { label: 'Entregado', value: 'delivered' },
];

export const PostForm = ({ ticket, onSaveSuccess, onCancel }: PostFormProps) => {
  const dispatch = useAppDispatch();
  const isEditing = ticket !== null;
  const users = useAppSelector(selectAllUsers);
  
  // Opciones para el Dropdown de Usuarios
  const userOptions = users.map(u => ({
    label: `${u.firstName} ${u.lastName} (ID: ${u.id})`,
    value: u.id,
  }));

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PostFormData>();

  // 1. Cargar usuarios (para el Dropdown) si aún no están cargados
  useEffect(() => {
    if (users.length === 0) {
      dispatch(fetchUsers({ limit: 100 }));
    }
  }, [dispatch, users.length]);

  // 2. Resetear el formulario cuando 'ticket' cambie (al abrir/cerrar el modal)
  useEffect(() => {
    if (isEditing) {
      // Modo Edición: Cargar datos del ticket, convirtiendo fechas
      reset({
        ...ticket,
        dateReceived: new Date(ticket.dateReceived),
        dateDelivery: new Date(ticket.dateDelivery),
      });
    } else {
      // Modo Nuevo: Poner valores por defecto
      reset({
        id: undefined,
        title: '',
        userId: undefined,
        status: 'pending',
        tags: [],
        dateReceived: new Date(),
        dateDelivery: new Date(new Date().setDate(new Date().getDate() + 2)), // Entrega en 2 días
      });
    }
  }, [ticket, isEditing, reset]);

  // 3. Handler de Submit (Crear o Actualizar)
  const onSubmit = async (data: PostFormData) => {
    // Convertir fechas de vuelta a string ISO antes de enviar
    const ticketData: LaundryTicket = {
      ...data,
      dateReceived: data.dateReceived.toISOString(),
      dateDelivery: data.dateDelivery.toISOString(),
    };

    try {
      if (isEditing) {
        // Actualizar
        await dispatch(updatePost(ticketData)).unwrap();
        onSaveSuccess('updated');
      } else {
        // Crear: usar el ID validado del formulario
        if (!ticketData.id) {
          dispatch(showToast({
            severity: 'error',
            summary: 'Error',
            detail: 'El ID del ticket es requerido'
          }));
          return;
        }
        // El backend acepta el ID en el body
        await dispatch(addNewPost(ticketData as LaundryTicket)).unwrap();
        onSaveSuccess('created');
      }
    } catch (err) {
      dispatch(showToast({
        severity: 'error',
        summary: 'Error',
        detail: `No se pudo guardar el ticket: ${err}`
      }));
    }
  };

  // Función de validación para ID de 4 dígitos
  const validateTicketId = (value: any): boolean | string => {
    if (!value && !isEditing) {
      return 'El ID del ticket es obligatorio.';
    }
    if (value) {
      const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
      if (isNaN(numValue)) {
        return 'El ID debe ser un número.';
      }
      if (numValue.toString().length !== 4) {
        return 'El ID debe ser un número de exactamente 4 dígitos.';
      }
      if (numValue < 1000 || numValue > 9999) {
        return 'El ID debe estar entre 1000 y 9999.';
      }
    }
    return true;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-fluid mt-4">
      
      {/* ID del Ticket */}
      <div className="field">
        <label htmlFor="id">ID del Ticket</label>
        <Controller
          name="id"
          control={control}
          rules={{
            required: !isEditing ? 'El ID del ticket es obligatorio.' : false,
            validate: validateTicketId,
          }}
          render={({ field, fieldState }) => (
            <InputText
              id={field.name}
              {...field}
              value={field.value ? String(field.value) : ''}
              onChange={(e) => {
                const value = e.target.value;
                // Solo permitir números
                if (value === '' || /^\d+$/.test(value)) {
                  field.onChange(value === '' ? undefined : parseInt(value, 10));
                }
              }}
              maxLength={4}
              placeholder="Ej: 1234"
              disabled={isEditing}
              className={classNames({ 'p-invalid': fieldState.error })}
              keyfilter="int"
            />
          )}
        />
        {errors.id && <small className="p-error">{errors.id.message}</small>}
        {!isEditing && <small className="p-text-secondary">Debe ser un número de 4 dígitos (1000-9999)</small>}
      </div>
      
      {/* Título */}
      <div className="field">
        <label htmlFor="title">Título</label>
        <Controller
          name="title"
          control={control}
          rules={{ required: 'El título es obligatorio.' }}
          render={({ field, fieldState }) => (
            <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })} />
          )}
        />
        {errors.title && <small className="p-error">{errors.title.message}</small>}
      </div>
      
      {/* Usuario (Cliente) */}
      <div className="field">
        <label htmlFor="userId">Cliente (Usuario)</label>
        <Controller
          name="userId"
          control={control}
          rules={{ required: 'Debe seleccionar un cliente.' }}
          render={({ field, fieldState }) => (
            <Dropdown 
              id={field.name}
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={userOptions}
              placeholder="Seleccione un cliente"
              className={classNames({ 'p-invalid': fieldState.error })}
            />
          )}
        />
        {errors.userId && <small className="p-error">{errors.userId.message}</small>}
      </div>

      {/* Status */}
      <div className="field">
        <label htmlFor="status">Estado del Ticket</label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Dropdown 
              id={field.name}
              value={field.value}
              onChange={(e) => field.onChange(e.value)}
              options={statusOptions}
            />
          )}
        />
      </div>

      {/* Fecha Recibido y Entrega (Lado a lado) */}
      <div className="formgrid grid">
        <div className="field col">
          <label htmlFor="dateReceived">Fecha Recibido</label>
          <Controller
            name="dateReceived"
            control={control}
            render={({ field }) => <Calendar id={field.name} value={field.value as Date} onChange={(e) => field.onChange(e.value)} showTime showIcon />}
          />
        </div>
        <div className="field col">
          <label htmlFor="dateDelivery">Fecha Entrega</label>
          <Controller
            name="dateDelivery"
            control={control}
            render={({ field }) => <Calendar id={field.name} value={field.value as Date} onChange={(e) => field.onChange(e.value)} showTime showIcon />}
          />
        </div>
      </div>
      
      {/* Tags (Etiquetas) */}
      <div className="field">
          <label htmlFor="tags">Tags (ej: plancha, urgente)</label>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              // 'separator' define la tecla que crea un nuevo tag
              <Chips id={field.name} value={field.value} onChange={(e) => field.onChange(e.value)} separator="," />
            )}
          />
      </div>

      {/* Botones de Acción */}
      <div className="form-buttons mt-5">
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          className="p-button-text" 
          onClick={onCancel} 
          disabled={isSubmitting} 
        />
        <Button 
          type="submit"
          label={isEditing ? 'Actualizar' : 'Guardar'}
          icon="pi pi-check" 
          loading={isSubmitting} 
        />
      </div>
    </form>
  );
};