import { useRef } from 'react';
import { MdAttachFile, MdDeleteOutline, MdOpenInNew, MdOutlineImage } from 'react-icons/md';
import { useAttachmentMutations } from '../hooks/useAttachments';
import { useUpdateCard } from '../hooks/useCards';
import { formatDistanceToNow } from 'date-fns';
import { API_BASE_URL } from '../utils/constants';

const AttachmentSection = ({ card, boardId }) => {
  const fileInputRef = useRef(null);
  const { uploadAttachment, deleteAttachment } = useAttachmentMutations(card.id);
  const updateCard = useUpdateCard(boardId);

  const attachments = card.attachments || [];

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadAttachment.mutate({ cardId: card.id, file });
    }
    // reset input
    e.target.value = null;
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    return '📎';
  };

  // Build full URL for attachment (handles both relative and absolute URLs)
  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url}`;
  };

  const handleMakeCover = (attachment) => {
    updateCard.mutate({
      id: card.id,
      data: { coverImage: getFullUrl(attachment.url) },
    });
  };

  const handleRemoveCover = () => {
    updateCard.mutate({
      id: card.id,
      data: { coverImage: null },
    });
  };

  if (attachments.length === 0 && !uploadAttachment.isPending) {
    return null;
  }

  return (
    <div className="relative mb-8">
      <div className="absolute -left-8 top-1 text-trello-text-light">
        <MdAttachFile className="text-xl" />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <h3 className="text-base font-semibold text-text-heading">Attachments</h3>
      </div>

      <div className="space-y-3">
        {attachments.map((att) => {
          const fullUrl = getFullUrl(att.url);
          const isImage = att.mimeType?.startsWith('image/');
          const isCover = card.coverImage && (card.coverImage === fullUrl || card.coverImage === att.url);

          return (
            <div key={att.id} className="flex gap-4 group">
              <div className="w-28 h-20 bg-surface rounded flex items-center justify-center shrink-0 overflow-hidden relative">
                {isImage ? (
                  <img src={fullUrl} alt={att.filename} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{getFileIcon(att.mimeType)}</span>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold text-text-heading text-sm break-all">{att.filename}</span>
                <div className="flex items-center gap-2 text-xs text-trello-text-light mt-1 flex-wrap">
                  <span>{formatDistanceToNow(new Date(att.createdAt), { addSuffix: true })}</span>
                  <span>•</span>
                  <a href={fullUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline hover:text-trello-text">
                    <MdOpenInNew /> Open
                  </a>
                  <span>•</span>
                  <button 
                    onClick={() => deleteAttachment.mutate(att.id)}
                    disabled={deleteAttachment.isPending}
                    className="flex items-center gap-1 hover:underline hover:text-red-400 transition-colors"
                  >
                    <MdDeleteOutline /> {deleteAttachment.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
                {isImage && (
                  <div className="mt-2 text-xs text-trello-text-light flex items-center gap-2">
                    {isCover ? (
                      <button
                        onClick={handleRemoveCover}
                        className="cursor-pointer hover:underline hover:text-trello-text flex items-center gap-1"
                      >
                        <MdOutlineImage className="text-sm" /> Remove cover
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMakeCover(att)}
                        className="cursor-pointer hover:underline hover:text-trello-text flex items-center gap-1"
                      >
                        <MdOutlineImage className="text-sm" /> Make cover
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {uploadAttachment.isPending && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-28 h-20 bg-surface-raised rounded"></div>
            <div className="flex flex-col justify-center space-y-2">
              <div className="h-4 bg-surface-raised rounded w-32"></div>
              <div className="h-3 bg-surface-raised rounded w-48"></div>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={() => fileInputRef.current?.click()}
        className="mt-4 bg-hover-bg hover:bg-white/10 px-3 py-1.5 rounded text-sm font-medium transition-colors text-trello-text"
      >
        Add an attachment
      </button>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="image/*,application/pdf,text/plain,.doc,.docx"
      />
    </div>
  );
};

export default AttachmentSection;
