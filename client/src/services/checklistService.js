import api from './api';

export const checklistService = {
  createChecklist: async ({ cardId, title }) => {
    const response = await api.post(`/cards/${cardId}/checklists`, { title });
    return response.data;
  },
  
  updateChecklist: async ({ id, title }) => {
    const response = await api.put(`/checklists/${id}`, { title });
    return response.data;
  },

  deleteChecklist: async (id) => {
    const response = await api.delete(`/checklists/${id}`);
    return response;
  },

  addItem: async ({ checklistId, text }) => {
    const response = await api.post(`/checklists/${checklistId}/items`, { text });
    return response.data;
  },

  updateItem: async ({ id, text, isCompleted }) => {
    const response = await api.put(`/checklist-items/${id}`, { text, isCompleted });
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await api.delete(`/checklist-items/${id}`);
    return response;
  }
};
