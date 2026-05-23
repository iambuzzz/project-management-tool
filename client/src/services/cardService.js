import api from './api';

export const cardService = {
  // Create a new card
  createCard: async ({ listId, title }) => {
    const response = await api.post(`/lists/${listId}/cards`, { title });
    return response.data;
  },

  // Get full card details
  getCard: async (id) => {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  },

  // Update a card (title, description, dates, etc.)
  updateCard: async ({ id, data }) => {
    const response = await api.put(`/cards/${id}`, data);
    return response.data;
  },

  // Move card to a different list
  moveCard: async ({ id, listId, position }) => {
    const response = await api.put(`/cards/${id}/move`, { listId, position });
    return response.data;
  },

  // Batch reorder cards
  reorderCards: async ({ orderedCards }) => {
    const response = await api.put(`/cards/reorder`, { orderedCards });
    return response.data;
  },

  // Delete a card
  deleteCard: async (id) => {
    const response = await api.delete(`/cards/${id}`);
    return response;
  },
};
