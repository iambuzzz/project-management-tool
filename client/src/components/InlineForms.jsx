import { useState, useRef, useEffect } from 'react';
import { useCreateList } from '../hooks/useLists';
import { useCreateCard } from '../hooks/useCards';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { MdOutlineNoteAdd } from 'react-icons/md';

export const AddListForm = ({ boardId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);
  
  const createListMutation = useCreateList(boardId);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createListMutation.mutate({ boardId, title });
    setTitle('');
    setIsOpen(false);
  };

  if (isOpen) {
    return (
      <div className="w-72 shrink-0 rounded-xl p-2 h-fit" style={{ backgroundColor: '#101204' }}>
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter list title..."
            className="w-full px-3 py-1.5 text-sm border-2 border-trello-blue rounded bg-surface text-trello-text focus:outline-none mb-2"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!title.trim() || createListMutation.isPending}
              className="bg-trello-blue hover:bg-trello-blue-dark text-[#1D2125] text-sm font-semibold px-3 py-1.5 rounded transition-colors"
            >
              Add list
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-trello-text-light hover:text-trello-text p-1.5 text-lg transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-72 shrink-0 h-fit">
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-white/10 hover:bg-white/20 text-trello-text flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors"
      >
        <FaPlus className="text-xs" /> Add another list
      </button>
    </div>
  );
};

export const AddCardForm = ({ listId, boardId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const textareaRef = useRef(null);
  
  const createCardMutation = useCreateCard(boardId);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    createCardMutation.mutate({ listId, title });
    setTitle('');
    setIsOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (isOpen) {
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Enter a title for this card..."
            className="w-full px-2 py-1.5 text-sm text-trello-text bg-surface border-none rounded-lg focus:ring-2 focus:ring-trello-blue outline-none resize-none mb-1.5 min-h-[60px]"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!title.trim() || createCardMutation.isPending}
              className="bg-trello-blue hover:bg-trello-blue-dark text-[#1D2125] text-sm font-semibold px-3 py-1.5 rounded transition-colors"
            >
              Add card
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-trello-text-light hover:text-trello-text p-1.5 text-lg transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <button 
        onClick={() => setIsOpen(true)}
        className="flex-1 flex items-center gap-2 px-2 py-1.5 text-trello-text-light hover:bg-hover-bg hover:text-trello-text rounded-lg text-sm font-medium transition-colors"
      >
        <FaPlus className="text-xs" /> Add a card
      </button>
    </div>
  );
};
