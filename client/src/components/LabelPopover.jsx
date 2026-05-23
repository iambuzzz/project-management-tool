import { MdClose, MdCheck } from 'react-icons/md';
import { useLabels, useLabelMutations } from '../hooks/useLabels';

const LabelPopover = ({ card, boardId, onClose }) => {
  const { data, isLoading } = useLabels();
  const labelMutations = useLabelMutations(card.id, boardId);

  // Extract labels properly based on response format
  const allLabels = data?.data || data || [];
  
  // Extract assigned label IDs
  const assignedLabelIds = card.labels ? card.labels.map(l => l.labelId) : [];

  const handleToggleLabel = (labelId) => {
    if (assignedLabelIds.includes(labelId)) {
      labelMutations.removeLabel.mutate({ cardId: card.id, labelId });
    } else {
      labelMutations.addLabel.mutate({ cardId: card.id, labelId });
    }
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
          <h4 className="text-sm font-semibold text-gray-600">Labels</h4>
          <button onClick={onClose} className="hover:bg-black/10 p-1 rounded transition-colors">
            <MdClose />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-4 text-sm text-gray-500">Loading labels...</div>
        ) : (
          <div className="space-y-1">
            {allLabels.map((label) => {
              const isAssigned = assignedLabelIds.includes(label.id);
              return (
                <div 
                  key={label.id}
                  onClick={() => handleToggleLabel(label.id)}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <div 
                    className="flex-1 h-8 rounded px-3 flex items-center justify-between text-white text-sm font-medium transition-opacity hover:opacity-80"
                    style={{ backgroundColor: label.color }}
                  >
                    <span className="truncate drop-shadow-sm">{label.name}</span>
                    {isAssigned && <MdCheck className="text-white shrink-0 drop-shadow-sm" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabelPopover;
