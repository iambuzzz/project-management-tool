import api from './api';

export const listService = {
  // Create a new list
  createList: async ({ boardId, title }) => {
    const response = await api.post(`/boards/${boardId}/lists`, { title });
    return response.data;
  },

  // Update a list (e.g., title)
  updateList: async ({ id, title }) => {
    const response = await api.put(`/lists/${id}`, { title });
    return response.data;
  },

  // Batch reorder lists
  reorderLists: async ({ orderedLists }) => {
    const response = await api.put(`/lists/reorder`, { orderedLists });
    return response.data;
  },

  // Delete a list
  deleteList: async (id) => {
    const response = await api.delete(`/lists/${id}`);
    return response;
  },
};
