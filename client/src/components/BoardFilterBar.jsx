import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { MdFilterList, MdClose } from 'react-icons/md';

const BoardFilterBar = ({ boardId, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    labels: [],
    members: [],
    dueDate: null,
  });

  const { data: labelsData } = useQuery({
    queryKey: ['labels'],
    queryFn: async () => {
      const res = await api.get('/labels');
      return res.data;
    },
    staleTime: Infinity,
  });

  const { data: membersData } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await api.get('/members');
      return res.data;
    },
    staleTime: Infinity,
  });

  const allLabels = labelsData?.data || [];
  const allMembers = membersData?.data || [];

  const hasActiveFilters = filters.labels.length > 0 || filters.members.length > 0 || filters.dueDate;

  const toggleLabel = (labelId) => {
    const next = filters.labels.includes(labelId)
      ? filters.labels.filter(id => id !== labelId)
      : [...filters.labels, labelId];
    const updated = { ...filters, labels: next };
    setFilters(updated);
    onFilterChange(updated);
  };

  const toggleMember = (memberId) => {
    const next = filters.members.includes(memberId)
      ? filters.members.filter(id => id !== memberId)
      : [...filters.members, memberId];
    const updated = { ...filters, members: next };
    setFilters(updated);
    onFilterChange(updated);
  };

  const setDueDateFilter = (value) => {
    const updated = { ...filters, dueDate: filters.dueDate === value ? null : value };
    setFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    const empty = { labels: [], members: [], dueDate: null };
    setFilters(empty);
    onFilterChange(empty);
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          hasActiveFilters 
            ? 'bg-white/40 text-white hover:bg-white/50' 
            : 'bg-white/20 hover:bg-white/30 text-white'
        }`}
      >
        <MdFilterList />
        Filter
        {hasActiveFilters && (
          <span className="bg-white/30 text-white text-xs px-1.5 rounded-full">{filters.labels.length + filters.members.length + (filters.dueDate ? 1 : 0)}</span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Invisible overlay to catch clicks outside */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div 
            className="absolute left-0 top-full mt-2 w-80 z-50 rounded-lg shadow-xl border overflow-hidden animate-in fade-in zoom-in duration-150"
            style={{ backgroundColor: '#282E33', borderColor: '#3D454D' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b" style={{ borderColor: '#3D454D' }}>
              <span className="w-4"></span>
              <h4 className="text-sm font-semibold text-text-heading">Filter</h4>
              <button onClick={() => setIsOpen(false)} className="hover:bg-hover-bg p-1 rounded transition-colors text-trello-text-light hover:text-text-heading">
                <MdClose />
              </button>
            </div>

            <div className="p-3 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Labels Section */}
              <div>
                <h5 className="text-xs font-bold text-trello-text-light uppercase tracking-wider mb-2">Labels</h5>
                <div className="space-y-1">
                  {allLabels.map(label => (
                    <label key={label.id} className="flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-black/5 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={filters.labels.includes(label.id)}
                        onChange={() => toggleLabel(label.id)}
                        className="rounded border-gray-300 text-trello-blue focus:ring-trello-blue accent-trello-blue"
                      />
                      <div 
                        className="h-6 flex-1 rounded px-2 flex items-center text-white text-xs font-medium"
                        style={{ backgroundColor: label.color }}
                      >
                        {label.name || ''}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Members Section */}
              <div>
                <h5 className="text-xs font-bold text-trello-text-light uppercase tracking-wider mb-2">Members</h5>
                <div className="space-y-1">
                  {allMembers.map(member => (
                    <label key={member.id} className="flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-hover-bg transition-colors">
                      <input 
                        type="checkbox" 
                        checked={filters.members.includes(member.id)}
                        onChange={() => toggleMember(member.id)}
                        className="rounded border-gray-300 text-trello-blue focus:ring-trello-blue accent-trello-blue"
                      />
                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                            {getInitials(member.name)}
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-text-heading">{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Due Date Section */}
              <div>
                <h5 className="text-xs font-bold text-trello-text-light uppercase tracking-wider mb-2">Due Date</h5>
                <div className="space-y-1">
                  {[
                    { value: 'overdue', label: '🔴 Overdue' },
                    { value: 'today', label: '🟡 Due today' },
                    { value: 'week', label: '🟢 Due this week' },
                    { value: 'none', label: '⚪ No due date' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-hover-bg transition-colors">
                      <input 
                        type="radio"
                        name="dueDate"
                        checked={filters.dueDate === opt.value}
                        onChange={() => setDueDateFilter(opt.value)}
                        className="border-gray-300 text-trello-blue focus:ring-trello-blue accent-trello-blue"
                      />
                      <span className="text-sm text-text-heading">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            {hasActiveFilters && (
              <div className="p-3 border-t" style={{ borderColor: '#3D454D' }}>
                <button 
                  onClick={clearFilters}
                  className="w-full text-center py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded font-medium transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default BoardFilterBar;
