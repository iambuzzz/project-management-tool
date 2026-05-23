import api from './api';

export const labelService = {
  getLabels: async () => {
    const response = await api.get('/labels');
    return response.data;
  },

  addLabelToCard: async ({ cardId, labelId }) => {
    const response = await api.post(`/cards/${cardId}/labels`, { labelId });
    return response.data;
  },

  removeLabelFromCard: async ({ cardId, labelId }) => {
    const response = await api.delete(`/cards/${cardId}/labels/${labelId}`);
    return response;
  }
};
