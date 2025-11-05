// server/types.ts
export type TicketStatus = 'pending' | 'processing' | 'ready' | 'delivered';

export interface LaundryTicket {
  id: number;
  title: string;
  userId: number;
  dateReceived: string;
  dateDelivery: string;
  status: TicketStatus;
  tags: string[];
}

