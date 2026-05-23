import { useState } from 'react';
import { MdClose } from 'react-icons/md';

const DatePickerPopover = ({ card, updateCardMutation, onClose }) => {
  // Format current date to YYYY-MM-DD for the native input
  const initialDate = card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 10) : '';
  const [date, setDate] = useState(initialDate);

  const handleSave = () => {
    // If empty string, pass null to clear the date
    const finalDate = date ? new Date(date).toISOString() : null;
    
    // Only update if changed
    if (finalDate !== card.dueDate) {
      updateCardMutation.mutate({ id: card.id, data: { dueDate: finalDate } });
    }
    onClose();
  };

  const handleRemove = () => {
    if (card.dueDate) {
      updateCardMutation.mutate({ id: card.id, data: { dueDate: null } });
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-transparent sm:bg-black/20" 
      onClick={onClose}
    >
      <div 
        className="w-72 bg-white rounded-lg shadow-xl border border-gray-200 p-3 animate-in fade-in zoom-in duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 text-gray-500 pb-2 border-b border-gray-100">
          <span className="w-4"></span>
          <h4 className="text-sm font-semibold text-gray-600">Dates</h4>
          <button onClick={onClose} className="hover:bg-black/10 p-1 rounded transition-colors">
            <MdClose />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Due date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-300 rounded focus:border-trello-blue focus:ring-1 focus:ring-trello-blue outline-none text-sm"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button 
              onClick={handleSave}
              className="w-full bg-trello-blue hover:bg-trello-blue-dark text-white py-1.5 rounded text-sm font-medium transition-colors"
            >
              Save
            </button>
            <button 
              onClick={handleRemove}
              className="w-full bg-black/5 hover:bg-black/10 text-gray-600 py-1.5 rounded text-sm font-medium transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatePickerPopover;
