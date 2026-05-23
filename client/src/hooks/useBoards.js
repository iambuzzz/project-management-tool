import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardService } from '../services/boardService';

// Query Keys
export const boardKeys = {
  all: ['boards'],
  detail: (id) => ['board', id],
};

// Hooks
export const useBoards = () => {
  return useQuery({
    queryKey: boardKeys.all,
    queryFn: boardService.getBoards,
  });
};

export const useBoard = (id) => {
  return useQuery({
    queryKey: boardKeys.detail(id),
    queryFn: () => boardService.getBoard(id),
    enabled: !!id,
  });
};

export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: boardService.createBoard,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
};

export const useUpdateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => boardService.updateBoard(id, data),
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: boardKeys.detail(id) });
      const previousBoard = queryClient.getQueryData(boardKeys.detail(id));
      if (previousBoard) {
        // Handle wrapped { data: { ... } } response
        if (previousBoard.data) {
          queryClient.setQueryData(boardKeys.detail(id), { 
            ...previousBoard, 
            data: { ...previousBoard.data, ...data } 
          });
        } else {
          queryClient.setQueryData(boardKeys.detail(id), { ...previousBoard, ...data });
        }
      }
      return { previousBoard };
    },
    onError: (err, newBoard, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(boardKeys.detail(context.previousBoard.id), context.previousBoard);
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
};

export const useDeleteBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: boardService.deleteBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
    },
  });
};
