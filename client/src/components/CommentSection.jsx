import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { MdOutlineChecklist, MdAttachFile, MdFormatListBulleted } from 'react-icons/md';
import { useComments, useActivities, useCommentMutations } from '../hooks/useComments';
import api from '../services/api';

const CommentSection = ({ cardId }) => {
  const [commentText, setCommentText] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  
  const { data: commentsData, isLoading: isLoadingComments } = useComments(cardId);
  const { data: activitiesData, isLoading: isLoadingActivities } = useActivities(cardId);
  const { addComment, deleteComment } = useCommentMutations(cardId);

  // Fetch members to get the "current user" (first member) since we don't have auth
  const { data: membersData } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await api.get('/members');
      return res.data;
    },
    staleTime: Infinity,
  });
  const currentUser = membersData?.data?.[0];

  // Extract arrays
  const comments = commentsData?.data || [];
  const activities = activitiesData?.data || [];

  // Combine and sort (newest first)
  const combinedLog = showDetails 
    ? [...comments.map(c => ({ ...c, type: 'comment' })), ...activities.map(a => ({ ...a, type: 'activity' }))]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : comments.map(c => ({ ...c, type: 'comment' })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleSave = () => {
    if (!commentText.trim() || !currentUser) return;
    
    addComment.mutate(
      { cardId, text: commentText, memberId: currentUser.id },
      { onSuccess: () => setCommentText('') }
    );
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="relative">
      <div className="absolute -left-8 top-1 text-trello-text-light">
        <MdFormatListBulleted className="text-xl" />
      </div>
      <div className="flex items-center gap-4 mb-3">
        <h3 className="text-base font-semibold text-text-heading">Activity</h3>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="bg-hover-bg hover:bg-white/10 px-3 py-1.5 rounded text-sm font-medium transition-colors ml-auto text-trello-text"
        >
          {showDetails ? 'Hide details' : 'Show details'}
        </button>
      </div>
      
      {/* Add Comment Input */}
      <div className="flex items-start gap-3 mt-4 mb-6">
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
          {currentUser ? getInitials(currentUser.name) : '?'}
        </div>
        <div className="flex-1">
          <div className="bg-surface rounded-lg border border-border overflow-hidden focus-within:ring-1 focus-within:ring-trello-blue focus-within:border-trello-blue transition-all">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full min-h-[40px] p-3 text-sm focus:outline-none resize-y bg-transparent text-trello-text placeholder:text-trello-text-light"
              rows={commentText ? 3 : 1}
            />
            <div className={`px-3 py-2 bg-surface-raised flex items-center justify-between border-t border-border transition-opacity ${commentText ? 'opacity-100' : 'opacity-0 h-0 p-0 border-none overflow-hidden'}`}>
              <div className="flex gap-1 text-trello-text-light">
                <button className="p-1 hover:bg-hover-bg rounded"><MdAttachFile /></button>
                <button className="p-1 hover:bg-hover-bg rounded">@</button>
              </div>
              <button 
                onClick={handleSave}
                disabled={!commentText.trim() || addComment.isPending}
                className="bg-trello-blue hover:bg-trello-blue-dark text-[#1D2125] px-3 py-1 rounded text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {addComment.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity / Comment Feed */}
      <div className="space-y-4">
        {isLoadingComments || isLoadingActivities ? (
          <div className="text-center py-4 text-sm text-trello-text-light">Loading activity...</div>
        ) : combinedLog.length === 0 ? (
          <div className="text-center py-4 text-sm text-trello-text-light">No activity yet.</div>
        ) : (
          combinedLog.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-surface-raised overflow-hidden shrink-0">
                {item.member?.avatarUrl ? (
                  <img src={item.member.avatarUrl} alt={item.member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-trello-text bg-surface">
                    {getInitials(item.member?.name)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-text-heading text-sm">{item.member?.name || 'Unknown User'}</span>
                  {item.type === 'activity' && <span className="text-sm text-trello-text-light">{item.action}</span>}
                  <span className="text-xs text-trello-text-light hover:underline cursor-pointer">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                {item.type === 'comment' && (
                  <div className="mt-1">
                    <div className="bg-surface p-2.5 rounded border border-border text-sm text-trello-text whitespace-pre-wrap">
                      {item.text}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-trello-text-light">
                      <button className="hover:underline hover:text-trello-text">Edit</button>
                      <span>-</span>
                      <button 
                        onClick={() => deleteComment.mutate(item.id)} 
                        className="hover:underline hover:text-trello-text"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
