import { useState } from 'react';
import { MdOutlineChecklist, MdDeleteOutline } from 'react-icons/md';

const Checklist = ({ checklist, mutations }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(checklist.title);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  const items = checklist.items || [];
  const completedCount = items.filter(item => item.isCompleted).length;
  const progress = items.length === 0 ? 0 : Math.round((completedCount / items.length) * 100);

  const handleSaveTitle = () => {
    if (title.trim() && title !== checklist.title) {
      mutations.updateChecklist.mutate({ id: checklist.id, title: title.trim() });
    } else {
      setTitle(checklist.title);
    }
    setIsEditingTitle(false);
  };

  const handleAddItem = () => {
    if (newItemText.trim()) {
      mutations.addItem.mutate({ checklistId: checklist.id, text: newItemText.trim() });
      setNewItemText('');
      // keep it open for quick consecutive adds
    }
  };

  const handleDeleteChecklist = () => {
    if (window.confirm("Are you sure you want to delete this checklist?")) {
      mutations.deleteChecklist.mutate(checklist.id);
    }
  };

  return (
    <div className="relative mb-6">
      <div className="absolute -left-8 top-1 text-trello-text-light">
        <MdOutlineChecklist className="text-xl" />
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1 mr-4">
          {isEditingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
              className="w-full text-base font-semibold text-text-heading bg-surface border-2 border-trello-blue rounded px-2 py-1 -ml-2"
            />
          ) : (
            <h3 
              onClick={() => setIsEditingTitle(true)}
              className="text-base font-semibold text-text-heading cursor-pointer hover:bg-hover-bg rounded py-1 px-2 -ml-2 transition-colors"
            >
              {checklist.title}
            </h3>
          )}
        </div>
        <button 
          onClick={handleDeleteChecklist}
          className="bg-hover-bg hover:bg-white/10 px-3 py-1.5 rounded text-sm font-medium transition-colors text-trello-text-light"
        >
          Delete
        </button>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-trello-text-light w-8">{progress}%</span>
        <div className="flex-1 h-2 bg-surface rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${progress === 100 ? 'bg-green-500' : 'bg-trello-blue-light'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {items.map(item => (
          <ChecklistItem key={item.id} item={item} mutations={mutations} />
        ))}
      </div>

      {/* Add Item Form */}
      {isAddingItem ? (
        <div className="mt-2 space-y-2">
          <textarea
            autoFocus
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAddItem();
              }
            }}
            placeholder="Add an item..."
            className="w-full min-h-[56px] p-2 rounded border border-border focus:border-trello-blue focus:ring-1 focus:ring-trello-blue outline-none text-sm resize-y bg-surface text-trello-text"
          />
          <div className="flex items-center gap-2">
            <button 
              onClick={handleAddItem}
              className="bg-trello-blue hover:bg-trello-blue-dark text-[#1D2125] px-4 py-1.5 rounded text-sm font-semibold transition-colors"
            >
              Add
            </button>
            <button 
              onClick={() => {
                setIsAddingItem(false);
                setNewItemText('');
              }}
              className="text-trello-text-light hover:bg-hover-bg px-3 py-1.5 rounded text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsAddingItem(true)}
          className="bg-hover-bg hover:bg-white/10 px-3 py-1.5 rounded text-sm font-medium transition-colors text-trello-text"
        >
          Add an item
        </button>
      )}
    </div>
  );
};

const ChecklistItem = ({ item, mutations }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.text);

  const handleToggle = () => {
    mutations.updateItem.mutate({ id: item.id, isCompleted: !item.isCompleted });
  };

  const handleSaveText = () => {
    if (text.trim() && text !== item.text) {
      mutations.updateItem.mutate({ id: item.id, text: text.trim() });
    } else {
      setText(item.text);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-start gap-3 group relative rounded hover:bg-hover-bg p-1 -ml-1 transition-colors">
      <input 
        type="checkbox"
        checked={item.isCompleted}
        onChange={handleToggle}
        className="mt-1.5 w-4 h-4 rounded-sm border-gray-300 text-trello-blue focus:ring-trello-blue cursor-pointer"
      />
      
      {isEditing ? (
        <div className="flex-1 flex flex-col gap-2">
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleSaveText}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSaveText();
              }
            }}
            className="w-full min-h-[40px] p-2 rounded border border-trello-blue focus:ring-1 focus:ring-trello-blue outline-none text-sm resize-y bg-surface text-trello-text"
          />
        </div>
      ) : (
        <div 
          onClick={() => setIsEditing(true)}
          className={`flex-1 text-sm py-1 cursor-pointer break-words ${item.isCompleted ? 'line-through text-trello-text-light' : 'text-trello-text'}`}
        >
          {item.text}
        </div>
      )}

      {!isEditing && (
        <button 
          onClick={() => mutations.deleteItem.mutate(item.id)}
          className="p-1.5 text-trello-text-light hover:text-trello-text hover:bg-hover-bg rounded opacity-0 group-hover:opacity-100 transition-all absolute right-1 top-1"
        >
          <MdDeleteOutline />
        </button>
      )}
    </div>
  );
};

export default Checklist;
