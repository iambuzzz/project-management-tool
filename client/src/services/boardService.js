import api from './api';

export const boardService = {
  // Get all boards
  getBoards: async () => {
    const response = await api.get('/boards');
    return response.data; // backend sends { message, data }
  },

  // Get a single board by ID (with all lists, cards, etc)
  getBoard: async (id) => {
    const response = await api.get(`/boards/${id}`);
    return response.data;
  },

  // Create a new board
  createBoard: async (boardData) => {
    const response = await api.post('/boards', boardData);
    return response.data;
  },

  // Update a board
  updateBoard: async (id, boardData) => {
    const response = await api.put(`/boards/${id}`, boardData);
    return response.data;
  },

  // Delete a board
  deleteBoard: async (id) => {
    const response = await api.delete(`/boards/${id}`);
    return response;
  },
};
