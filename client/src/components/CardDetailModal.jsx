import { useState, useEffect, useRef } from 'react';
import { useCard, useUpdateCard, useDeleteCard } from '../hooks/useCards';
import { useChecklistMutations } from '../hooks/useChecklists';
import { useAttachmentMutations } from '../hooks/useAttachments';
import { format } from 'date-fns';
import Checklist from './Checklist';
import LabelPopover from './LabelPopover';
import DatePickerPopover from './DatePickerPopover';
import MemberPopover from './MemberPopover';
import CommentSection from './CommentSection';
import AttachmentSection from './AttachmentSection';
import { 
  MdClose, 
  MdCreditCard, 
  MdSubject, 
  MdOutlineChecklist, 
  MdLabelOutline, 
  MdPersonOutline, 
  MdAccessTime, 
  MdAttachFile, 
  MdOutlineImage,
  MdArchive,
  MdUnarchive,
  MdDeleteForever 
} from 'react-icons/md';

const CardDetailModal = ({ cardId, boardId, isOpen, onClose }) => {
  const { data: cardData, isLoading, isError } = useCard(isOpen ? cardId : null);
  const updateCardMutation = useUpdateCard(boardId);
  const deleteCardMutation = useDeleteCard(boardId);
  const checklistMutations = useChecklistMutations(cardId, boardId);
  const { uploadAttachment } = useAttachmentMutations(cardId);
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  
  // Popover states
  const [activePopover, setActivePopover] = useState(null);

  // Safely extract the card from the response shape
  const card = cardData?.data ? cardData.data : cardData;

  useEffect(() => {
    if (card) {
      setTitle(card.title || '');
      setDescription(card.description || '');
    }
  }, [card]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTitleBlur = () => {
    if (title.trim() && title.trim() !== card.title) {
      updateCardMutation.mutate({ id: cardId, data: { title: title.trim() } });
    } else {
      setTitle(card.title || '');
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  const handleSaveDescription = async () => {
    if (description !== card.description) {
      try {
        await updateCardMutation.mutateAsync({ id: cardId, data: { description: description } });
      } catch (err) {
        console.error("Failed to update description", err);
        return; // Don't close edit mode if it failed
      }
    }
    setIsEditingDesc(false);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-lg shadow-xl w-full max-w-3xl h-[80vh] flex items-center justify-center" style={{ backgroundColor: '#282E33' }}>
          <div className="w-10 h-10 border-4 border-trello-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (isError || !card) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleBackdropClick}>
        <div className="rounded-lg shadow-xl w-full max-w-3xl p-8 text-center text-red-400" style={{ backgroundColor: '#282E33' }}>
          Error loading card details. <button onClick={onClose} className="underline ml-2 text-trello-blue">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 sm:px-8 md:px-12 bg-black/60 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="rounded-xl shadow-2xl w-full max-w-3xl mb-16 relative overflow-hidden animate-in fade-in zoom-in duration-200" style={{ backgroundColor: '#282E33' }}>
        
        {/* Cover Image Placeholder */}
        {card.coverColor && (
          <div className="h-28 w-full" style={{ backgroundColor: card.coverColor }} />
        )}
        {card.coverImage && (
          <div 
            className="h-32 w-full bg-cover bg-center" 
            style={{ backgroundImage: `url(${card.coverImage})` }} 
          />
        )}

        <button 
          onClick={onClose}
          className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors z-10 ${
            (card.coverColor || card.coverImage) 
              ? 'bg-black/40 hover:bg-black/60 text-white' 
              : 'text-trello-text-light hover:bg-hover-bg'
          }`}
        >
          <MdClose className="text-xl" />
        </button>

        <div className="p-4 md:p-6 pl-14 md:pl-16 pr-6 md:pr-8 relative">
          
          {/* Header Title Section */}
          <div className="absolute left-6 md:left-8 top-5 md:top-7 text-trello-text-light">
            <MdCreditCard className="text-xl" />
          </div>
          
          <div className="w-full pr-8">
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="w-full text-xl font-bold text-text-heading bg-transparent border-2 border-transparent focus:border-trello-blue focus:bg-surface rounded px-2 py-1 -ml-2 resize-none overflow-hidden h-9"
              rows={1}
            />
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-6">
            {/* Main Column */}
            <div className="flex-1 space-y-8">
              {/* Members + Labels + Due Date Badges */}
              {(card.members?.length > 0 || card.labels?.length > 0 || card.dueDate) && (
                <div className="flex flex-wrap gap-6 mb-4">
                  {/* Members */}
                  {card.members?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">Members</h4>
                      <div className="flex flex-wrap gap-1">
                        {card.members.map(m => (
                          <div 
                            key={m.memberId}
                            className="w-8 h-8 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                            title={m.member?.name}
                            onClick={() => setActivePopover('members')}
                          >
                            {m.member?.avatarUrl ? (
                              <img src={m.member.avatarUrl} alt={m.member.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                                {m.member?.name?.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() || '?'}
                              </div>
                            )}
                          </div>
                        ))}
                        <button 
                          onClick={() => setActivePopover('members')}
                          className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-gray-600 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Labels */}
                  {card.labels?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">Labels</h4>
                      <div className="flex flex-wrap gap-1">
                        {card.labels.map(l => (
                          <div 
                            key={l.labelId}
                            className="h-8 px-3 rounded flex items-center text-white text-sm font-medium cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: l.label.color }}
                            onClick={() => setActivePopover('labels')}
                          >
                            {l.label.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Due Date */}
                  {card.dueDate && (
                    <div>
                      <h4 className="text-xs font-semibold text-trello-text-light mb-1">Due date</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCardMutation.mutate({ id: cardId, data: { isComplete: !card.isComplete } })}
                          className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all shrink-0 ${
                            card.isComplete
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-trello-text-light hover:border-trello-text'
                          }`}
                          title={card.isComplete ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {card.isComplete && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          )}
                        </button>
                        <div 
                          className={`h-8 px-3 rounded flex items-center gap-2 text-sm font-medium cursor-pointer transition-colors ${
                            card.isComplete
                              ? 'bg-green-600/80 text-white hover:bg-green-700/80'
                              : (!card.isComplete && new Date(card.dueDate) < new Date())
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-hover-bg hover:bg-white/10 text-trello-text'
                          }`}
                          onClick={() => setActivePopover('dates')}
                        >
                          <span className="flex items-center gap-1">
                            {format(new Date(card.dueDate), 'MMM d, yyyy')}
                          </span>
                          {card.isComplete && <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded uppercase font-bold">Complete</span>}
                          {!card.isComplete && new Date(card.dueDate) < new Date() && <span className="text-xs bg-black/20 px-1.5 py-0.5 rounded uppercase font-bold">Overdue</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Description Section */}
              <div className="relative">
                <div className="absolute -left-8 top-1 text-trello-text-light">
                  <MdSubject className="text-xl" />
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <h3 className="text-base font-semibold text-text-heading">Description</h3>
                  {card.description && !isEditingDesc && (
                    <button 
                      onClick={() => setIsEditingDesc(true)}
                      className="bg-hover-bg hover:bg-white/10 px-3 py-1.5 rounded text-sm font-medium transition-colors text-trello-text"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {isEditingDesc || !card.description ? (
                  <div className="space-y-2">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a more detailed description..."
                      className="w-full min-h-[100px] p-3 rounded border border-border focus:border-trello-blue focus:ring-1 focus:ring-trello-blue outline-none text-sm resize-y bg-surface text-trello-text"
                      autoFocus={isEditingDesc}
                    />
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleSaveDescription}
                        disabled={updateCardMutation.isPending}
                        className="bg-trello-blue hover:bg-trello-blue-dark text-[#1D2125] px-4 py-1.5 rounded text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        {updateCardMutation.isPending ? 'Saving...' : 'Save'}
                      </button>
                      <button 
                        onClick={() => {
                          setDescription(card.description || '');
                          setIsEditingDesc(false);
                        }}
                        disabled={updateCardMutation.isPending}
                        className="text-trello-text-light hover:bg-hover-bg px-3 py-1.5 rounded text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsEditingDesc(true)}
                    className="bg-hover-bg hover:bg-white/10 p-3 rounded text-sm cursor-pointer min-h-[50px] transition-colors whitespace-pre-wrap text-trello-text"
                  >
                    {card.description}
                  </div>
                )}
              </div>

              {/* Attachments */}
              <AttachmentSection card={card} boardId={boardId} />

              {/* Checklists */}
              {card.checklists && card.checklists.length > 0 && (
                <div className="space-y-6">
                  {card.checklists.map(checklist => (
                    <Checklist key={checklist.id} checklist={checklist} mutations={checklistMutations} />
                  ))}
                </div>
              )}

              {/* Activity & Comments */}
              <CommentSection cardId={cardId} />
            </div>

            {/* Sidebar Column */}
            <div className="w-full md:w-44 shrink-0 space-y-6">
              
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-trello-text-light mb-1">Add to card</h4>
                
                <div className="relative">
                  <SidebarButton icon={<MdPersonOutline />} text="Members" onClick={() => setActivePopover('members')} />
                  {activePopover === 'members' && (
                    <MemberPopover card={card} boardId={boardId} onClose={() => setActivePopover(null)} />
                  )}
                </div>
                
                <div className="relative">
                  <SidebarButton icon={<MdLabelOutline />} text="Labels" onClick={() => setActivePopover('labels')} />
                  {activePopover === 'labels' && (
                    <LabelPopover card={card} boardId={boardId} onClose={() => setActivePopover(null)} />
                  )}
                </div>

                <SidebarButton 
                  icon={<MdOutlineChecklist />} 
                  text="Checklist" 
                  onClick={() => checklistMutations.createChecklist.mutate({ cardId, title: "Checklist" })} 
                />

                <div className="relative">
                  <SidebarButton icon={<MdAccessTime />} text="Dates" onClick={() => setActivePopover('dates')} />
                  {activePopover === 'dates' && (
                    <DatePickerPopover card={card} updateCardMutation={updateCardMutation} onClose={() => setActivePopover(null)} />
                  )}
                </div>

                <SidebarButton 
                  icon={<MdAttachFile />} 
                  text="Attachment" 
                  onClick={() => fileInputRef.current?.click()}
                />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) uploadAttachment.mutate({ cardId: card.id, file });
                    e.target.value = null;
                  }}
                  className="hidden" 
                  accept="image/*,application/pdf,text/plain,.doc,.docx"
                />
                <div className="relative">
                  <SidebarButton icon={<MdOutlineImage />} text="Cover" onClick={() => setActivePopover('cover')} />
                  {activePopover === 'cover' && (
                    <div 
                      className="fixed inset-0 z-[60] flex items-center justify-center bg-transparent sm:bg-black/40"
                      onClick={() => setActivePopover(null)}
                    >
                      <div 
                        className="w-72 rounded-lg shadow-xl border p-4 animate-in fade-in zoom-in duration-150 relative"
                        style={{ backgroundColor: '#282E33', borderColor: '#3D454D' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-text-heading">Cover</h4>
                        <button onClick={() => setActivePopover(null)} className="text-trello-text-light hover:text-trello-text p-1">✕</button>
                      </div>
                      
                      {card.coverColor && (
                        <button
                          onClick={() => { updateCardMutation.mutate({ id: cardId, data: { coverColor: null, coverImage: null } }); setActivePopover(null); }}
                          className="w-full mb-3 bg-hover-bg hover:bg-white/10 px-3 py-1.5 rounded text-sm font-medium text-trello-text transition-colors"
                        >
                          Remove cover
                        </button>
                      )}
                      
                      <p className="text-xs text-trello-text-light mb-2">Colors</p>
                      <div className="grid grid-cols-5 gap-2">
                        {['#4BCE97', '#F5CD47', '#FEA362', '#F87168', '#9F8FEF', '#579DFF', '#6CC3E0', '#94C748', '#E774BB', '#8590A2'].map(color => (
                          <button
                            key={color}
                            onClick={() => {
                              updateCardMutation.mutate({ id: cardId, data: { coverColor: color, coverImage: null } });
                              setActivePopover(null);
                            }}
                            className={`w-full h-8 rounded hover:ring-2 hover:ring-white/50 transition-all ${card.coverColor === color ? 'ring-2 ring-white' : ''}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-trello-text-light mb-1">Actions</h4>
                {card.isArchived ? (
                  <>
                    <SidebarButton 
                      icon={<MdUnarchive />} 
                      text="Send to board" 
                      onClick={() => {
                        updateCardMutation.mutate({ id: cardId, data: { isArchived: false } });
                      }}
                    />
                    <button 
                      onClick={() => {
                        if (window.confirm('Delete this card permanently? This cannot be undone.')) {
                          deleteCardMutation.mutate(cardId);
                          onClose();
                        }
                      }}
                      className="w-full flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm font-medium text-white transition-colors"
                    >
                      <MdDeleteForever /> Delete
                    </button>
                  </>
                ) : (
                  <SidebarButton 
                    icon={<MdArchive />} 
                    text="Archive" 
                    onClick={() => {
                      updateCardMutation.mutate({ id: cardId, data: { isArchived: true } });
                      onClose();
                    }}
                  />
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Small helper component for sidebar buttons
const SidebarButton = ({ icon, text, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-2 bg-hover-bg hover:bg-white/10 px-3 py-1.5 rounded text-sm font-medium text-trello-text transition-colors"
  >
    <span className="text-trello-text-light">{icon}</span>
    {text}
  </button>
);

export default CardDetailModal;
