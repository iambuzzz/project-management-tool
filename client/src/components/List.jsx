import { useState, useRef, useEffect } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import Card from './Card';
import { AddCardForm } from './InlineForms';
import { useUpdateList, useDeleteList } from '../hooks/useLists';
import { MdMoreHoriz } from 'react-icons/md';

const List = ({ list, index, boardId, onCardClick }) => {
  const cards = list.cards || [];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  const updateList = useUpdateList(boardId);
  const deleteList = useDeleteList(boardId);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Auto-focus title input
  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleSaveTitle = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== list.title) {
      updateList.mutate({ id: list.id, title: trimmed });
    } else {
      setEditTitle(list.title);
    }
    setIsEditingTitle(false);
  };

  const handleDeleteList = () => {
    if (window.confirm(`Delete list "${list.title}" and all its cards? This cannot be undone.`)) {
      deleteList.mutate(list.id);
    }
    setIsMenuOpen(false);
  };

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="w-72 shrink-0 flex flex-col rounded-xl max-h-[calc(100vh-140px)]"
          style={{
            ...provided.draggableProps.style,
            backgroundColor: '#101204',
          }}
        >
          {/* List Header */}
          <div 
            {...provided.dragHandleProps} 
            className="flex items-center justify-between px-3 pt-3 pb-1.5 cursor-grab active:cursor-grabbing"
          >
            {isEditingTitle ? (
              <input
                ref={inputRef}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') { setEditTitle(list.title); setIsEditingTitle(false); }
                }}
                className="text-sm font-semibold text-text-heading truncate flex-1 bg-surface px-1.5 py-0.5 rounded border border-trello-blue outline-none"
              />
            ) : (
              <h2 
                className="text-sm font-semibold text-text-heading truncate flex-1 cursor-pointer px-1.5 py-0.5 rounded hover:bg-hover-bg transition-colors"
                onClick={() => setIsEditingTitle(true)}
              >
                {list.title}
              </h2>
            )}
            <div className="flex items-center gap-1.5 shrink-0 relative" ref={menuRef}>
              <span className="text-xs text-trello-text-light font-medium">
                {cards.length}
              </span>
              <button 
                className="p-1 hover:bg-hover-bg rounded text-trello-text-light hover:text-text-heading transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <MdMoreHoriz className="text-lg" />
              </button>

              {/* List Actions Menu */}
              {isMenuOpen && (
                <div 
                  className="absolute right-0 top-full mt-1 w-56 rounded-lg shadow-2xl border z-50 overflow-hidden"
                  style={{ backgroundColor: '#282E33', borderColor: '#3D454D' }}
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: '#3D454D' }}>
                    <span className="w-4"></span>
                    <h4 className="text-sm font-semibold text-text-heading">List actions</h4>
                    <button 
                      onClick={() => setIsMenuOpen(false)} 
                      className="text-trello-text-light hover:text-text-heading p-0.5 rounded transition-colors"
                    >✕</button>
                  </div>
                  <div className="py-1">
                    <button 
                      className="w-full text-left px-3 py-1.5 text-sm text-trello-text hover:bg-hover-bg transition-colors"
                      onClick={() => { setIsMenuOpen(false); setIsEditingTitle(true); }}
                    >
                      Edit list title
                    </button>
                    <div className="border-t my-1" style={{ borderColor: '#3D454D' }}></div>
                    <button 
                      className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      onClick={handleDeleteList}
                    >
                      Delete this list
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cards Droppable Zone */}
          <Droppable droppableId={list.id} type="card">
            {(dropProvided, dropSnapshot) => (
              <div
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                className={`flex-1 overflow-y-auto overflow-x-hidden px-1.5 pt-1 pb-1 space-y-1.5 min-h-[4px] transition-colors ${
                  dropSnapshot.isDraggingOver ? 'bg-white/5 rounded-lg' : ''
                }`}
              >
                {cards.map((card, cardIndex) => (
                  <Card 
                    key={card.id} 
                    card={card} 
                    index={cardIndex}
                    boardId={boardId}
                    onClick={() => onCardClick(card.id)} 
                  />
                ))}
                {dropProvided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Card */}
          <div className="px-1.5 pb-1.5">
            <AddCardForm listId={list.id} boardId={boardId} />
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default List;
