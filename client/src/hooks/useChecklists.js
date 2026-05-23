import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistService } from '../services/checklistService';
import { cardKeys } from './useCards';
import { boardKeys } from './useBoards';

// Checklists are fetched as part of card detail query.
// We add optimistic updates to updateItem for instant checkbox toggling.

export const useChecklistMutations = (cardId, boardId) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
    queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
  };

  const createChecklist = useMutation({
    mutationFn: checklistService.createChecklist,
    onSuccess: invalidate,
  });

  const updateChecklist = useMutation({
    mutationFn: checklistService.updateChecklist,
    onSuccess: invalidate,
  });

  const deleteChecklist = useMutation({
    mutationFn: checklistService.deleteChecklist,
    onSuccess: invalidate,
  });

  const addItem = useMutation({
    mutationFn: checklistService.addItem,
    onSuccess: invalidate,
  });

  // Optimistic update for checklist item toggle — instant UI
  const updateItem = useMutation({
    mutationFn: checklistService.updateItem,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: cardKeys.detail(cardId) });
      const prevCard = queryClient.getQueryData(cardKeys.detail(cardId));

      queryClient.setQueryData(cardKeys.detail(cardId), (old) => {
        if (!old) return old;
        const cardData = old.data || old;
        return {
          ...old,
          data: {
            ...cardData,
            checklists: cardData.checklists?.map(cl => ({
              ...cl,
              items: cl.items?.map(item =>
                item.id === variables.id
                  ? { ...item, ...variables }
                  : item
              ),
            })),
          },
        };
      });

      return { prevCard };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevCard) {
        queryClient.setQueryData(cardKeys.detail(cardId), context.prevCard);
      }
    },
    onSettled: invalidate,
  });

  const deleteItem = useMutation({
    mutationFn: checklistService.deleteItem,
    // Optimistic delete
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: cardKeys.detail(cardId) });
      const prevCard = queryClient.getQueryData(cardKeys.detail(cardId));

      queryClient.setQueryData(cardKeys.detail(cardId), (old) => {
        if (!old) return old;
        const cardData = old.data || old;
        return {
          ...old,
          data: {
            ...cardData,
            checklists: cardData.checklists?.map(cl => ({
              ...cl,
              items: cl.items?.filter(item => item.id !== itemId),
            })),
          },
        };
      });

      return { prevCard };
    },
    onError: (_err, _vars, context) => {
      if (context?.prevCard) {
        queryClient.setQueryData(cardKeys.detail(cardId), context.prevCard);
      }
    },
    onSettled: invalidate,
  });

  return {
    createChecklist,
    updateChecklist,
    deleteChecklist,
    addItem,
    updateItem,
    deleteItem,
  };
};
