// server/routes/posts.ts
import express from 'express';
import { LaundryTicket, TicketStatus } from '../types';

const router = express.Router();

// Mock data storage (in production, use a database)
let MOCK_TICKETS: LaundryTicket[] = [
  { id: 1, title: 'Camisas y Pantalones', userId: 1, dateReceived: '2025-10-28T10:00:00Z', dateDelivery: '2025-10-30T17:00:00Z', status: 'ready', tags: ['plancha'] },
  { id: 2, title: 'Traje Completo (Tinte)', userId: 2, dateReceived: '2025-10-29T11:00:00Z', dateDelivery: '2025-11-01T17:00:00Z', status: 'processing', tags: ['tinte', 'urgente'] },
  { id: 3, title: 'Sábanas Queen', userId: 1, dateReceived: '2025-10-30T09:00:00Z', dateDelivery: '2025-11-02T17:00:00Z', status: 'pending', tags: ['lavado'] },
  { id: 4, title: 'Edredón King Size', userId: 3, dateReceived: '2025-10-30T14:00:00Z', dateDelivery: '2025-11-03T17:00:00Z', status: 'pending', tags: ['lavado', 'seco'] },
];

// GET /posts?limit=10&skip=0
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = parseInt(req.query.skip as string) || 0;

  const tickets = MOCK_TICKETS.slice(skip, skip + limit);
  
  res.json({
    posts: tickets,
    total: MOCK_TICKETS.length,
    skip,
    limit,
  });
});

// GET /posts/search?q=<texto>
router.get('/search', (req, res) => {
  const query = (req.query.q as string) || '';
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = parseInt(req.query.skip as string) || 0;

  if (!query) {
    return res.json({
      posts: [],
      total: 0,
      skip,
      limit,
    });
  }

  const filtered = MOCK_TICKETS.filter(ticket => 
    ticket.title.toLowerCase().includes(query.toLowerCase()) ||
    ticket.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );

  const tickets = filtered.slice(skip, skip + limit);

  res.json({
    posts: tickets,
    total: filtered.length,
    skip,
    limit,
  });
});

// POST /posts/add
router.post('/add', (req, res) => {
  const newTicket = req.body;

  // Validate required fields
  if (!newTicket.title || !newTicket.userId || !newTicket.dateReceived || !newTicket.dateDelivery) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate ID if provided
  let ticketId: number;
  if (newTicket.id !== undefined) {
    // Validate that ID is a 4-digit number
    const idNum = parseInt(String(newTicket.id), 10);
    if (isNaN(idNum) || idNum < 1000 || idNum > 9999 || String(idNum).length !== 4) {
      return res.status(400).json({ error: 'ID must be a 4-digit number between 1000 and 9999' });
    }
    // Check if ID already exists
    if (MOCK_TICKETS.some(t => t.id === idNum)) {
      return res.status(400).json({ error: `Ticket with ID ${idNum} already exists` });
    }
    ticketId = idNum;
  } else {
    // Generate new ID if not provided
    const maxId = MOCK_TICKETS.length > 0 ? Math.max(...MOCK_TICKETS.map(t => t.id)) : 0;
    ticketId = maxId >= 9999 ? Math.max(1000, maxId + 1) : Math.max(1000, maxId + 1);
    // Ensure it's 4 digits
    if (ticketId < 1000) ticketId = 1000;
    if (ticketId > 9999) ticketId = 9999;
  }

  const createdTicket: LaundryTicket = {
    id: ticketId,
    title: newTicket.title,
    userId: newTicket.userId,
    dateReceived: newTicket.dateReceived,
    dateDelivery: newTicket.dateDelivery,
    status: newTicket.status || 'pending',
    tags: newTicket.tags || [],
  };

  MOCK_TICKETS.push(createdTicket);

  res.status(201).json(createdTicket);
});

// PUT /posts/:id
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updatedData = req.body;

  const index = MOCK_TICKETS.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const updatedTicket: LaundryTicket = {
    ...MOCK_TICKETS[index],
    ...updatedData,
    id, // Ensure ID doesn't change
  };

  MOCK_TICKETS[index] = updatedTicket;

  res.json(updatedTicket);
});

// DELETE /posts/:id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const index = MOCK_TICKETS.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  MOCK_TICKETS = MOCK_TICKETS.filter(t => t.id !== id);

  res.json({ id, message: 'Ticket deleted successfully' });
});

export { router as postsRouter };

