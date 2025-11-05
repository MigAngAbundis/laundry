// src/features/posts/postsSlice.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import postsReducer, { deletePost, addNewPost, fetchPosts } from './postsSlice';
import { LaundryTicket } from './types';
import * as apiModule from '../../config/api';

// Mock the api module
vi.mock('../../config/api', () => ({
  apiRequest: vi.fn(),
  getAuthToken: vi.fn(() => null),
}));

describe('postsSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        posts: postsReducer,
      },
    });
    vi.clearAllMocks();
  });

  describe('deletePost', () => {
    it('should delete a ticket successfully', async () => {
      // Arrange: Set up initial state with tickets
      const initialTickets: LaundryTicket[] = [
        {
          id: 1001,
          title: 'Ticket 1',
          userId: 1,
          dateReceived: '2025-01-01T10:00:00Z',
          dateDelivery: '2025-01-03T17:00:00Z',
          status: 'pending',
          tags: [],
        },
        {
          id: 1002,
          title: 'Ticket 2',
          userId: 2,
          dateReceived: '2025-01-02T10:00:00Z',
          dateDelivery: '2025-01-04T17:00:00Z',
          status: 'processing',
          tags: ['urgente'],
        },
      ];

      // Set initial state
      store.dispatch({
        type: 'posts/fetchPosts/fulfilled',
        payload: initialTickets,
      });

      // Mock successful API response
      vi.mocked(apiModule.apiRequest).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1001, message: 'Ticket deleted successfully' }),
      } as Response);

      // Act: Delete ticket
      const result = await store.dispatch(deletePost(1001));

      // Assert
      expect(result.type).toBe('posts/deletePost/fulfilled');
      expect(result.payload).toBe(1001);

      const state = store.getState().posts;
      expect(state.tickets).toHaveLength(1);
      expect(state.tickets.find((t) => t.id === 1001)).toBeUndefined();
      expect(state.tickets.find((t) => t.id === 1002)).toBeDefined();
      expect(state.status).toBe('succeeded');
      expect(state.error).toBeNull();
    });

    it('should handle delete error', async () => {
      // Arrange
      const initialTickets: LaundryTicket[] = [
        {
          id: 1001,
          title: 'Ticket 1',
          userId: 1,
          dateReceived: '2025-01-01T10:00:00Z',
          dateDelivery: '2025-01-03T17:00:00Z',
          status: 'pending',
          tags: [],
        },
      ];

      store.dispatch({
        type: 'posts/fetchPosts/fulfilled',
        payload: initialTickets,
      });

      // Mock API error
      vi.mocked(apiModule.apiRequest).mockRejectedValueOnce(
        new Error('Failed to delete ticket')
      );

      // Act
      const result = await store.dispatch(deletePost(1001));

      // Assert
      expect(result.type).toBe('posts/deletePost/rejected');
      const state = store.getState().posts;
      expect(state.tickets).toHaveLength(1); // Ticket should still exist
      expect(state.status).toBe('failed');
      expect(state.error).toBe('Failed to delete ticket');
    });
  });

  describe('addNewPost', () => {
    it('should add a new ticket with valid 4-digit ID', async () => {
      // Arrange
      const newTicket: LaundryTicket = {
        id: 1234,
        title: 'Nuevo Ticket',
        userId: 1,
        dateReceived: '2025-01-05T10:00:00Z',
        dateDelivery: '2025-01-07T17:00:00Z',
        status: 'pending',
        tags: ['test'],
      };

      // Mock successful API response
      vi.mocked(apiModule.apiRequest).mockResolvedValueOnce({
        ok: true,
        json: async () => newTicket,
      } as Response);

      // Act
      const result = await store.dispatch(addNewPost(newTicket));

      // Assert
      expect(result.type).toBe('posts/addNewPost/fulfilled');
      expect(result.payload).toEqual(newTicket);

      const state = store.getState().posts;
      expect(state.tickets).toHaveLength(1);
      expect(state.tickets[0]).toEqual(newTicket);
      expect(state.tickets[0].id).toBe(1234);
      expect(String(state.tickets[0].id).length).toBe(4);
      expect(state.status).toBe('succeeded');
      expect(state.error).toBeNull();
    });
  });

  describe('fetchPosts', () => {
    it('should fetch posts successfully', async () => {
      // Arrange
      const mockPosts: LaundryTicket[] = [
        {
          id: 1001,
          title: 'Ticket 1',
          userId: 1,
          dateReceived: '2025-01-01T10:00:00Z',
          dateDelivery: '2025-01-03T17:00:00Z',
          status: 'pending',
          tags: [],
        },
      ];

      // Mock successful API response
      vi.mocked(apiModule.apiRequest).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ posts: mockPosts, total: 1, skip: 0, limit: 10 }),
      } as Response);

      // Act
      const result = await store.dispatch(fetchPosts({ limit: 10, skip: 0 }));

      // Assert
      expect(result.type).toBe('posts/fetchPosts/fulfilled');
      expect(result.payload).toEqual(mockPosts);

      const state = store.getState().posts;
      expect(state.tickets).toEqual(mockPosts);
      expect(state.tickets).toHaveLength(1);
      expect(state.status).toBe('succeeded');
      expect(state.error).toBeNull();
    });
  });
});

