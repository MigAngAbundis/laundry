// src/features/posts/types.ts
export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    image: null; // Siempre null
  }
// Los posibles estados de un ticket
export type TicketStatus = 'pending' | 'processing' | 'ready' | 'delivered';

// La entidad principal: Ticket de Lavandería
export interface LaundryTicket {
  id: number;
  title: string;       // ej: "Traje 2 piezas"
  userId: number;      // ID del cliente (para cruzar con 'usersSlice')
  dateReceived: string; // Fecha en formato ISO (ej: "2024-10-30T10:00:00Z")
  dateDelivery: string; // Fecha en formato ISO
  status: TicketStatus;
  tags: string[];      // ej: ["plancha", "urgente", "tinte"]
  // pdfUrl?: string;  // Opcional, si el ticket tiene un PDF asociado
}

// Tipo para crear un nuevo ticket (omitimos el 'id')
export type NewLaundryTicket = Omit<LaundryTicket, 'id'>;

// La forma del estado para el slice de posts
export interface PostsState {
  tickets: LaundryTicket[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}