import { MdClose, MdCheck } from 'react-icons/md';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { cardKeys } from '../hooks/useCards';
import { boardKeys } from '../hooks/useBoards';

const MemberPopover = ({ card, boardId, onClose }) => {
  const queryClient = useQueryClient();

  const { data: membersData, isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await api.get('/members');
      return res.data;
    },
    staleTime: Infinity,
  });

  const allMembers = membersData?.data || [];
  const assignedMemberIds = card.members ? card.members.map(m => m.memberId) : [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: cardKeys.detail(card.id) });
    queryClient.invalidateQueries({ queryKey: boardKeys.detail(boardId) });
  };

  const addMember = useMutation({
    mutationFn: async ({ cardId, memberId }) => {
      const res = await api.post(`/cards/${cardId}/members`, { memberId });
      return res.data;
    },
    onSuccess: invalidate,
  });

  const removeMember = useMutation({
    mutationFn: async ({ cardId, memberId }) => {
      const res = await api.delete(`/cards/${cardId}/members/${memberId}`);
      return res.data;
    },
    onSuccess: invalidate,
  });

  const handleToggleMember = (memberId) => {
    if (assignedMemberIds.includes(memberId)) {
      removeMember.mutate({ cardId: card.id, memberId });
    } else {
      addMember.mutate({ cardId: card.id, memberId });
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
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
          <h4 className="text-sm font-semibold text-gray-600">Members</h4>
          <button onClick={onClose} className="hover:bg-black/10 p-1 rounded transition-colors">
            <MdClose />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-4 text-sm text-gray-500">Loading members...</div>
        ) : (
          <div className="space-y-1">
            {allMembers.map((member) => {
              const isAssigned = assignedMemberIds.includes(member.id);
              return (
                <div 
                  key={member.id}
                  onClick={() => handleToggleMember(member.id)}
                  className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors hover:bg-black/5 ${isAssigned ? 'bg-blue-50' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                        {getInitials(member.name)}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-[#172b4d] flex-1 truncate">{member.name}</span>
                  {isAssigned && <MdCheck className="text-trello-blue shrink-0" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberPopover;
