import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labelService } from '../services/labelService';
import { cardKeys } from './useCards';
import { boardKeys } from './useBoards';

export const useLabels = () => {
  return useQuery({
    queryKey: ['labels'],
    queryFn: labelService.getLabels,
  });
};

export const useLabelMutations = (cardId, boardId) => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: cardKeys.detail(cardId) });
    queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
  };

  const onError = (err, variables, context) => {
    if (context?.prevCard) queryClient.setQueryData(cardKeys.detail(cardId), context.prevCard);
    if (context?.prevBoard) queryClient.setQueryData(boardKeys.detail(boardId), context.prevBoard);
  };

  const addLabel = useMutation({
    mutationFn: labelService.addLabelToCard,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: cardKeys.detail(cardId) });
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });

      const prevCard = queryClient.getQueryData(cardKeys.detail(cardId));
      const prevBoard = queryClient.getQueryData(boardKeys.detail(boardId));

      const allLabelsData = queryClient.getQueryData(['labels']);
      const allLabels = allLabelsData?.data || allLabelsData || [];
      const fullLabel = allLabels.find(l => l.id === variables.labelId);
      const newLabelObj = { labelId: variables.labelId, label: fullLabel || { id: variables.labelId } };

      if (prevCard?.data) {
        queryClient.setQueryData(cardKeys.detail(cardId), {
          ...prevCard,
          data: { ...prevCard.data, labels: [...(prevCard.data.labels || []), newLabelObj] }
        });
      }

      if (prevBoard?.data) {
        queryClient.setQueryData(boardKeys.detail(boardId), {
          ...prevBoard,
          data: {
            ...prevBoard.data,
            lists: prevBoard.data.lists.map(list => ({
              ...list,
              cards: list.cards.map(c => 
                c.id === cardId ? { ...c, labels: [...(c.labels || []), newLabelObj] } : c
              )
            }))
          }
        });
      }

      return { prevCard, prevBoard };
    },
    onError,
    onSettled: invalidate,
  });

  const removeLabel = useMutation({
    mutationFn: labelService.removeLabelFromCard,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: cardKeys.detail(cardId) });
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });

      const prevCard = queryClient.getQueryData(cardKeys.detail(cardId));
      const prevBoard = queryClient.getQueryData(boardKeys.detail(boardId));

      if (prevCard?.data) {
        queryClient.setQueryData(cardKeys.detail(cardId), {
          ...prevCard,
          data: { ...prevCard.data, labels: prevCard.data.labels.filter(l => l.labelId !== variables.labelId) }
        });
      }

      if (prevBoard?.data) {
        queryClient.setQueryData(boardKeys.detail(boardId), {
          ...prevBoard,
          data: {
            ...prevBoard.data,
            lists: prevBoard.data.lists.map(list => ({
              ...list,
              cards: list.cards.map(c => 
                c.id === cardId ? { ...c, labels: (c.labels || []).filter(l => l.labelId !== variables.labelId) } : c
              )
            }))
          }
        });
      }

      return { prevCard, prevBoard };
    },
    onError,
    onSettled: invalidate,
  });

  return { addLabel, removeLabel };
};
