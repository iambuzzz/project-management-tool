import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardService } from '../services/cardService';
import { boardKeys } from './useBoards';

export const cardKeys = {
  detail: (id) => ['card', id],
};

export const useCard = (id) => {
  return useQuery({
    queryKey: cardKeys.detail(id),
    queryFn: () => cardService.getCard(id),
    enabled: !!id,
  });
};

export const useCreateCard = (boardId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cardService.createCard,
    onMutate: async ({ listId, title }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });
      const previousBoard = queryClient.getQueryData(boardKeys.detail(boardId));
      if (previousBoard) {
        queryClient.setQueryData(boardKeys.detail(boardId), (old) => {
          if (!old) return old;
          const data = old.data || old;
          return {
            ...old,
            data: {
              ...data,
              lists: (data.lists || []).map(list => {
                if (list.id === listId) {
                  const newCard = { id: `temp-${Date.now()}`, title, listId, position: 999999 };
                  return { ...list, cards: [...(list.cards || []), newCard] };
                }
                return list;
              })
            }
          };
        });
      }
      return { previousBoard };
    },
    onError: (_err, _var, context) => {
      if (context?.previousBoard) queryClient.setQueryData(boardKeys.detail(boardId), context.previousBoard);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
};

export const useUpdateCard = (boardId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cardService.updateCard,

    // Optimistic update — instant UI feedback
    onMutate: async (variables) => {
      // Cancel in-flight queries so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });
      await queryClient.cancelQueries({ queryKey: cardKeys.detail(variables.id) });
      await queryClient.cancelQueries({ queryKey: ['archivedCards', boardId] });

      // Snapshot previous state for rollback
      const prevBoard = queryClient.getQueryData(boardKeys.detail(boardId));
      const prevCard = queryClient.getQueryData(cardKeys.detail(variables.id));
      const prevArchived = queryClient.getQueryData(['archivedCards', boardId]);

      // Handle archive / unarchive specifically
      const isArchiving = variables.data.isArchived === true;
      const isUnarchiving = variables.data.isArchived === false;

      // Optimistically update the board cache (cards are nested inside board.lists)
      if (prevBoard) {
        queryClient.setQueryData(boardKeys.detail(boardId), (old) => {
          if (!old) return old;
          const data = old.data || old;
          const lists = data.lists || [];
          
          let newLists;
          if (isArchiving) {
            // Remove the card from the board lists
            newLists = lists.map(list => ({
              ...list,
              cards: (list.cards || []).filter(c => c.id !== variables.id)
            }));
          } else if (isUnarchiving) {
            // Add the card back to its list
            const unarchivedCard = (prevArchived?.data || []).find(c => c.id === variables.id) || prevCard?.data || {};
            const targetListId = variables.data.listId || unarchivedCard.listId;
            newLists = lists.map(list => {
              if (list.id === targetListId) {
                // Remove if it's already there (just in case), then push
                const filtered = (list.cards || []).filter(c => c.id !== variables.id);
                return {
                  ...list,
                  cards: [...filtered, { ...unarchivedCard, ...variables.data, isArchived: false }]
                };
              }
              return list;
            });
          } else {
            // Normal update in place
            newLists = lists.map(list => ({
              ...list,
              cards: (list.cards || []).map(card =>
                card.id === variables.id
                  ? { ...card, ...variables.data }
                  : card
              )
            }));
          }

          return { ...old, data: { ...data, lists: newLists } };
        });
      }

      // Optimistically update the archived cards cache
      if (prevArchived) {
        queryClient.setQueryData(['archivedCards', boardId], (old) => {
          if (!old) return old;
          const data = old.data || old;
          let newArchived = [...data];
          if (isArchiving && prevCard) {
            newArchived.unshift({ ...prevCard.data, ...variables.data });
          } else if (isUnarchiving) {
            newArchived = newArchived.filter(c => c.id !== variables.id);
          }
          return { ...old, data: newArchived };
        });
      }

      // Optimistically update the card detail cache
      if (prevCard) {
        queryClient.setQueryData(cardKeys.detail(variables.id), (old) => {
          if (!old) return old;
          const cardData = old.data || old;
          return {
            ...old,
            data: { ...cardData, ...variables.data },
          };
        });
      }

      return { prevBoard, prevCard, prevArchived };
    },

    // Rollback on error
    onError: (_err, variables, context) => {
      if (context?.prevBoard) queryClient.setQueryData(boardKeys.detail(boardId), context.prevBoard);
      if (context?.prevCard) queryClient.setQueryData(cardKeys.detail(variables.id), context.prevCard);
      if (context?.prevArchived) queryClient.setQueryData(['archivedCards', boardId], context.prevArchived);
    },

    // Always refetch after mutation settles to sync with server
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      queryClient.invalidateQueries({ queryKey: cardKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['archivedCards', boardId] });
    },
  });
};

// Optimistic updates for card reordering/moving
export const useReorderCards = (boardId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cardService.reorderCards,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
};

export const useMoveCard = (boardId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cardService.moveCard,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
};

export const useDeleteCard = (boardId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cardService.deleteCard,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });
      await queryClient.cancelQueries({ queryKey: ['archivedCards', boardId] });
      
      const previousBoard = queryClient.getQueryData(boardKeys.detail(boardId));
      const previousArchived = queryClient.getQueryData(['archivedCards', boardId]);

      if (previousBoard) {
        queryClient.setQueryData(boardKeys.detail(boardId), (old) => {
          if (!old) return old;
          const data = old.data || old;
          return {
            ...old,
            data: {
              ...data,
              lists: (data.lists || []).map(list => ({
                ...list,
                cards: (list.cards || []).filter(card => card.id !== id)
              }))
            }
          };
        });
      }

      if (previousArchived) {
        queryClient.setQueryData(['archivedCards', boardId], (old) => {
          if (!old) return old;
          const data = old.data || old;
          return {
            ...old,
            data: data.filter(card => card.id !== id)
          };
        });
      }

      return { previousBoard, previousArchived };
    },
    onError: (_err, _var, context) => {
      if (context?.previousBoard) queryClient.setQueryData(boardKeys.detail(boardId), context.previousBoard);
      if (context?.previousArchived) queryClient.setQueryData(['archivedCards', boardId], context.previousArchived);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
      queryClient.invalidateQueries({ queryKey: ['archivedCards', boardId] });
    },
  });
};
