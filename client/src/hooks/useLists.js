import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listService } from '../services/listService';
import { boardKeys } from './useBoards';

export const useCreateList = (boardId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: listService.createList,
    onMutate: async ({ title }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });
      const previousBoard = queryClient.getQueryData(boardKeys.detail(boardId));
      if (previousBoard) {
        queryClient.setQueryData(boardKeys.detail(boardId), (old) => {
          if (!old) return old;
          const data = old.data || old;
          const newLists = [...(data.lists || []), { id: `temp-${Date.now()}`, title, cards: [], position: 999999 }];
          return { ...old, data: { ...data, lists: newLists } };
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

export const useUpdateList = (boardId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: listService.updateList,
    onMutate: async ({ id, title }) => {
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
              lists: (data.lists || []).map(list => list.id === id ? { ...list, title } : list)
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

// Optimistic updates for list reordering
export const useReorderLists = (boardId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: listService.reorderLists,
    onMutate: async ({ orderedLists }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(boardId) });

      const previousBoard = queryClient.getQueryData(boardKeys.detail(boardId));

      if (previousBoard) {
        // Optimistically update the lists array in the cache
        const newLists = [...previousBoard.data.lists];
        
        // Apply the new positions to the lists
        orderedLists.forEach((orderItem) => {
          const list = newLists.find(l => l.id === orderItem.id);
          if (list) {
            list.position = orderItem.position;
          }
        });
        
        // Sort the lists by their new positions
        newLists.sort((a, b) => a.position - b.position);

        queryClient.setQueryData(boardKeys.detail(boardId), {
          ...previousBoard,
          data: {
            ...previousBoard.data,
            lists: newLists
          }
        });
      }

      return { previousBoard };
    },
    onError: (err, variables, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(boardKeys.detail(boardId), context.previousBoard);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
    },
  });
};

export const useDeleteList = (boardId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: listService.deleteList,
    onMutate: async (id) => {
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
              lists: (data.lists || []).filter(list => list.id !== id)
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
