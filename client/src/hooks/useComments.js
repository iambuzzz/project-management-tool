import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { cardKeys } from './useCards';

// Service methods inline
const commentService = {
  getComments: async (cardId) => {
    const response = await api.get(`/cards/${cardId}/comments`);
    return response.data;
  },
  getActivities: async (cardId) => {
    const response = await api.get(`/cards/${cardId}/activities`);
    return response.data;
  },
  addComment: async ({ cardId, text, memberId }) => {
    const response = await api.post(`/cards/${cardId}/comments`, { text, memberId });
    return response.data;
  },
  updateComment: async ({ commentId, text }) => {
    const response = await api.put(`/comments/${commentId}`, { text });
    return response.data;
  },
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  }
};

// Hooks
export const useComments = (cardId) => {
  return useQuery({
    queryKey: ['comments', cardId],
    queryFn: () => commentService.getComments(cardId),
    enabled: !!cardId,
  });
};

export const useActivities = (cardId) => {
  return useQuery({
    queryKey: ['activities', cardId],
    queryFn: () => commentService.getActivities(cardId),
    enabled: !!cardId,
  });
};

export const useCommentMutations = (cardId) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['comments', cardId] });
    queryClient.invalidateQueries({ queryKey: ['activities', cardId] });
    queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) }); // updates the comment count badge
  };

  const addComment = useMutation({
    mutationFn: commentService.addComment,
    onSuccess: invalidate,
  });

  const updateComment = useMutation({
    mutationFn: commentService.updateComment,
    onSuccess: invalidate,
  });

  const deleteComment = useMutation({
    mutationFn: commentService.deleteComment,
    onSuccess: invalidate,
  });

  return {
    addComment,
    updateComment,
    deleteComment,
  };
};
