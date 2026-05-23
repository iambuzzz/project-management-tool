import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { cardKeys } from './useCards';

const attachmentService = {
  uploadAttachment: async ({ cardId, file }) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload requires multipart/form-data, axios handles it automatically when we pass FormData
    const response = await api.post(`/cards/${cardId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  deleteAttachment: async (attachmentId) => {
    const response = await api.delete(`/attachments/${attachmentId}`);
    return response.data;
  }
};

export const useAttachmentMutations = (cardId) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    // Attachments are fetched as part of the card detail query
    queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
  };

  const uploadAttachment = useMutation({
    mutationFn: attachmentService.uploadAttachment,
    onSuccess: invalidate,
  });

  const deleteAttachment = useMutation({
    mutationFn: attachmentService.deleteAttachment,
    onSuccess: invalidate,
  });

  return {
    uploadAttachment,
    deleteAttachment,
  };
};
