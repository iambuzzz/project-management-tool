import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateBoard } from '../hooks/useBoards';
import { MdClose } from 'react-icons/md';

const COLORS = [
  '#0079BF', // Blue (default)
  '#D29034', // Orange
  '#519839', // Green
  '#B04632', // Red
  '#89609E', // Purple
  '#CD5A91', // Pink
  '#4BBF6B', // Light Green
  '#00AECC', // Light Blue
  '#838C91', // Gray
];

const CreateBoardModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [error, setError] = useState('');
  
  const createBoardMutation = useCreateBoard();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Board title is required 😅');
      return;
    }
    
    try {
      const newBoard = await createBoardMutation.mutateAsync({
        title,
        backgroundColor: selectedColor
      });
      
      // Navigate to the newly created board
      setTitle('');
      setSelectedColor(COLORS[0]);
      onClose();
      navigate(`/b/${newBoard.data.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create board');
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/50"
      onClick={handleBackdropClick}
    >
      <div className="rounded-lg shadow-xl w-[400px] overflow-hidden animate-in fade-in zoom-in duration-200" style={{ backgroundColor: '#282E33' }}>
        
        {/* Header */}
        <div className="relative flex items-center justify-center p-4 border-b" style={{ borderColor: '#3D454D' }}>
          <h2 className="text-text-heading font-semibold">Create board</h2>
          <button 
            onClick={onClose}
            className="absolute right-4 p-1 text-trello-text-light hover:bg-hover-bg rounded transition-colors"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          {/* Board Preview */}
          <div className="flex justify-center mb-4">
            <div 
              className="w-48 h-28 rounded shadow-inner flex items-center justify-center transition-colors duration-200"
              style={{ backgroundColor: selectedColor }}
            >
              <img 
                src="https://trello.com/assets/14cda5dc635d1f13bc48.svg" 
                alt="Board preview" 
                className="opacity-90 w-32"
              />
            </div>
          </div>

          {/* Background Selection */}
          <div>
            <label className="block text-xs font-bold text-trello-text-light mb-2">
              Background
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`h-8 rounded relative transition-transform hover:scale-105 ${
                    selectedColor === color ? 'ring-2 ring-offset-1 ring-trello-blue' : ''
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-xs">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label htmlFor="boardTitle" className="block text-xs font-bold text-trello-text-light mb-1">
              Board title <span className="text-red-500">*</span>
            </label>
            <input
              id="boardTitle"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className={`w-full px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-trello-blue transition-all text-trello-text ${
                error ? 'border-red-500 bg-surface' : 'border-border bg-surface hover:bg-surface-raised focus:bg-surface-raised'
              }`}
              placeholder="Enter board title"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            <p className="text-xs text-trello-text-light mt-2">
              👋 Board title is required
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={createBoardMutation.isPending || !title.trim()}
            className="w-full py-2 bg-trello-blue hover:bg-trello-blue-dark text-[#1D2125] rounded font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {createBoardMutation.isPending ? 'Creating...' : 'Create'}
          </button>
          
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;
