import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Draggable } from '@hello-pangea/dnd';
import { useUpdateCard } from '../hooks/useCards';
import { format } from 'date-fns';
import { 
  MdChatBubbleOutline, MdAttachFile, MdChecklist, MdEdit,
  MdCreditCard, MdLabelOutline, MdPersonOutline, MdOutlineImage,
  MdAccessTime, MdArrowForward, MdContentCopy, MdLink, MdArchive
} from 'react-icons/md';
import { FaRegClock } from 'react-icons/fa';

const Card = ({ card, index, boardId, onClick }) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const editBtnRef = useRef(null);

  // Compute checklist progress
  let totalItems = 0;
  let completedItems = 0;
  if (card.checklists?.length > 0) {
    card.checklists.forEach(cl => {
      if (cl.items) {
        totalItems += cl.items.length;
        completedItems += cl.items.filter(item => item.isCompleted).length;
      }
    });
  }
  const hasChecklist = totalItems > 0;
  const isChecklistComplete = hasChecklist && totalItems === completedItems;
  const isOverdue = card.dueDate && !card.isComplete && new Date(card.dueDate) < new Date();
  const updateCard = useUpdateCard(boardId);

  const handleToggleComplete = (e) => {
    e.stopPropagation();
    updateCard.mutate({ id: card.id, data: { isComplete: !card.isComplete } });
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    const rect = editBtnRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPos({
        top: rect.top,
        left: rect.right + 8,
      });
    }
    setShowQuickMenu(true);
  };

  const menuItems = [
    { icon: <MdCreditCard />, label: 'Open card', action: () => { setShowQuickMenu(false); onClick(); } },
    { icon: <MdLabelOutline />, label: 'Edit labels', action: () => { setShowQuickMenu(false); onClick(); } },
    { icon: <MdPersonOutline />, label: 'Change members', action: () => { setShowQuickMenu(false); onClick(); } },
    { icon: <MdOutlineImage />, label: 'Change cover', action: () => { setShowQuickMenu(false); onClick(); } },
    { icon: <MdAccessTime />, label: 'Edit dates', action: () => { setShowQuickMenu(false); onClick(); } },
    { icon: <MdArrowForward />, label: 'Move' },
    { icon: <MdContentCopy />, label: 'Copy card' },
    { icon: <MdLink />, label: 'Copy link' },
    { icon: <MdArchive />, label: 'Archive', action: () => { setShowQuickMenu(false); onClick(); } },
  ];
  
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group relative rounded-lg cursor-grab active:cursor-grabbing transition-all ${
            snapshot.isDragging 
              ? 'rotate-2 scale-105 shadow-2xl ring-2 ring-trello-blue z-50' 
              : 'hover:ring-2 hover:ring-trello-blue'
          }`}
          style={{
            ...provided.draggableProps.style,
            backgroundColor: '#22272B',
          }}
          onClick={() => {
            if (!showQuickMenu) onClick();
          }}
        >
          {/* Cover Color/Image */}
          {card.coverColor && !card.coverImage && (
            <div 
              className="h-8 rounded-t-lg w-full"
              style={{ backgroundColor: card.coverColor }}
            />
          )}
          {card.coverImage && (
            <div 
              className="h-32 rounded-t-lg w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${card.coverImage})` }}
            />
          )}

          <div className="p-2 pb-1.5">
            {/* Labels */}
            {card.labels?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {card.labels.map(l => (
                  <div 
                    key={l.labelId}
                    className="h-2 w-10 rounded-full"
                    style={{ backgroundColor: l.label.color }}
                    title={l.label.name}
                  />
                ))}
              </div>
            )}

            {/* Title with completion checkbox */}
            <div className="flex items-start gap-1.5">
              <button
                onClick={handleToggleComplete}
                className={`mt-0.5 shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
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
              <h3 className={`text-sm break-words leading-5 ${
                card.isComplete ? 'line-through text-trello-text-light' : 'text-trello-text'
              }`}>
                {card.title}
              </h3>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-trello-text-light">
              {card.description && (
                <div className="flex items-center" title="Description">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V6C20 6.55228 19.5523 7 19 7H5C4.44772 7 4 6.55228 4 6V5ZM4 11C4 10.4477 4.44772 10 5 10H19C19.5523 10 20 10.4477 20 11V12C20 12.5523 19.5523 13 19 13H5C4.44772 13 4 12.5523 4 12V11ZM4 17C4 16.4477 4.44772 16 5 16H13C13.5523 16 14 16.4477 14 17V18C14 18.5523 13.5523 19 13 19H5C4.44772 19 4 18.5523 4 18V17Z" />
                  </svg>
                </div>
              )}

              {card.dueDate && (
                <div 
                  className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
                    card.isComplete 
                      ? 'bg-green-600/80 text-white' 
                      : isOverdue 
                        ? 'bg-red-500/80 text-white' 
                        : 'text-trello-text-light'
                  }`}
                  title={card.isComplete ? 'Completed' : isOverdue ? 'Overdue' : 'Due date'}
                >
                  <FaRegClock className="text-[10px]" />
                  <span>{format(new Date(card.dueDate), 'MMM d')}</span>
                </div>
              )}

              {hasChecklist && (
                <div className={`flex items-center gap-1 text-xs ${
                  isChecklistComplete ? 'bg-green-600/80 text-white px-1.5 py-0.5 rounded' : ''
                }`}>
                  <MdChecklist className="text-sm" />
                  <span>{completedItems}/{totalItems}</span>
                </div>
              )}

              {card._count?.comments > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <MdChatBubbleOutline className="text-sm" />
                  <span>{card._count.comments}</span>
                </div>
              )}

              {card._count?.attachments > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <MdAttachFile className="text-sm" />
                  <span>{card._count.attachments}</span>
                </div>
              )}
            </div>

            {/* Members */}
            {card.members?.length > 0 && (
              <div className="flex justify-end mt-1.5 space-x-[-6px]">
                {card.members.map(m => (
                  <div key={m.memberId} className="w-6 h-6 rounded-full ring-2 ring-[#22272B] overflow-hidden bg-gray-600">
                    {m.member?.avatarUrl ? (
                      <img src={m.member.avatarUrl} alt={m.member.name} title={m.member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-white bg-blue-600">
                        {m.member?.name?.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hover Edit Button */}
          <button
            ref={editBtnRef}
            onClick={handleEditClick}
            className="absolute top-1 right-1 p-1.5 rounded-sm text-trello-text-light hover:text-text-heading opacity-0 group-hover:opacity-100 transition-all z-10"
            style={{ backgroundColor: 'rgba(40,46,51,0.9)' }}
          >
            <MdEdit className="text-sm" />
          </button>

          {/* Quick Edit Context Menu — rendered as portal to avoid overflow clipping */}
          {showQuickMenu && createPortal(
            <>
              <div className="fixed inset-0 z-[100]" onClick={(e) => { e.stopPropagation(); setShowQuickMenu(false); }} />
              <div 
                className="fixed z-[101] w-44 py-1.5 rounded-lg shadow-2xl border animate-in fade-in zoom-in duration-100"
                style={{ 
                  top: menuPos.top, 
                  left: menuPos.left,
                  backgroundColor: '#282E33',
                  borderColor: '#3D454D',
                }}
              >
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item.action) item.action();
                      else setShowQuickMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-trello-text hover:bg-white/10 transition-colors font-medium"
                  >
                    <span className="text-base text-trello-text-light">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </>,
            document.body
          )}
        </div>
      )}
    </Draggable>
  );
};

export default Card;

