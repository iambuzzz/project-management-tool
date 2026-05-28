import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import api from '../services/api';
import { useBoard, useUpdateBoard, useDeleteBoard } from '../hooks/useBoards';
import { useReorderLists } from '../hooks/useLists';
import { useReorderCards, useMoveCard, useUpdateCard, useDeleteCard } from '../hooks/useCards';
import List from '../components/List';
import { AddListForm } from '../components/InlineForms';
import CardDetailModal from '../components/CardDetailModal';
import BoardFilterBar from '../components/BoardFilterBar';
import { MdArchive, MdClose, MdUnarchive, MdDeleteForever, MdMoreHoriz, MdAdd } from 'react-icons/md';

const Board = () => {
  const { id } = useParams();
  const { data: boardData, isLoading, isError, error } = useBoard(id);
  
  const reorderListsMutation = useReorderLists(id);
  const reorderCardsMutation = useReorderCards(id);
  const updateCardMutation = useUpdateCard(id);
  const deleteCardMutation = useDeleteCard(id);

  const updateBoardMutation = useUpdateBoard();
  const deleteBoardMutation = useDeleteBoard();

  // Local state for optimistic UI during drag
  const [lists, setLists] = useState([]);
  
  // State for card modal
  const [selectedCardId, setSelectedCardId] = useState(null);

  // Archive drawer state
  const [showArchived, setShowArchived] = useState(false);
  const [showBoardMenu, setShowBoardMenu] = useState(false);

  // Filter state
  const [activeFilters, setActiveFilters] = useState({ labels: [], members: [], dueDate: null });
  const hasFilters = activeFilters.labels.length > 0 || activeFilters.members.length > 0 || activeFilters.dueDate;

  useEffect(() => {
    const listsData = boardData?.data?.lists || boardData?.lists;
    if (listsData) {
      setLists(listsData);
    }
  }, [boardData]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-trello-bg h-full w-full">
        <div className="w-10 h-10 border-4 border-trello-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Error loading board: {error.message}</div>;
  }

  const board = boardData?.data ? boardData.data : boardData;
  
  if (!board) {
    return <div className="p-8 text-center text-trello-text">Board not found.</div>;
  }
  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'list') {
      const newLists = Array.from(lists);
      const [removed] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, removed);

      newLists.forEach((list, index) => { list.position = (index + 1) * 1000; });
      setLists(newLists);
      reorderListsMutation.mutate({ orderedLists: newLists.map((l) => ({ id: l.id, position: l.position })) });
      return;
    }

    if (type === 'card') {
      const sourceList = lists.find((l) => l.id === source.droppableId);
      const destList = lists.find((l) => l.id === destination.droppableId);
      if (!sourceList || !destList) return;

      if (source.droppableId === destination.droppableId) {
        const newCards = Array.from(sourceList.cards);
        const [removed] = newCards.splice(source.index, 1);
        newCards.splice(destination.index, 0, removed);
        newCards.forEach((card, index) => { card.position = (index + 1) * 1000; });
        const newLists = lists.map((l) => l.id === sourceList.id ? { ...l, cards: newCards } : l);
        
        setLists(newLists);
        reorderCardsMutation.mutate({ orderedCards: newCards.map((c) => ({ id: c.id, position: c.position })) });
      } else {
        const sourceCards = Array.from(sourceList.cards);
        const destCards = Array.from(destList.cards);
        const [removed] = sourceCards.splice(source.index, 1);
        destCards.splice(destination.index, 0, removed);
        destCards.forEach((card, index) => { card.position = (index + 1) * 1000; });
        const newLists = lists.map((l) => {
          if (l.id === sourceList.id) return { ...l, cards: sourceCards };
          if (l.id === destList.id) return { ...l, cards: destCards };
          return l;
        });

        setLists(newLists);
        reorderCardsMutation.mutate({
          orderedCards: destCards.map((c) => ({ id: c.id, position: c.position, listId: destList.id })),
        });
      }
    }
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full w-full bg-cover bg-center overflow-hidden"
      style={{ 
        backgroundColor: board.backgroundColor,
        backgroundImage: board.backgroundImage ? `url(${board.backgroundImage})` : 'none',
      }}
    >
      <div className="h-auto min-h-12 px-4 py-2 flex items-center justify-between flex-wrap gap-2 bg-black/40 text-trello-text backdrop-blur-sm relative z-50">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-bold text-lg px-2 hover:bg-white/10 rounded cursor-pointer transition-colors text-text-heading">
            {board.title}
          </h1>
          <div className="w-px h-4 bg-white/20 mx-1"></div>
          <div className="relative">
            <BoardFilterBar boardId={board.id} onFilterChange={setActiveFilters} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              showArchived ? 'bg-white/30 text-white' : 'bg-white/10 hover:bg-white/20 text-trello-text-light'
            }`}
            onClick={() => {
              setShowArchived(!showArchived);
              if (showBoardMenu) setShowBoardMenu(false);
            }}
          >
            <MdArchive /> Archive
          </button>
          
          <button 
            className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${
              showBoardMenu ? 'bg-white/30 text-white' : 'bg-white/10 hover:bg-white/20 text-trello-text-light'
            }`}
            onClick={() => {
              setShowBoardMenu(!showBoardMenu);
              if (showArchived) setShowArchived(false);
            }}
          >
            <MdMoreHoriz className="text-lg" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-3 custom-scrollbar">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided) => (
              <div 
                className="flex h-full items-start gap-3 after:content-[''] after:block after:min-w-[12px] after:shrink-0"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {lists.map((list, index) => {
                  // Apply client-side filtering
                  const filteredList = hasFilters ? {
                    ...list,
                    cards: list.cards?.filter(card => {
                      // Label filter
                      if (activeFilters.labels.length > 0) {
                        const cardLabelIds = card.labels?.map(l => l.labelId) || [];
                        if (!activeFilters.labels.some(id => cardLabelIds.includes(id))) return false;
                      }
                      // Member filter
                      if (activeFilters.members.length > 0) {
                        const cardMemberIds = card.members?.map(m => m.memberId) || [];
                        if (!activeFilters.members.some(id => cardMemberIds.includes(id))) return false;
                      }
                      // Due date filter
                      if (activeFilters.dueDate) {
                        const now = new Date();
                        switch (activeFilters.dueDate) {
                          case 'overdue':
                            if (!card.dueDate || new Date(card.dueDate) >= now) return false;
                            break;
                          case 'today': {
                            if (!card.dueDate) return false;
                            const d = new Date(card.dueDate);
                            if (d.toDateString() !== now.toDateString()) return false;
                            break;
                          }
                          case 'week': {
                            if (!card.dueDate) return false;
                            const d2 = new Date(card.dueDate);
                            const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                            if (d2 < now || d2 > weekEnd) return false;
                            break;
                          }
                          case 'none':
                            if (card.dueDate) return false;
                            break;
                        }
                      }
                      return true;
                    }) || []
                  } : list;

                  return (
                    <List 
                      key={list.id} 
                      list={filteredList} 
                      index={index} 
                      boardId={board.id} 
                      onCardClick={setSelectedCardId} 
                    />
                  );
                })}
                {provided.placeholder}
                
                <AddListForm boardId={board.id} />
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Archived Cards Drawer */}
      {showArchived && (
        <ArchivedCardsPanel 
          boardId={board.id}
          onClose={() => setShowArchived(false)}
          onCardClick={setSelectedCardId}
          updateCardMutation={updateCardMutation}
          deleteCardMutation={deleteCardMutation}
        />
      )}

      {showBoardMenu && (
        <BoardMenuPanel
          board={board}
          onClose={() => setShowBoardMenu(false)}
          updateBoardMutation={updateBoardMutation}
          deleteBoardMutation={deleteBoardMutation}
        />
      )}

      <CardDetailModal 
        cardId={selectedCardId} 
        boardId={board.id}
        isOpen={!!selectedCardId} 
        onClose={() => setSelectedCardId(null)} 
      />
    </div>
  );
};

// Archived Cards Panel Component
const ArchivedCardsPanel = ({ boardId, onClose, onCardClick, updateCardMutation, deleteCardMutation }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['archivedCards', boardId],
    queryFn: async () => {
      const res = await api.get(`/boards/${boardId}/cards/archived`);
      return res.data;
    },
  });

  const archivedCards = data?.data || [];

  return (
    <div 
      className="fixed right-0 top-12 bottom-0 w-80 z-[60] shadow-2xl border-l overflow-y-auto"
      style={{ backgroundColor: '#282E33', borderColor: '#3D454D' }}
    >
      <div className="flex items-center justify-between p-3 border-b sticky top-0 z-10" style={{ backgroundColor: '#282E33', borderColor: '#3D454D' }}>
        <h3 className="text-sm font-semibold text-text-heading">Archive</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-hover-bg rounded text-trello-text-light hover:text-text-heading transition-colors"
        >
          <MdClose />
        </button>
      </div>

      <div className="p-3 space-y-2">
        {isLoading && <div className="text-sm text-trello-text-light text-center py-4">Loading...</div>}
        {!isLoading && archivedCards.length === 0 && (
          <div className="text-sm text-trello-text-light text-center py-8">No archived cards</div>
        )}
        {archivedCards.map(card => (
          <div 
            key={card.id} 
            className="rounded-lg p-3 border cursor-pointer hover:bg-white/5 transition-colors"
            style={{ backgroundColor: '#22272B', borderColor: '#3D454D' }}
          >
            <div 
              className="text-sm font-medium text-text-heading mb-1 hover:underline"
              onClick={() => onCardClick(card.id)}
            >
              {card.title}
            </div>
            <div className="text-xs text-trello-text-light mb-2">
              {card.list?.title || 'Unknown list'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateCardMutation.mutate({ id: card.id, data: { isArchived: false } })}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-hover-bg hover:bg-white/10 text-trello-text transition-colors"
              >
                <MdUnarchive className="text-sm" /> Restore
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Delete permanently? This cannot be undone.')) {
                    deleteCardMutation.mutate(card.id);
                  }
                }}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-600/20 hover:bg-red-600/40 text-red-400 transition-colors"
              >
                <MdDeleteForever className="text-sm" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Board Menu Panel Component
const BoardMenuPanel = ({ board, onClose, updateBoardMutation, deleteBoardMutation }) => {
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const PRESET_COLORS = [
    '#0079BF', '#D29034', '#519839', '#B04632', '#89609E', '#CD5A91', '#4BBF6B', '#00AECC', '#838C91'
  ];
  
  const PRESET_IMAGES = [
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=100&w=2560&auto=format&fit=crop', // Space
    'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=100&w=2560&auto=format&fit=crop', // Stars
    'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=100&w=2560&auto=format&fit=crop', // Nature
  ];

  const handleUpdateBackground = (color, image = null) => {
    updateBoardMutation.mutate({ 
      id: board.id, 
      backgroundColor: color, 
      backgroundImage: image 
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post(`/boards/${board.id}/background`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      handleUpdateBackground('#0079BF', res.data.url);
    } catch (err) {
      console.error('Failed to upload background', err);
      alert('Failed to upload background photo. Make sure it is under 10MB.');
    } finally {
      setIsUploading(false);
    }
  };

  const isCustomImage = board.backgroundImage && !PRESET_IMAGES.includes(board.backgroundImage);

  return (
    <div 
      className="fixed right-0 top-12 bottom-0 w-80 z-[60] shadow-2xl border-l overflow-y-auto"
      style={{ backgroundColor: '#282E33', borderColor: '#3D454D' }}
    >
      <div className="flex items-center justify-between p-3 border-b sticky top-0 z-10" style={{ backgroundColor: '#282E33', borderColor: '#3D454D' }}>
        <h3 className="text-sm font-semibold text-text-heading">Menu</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-hover-bg rounded text-trello-text-light hover:text-text-heading transition-colors"
        >
          <MdClose />
        </button>
      </div>

      <div className="p-4">
        <h4 className="text-xs font-semibold text-trello-text-light uppercase tracking-wider mb-3">Change Background</h4>
        
        <div className="mb-4">
          <div className="text-sm text-text-heading mb-2">Photos</div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <label 
              className="h-20 rounded cursor-pointer bg-cover bg-center hover:opacity-80 transition-opacity flex items-center justify-center relative overflow-hidden"
              style={
                isCustomImage
                  ? { backgroundImage: `url(${board.backgroundImage})` }
                  : { backgroundColor: 'rgba(255,255,255,0.05)' }
              }
            >
              {isCustomImage && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
              )}
              {!isUploading && (
                <MdAdd className="text-3xl text-white opacity-80 hover:opacity-100 relative z-10 drop-shadow-lg" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                  <span className="text-white text-xs font-medium">Uploading...</span>
                </div>
              )}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
            {PRESET_IMAGES.map((img, i) => (
              <div 
                key={i}
                className="h-20 rounded cursor-pointer bg-cover bg-center hover:opacity-80 transition-opacity"
                style={{ backgroundImage: `url(${img})` }}
                onClick={() => handleUpdateBackground('#0079BF', img)}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm text-text-heading mb-2">Colors</div>
          <div className="grid grid-cols-3 gap-2">
            {PRESET_COLORS.map((color, i) => (
              <div 
                key={i}
                className="h-16 rounded cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: color }}
                onClick={() => handleUpdateBackground(color, null)}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 border-t pt-4" style={{ borderColor: '#3D454D' }}>
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
                deleteBoardMutation.mutate(board.id, {
                  onSuccess: () => navigate('/boards')
                });
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors"
          >
            <MdDeleteForever className="text-lg" />
            Delete board
          </button>
        </div>
      </div>
    </div>
  );
};

export default Board;
