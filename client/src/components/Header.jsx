import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdApps, MdNotificationsNone, MdInfoOutline, MdAccountCircle, MdSearch } from 'react-icons/md';
import { FaTrello } from 'react-icons/fa';
import { useGlobalSearch } from '../hooks/useSearch';
import CreateBoardModal from './CreateBoardModal';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const { data: searchData, isLoading } = useGlobalSearch(searchQuery);
  
  const searchResults = searchData?.data || [];

  return (
    <header className="h-12 flex items-center justify-between px-2 text-trello-text font-semibold shadow-sm sticky top-0 z-50 transition-colors" style={{ backgroundColor: '#1D2125', borderBottom: '1px solid #3D454D' }}>
      
      {/* Left Section */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button className="p-1.5 hover:bg-hover-bg rounded text-xl cursor-pointer transition-colors">
          <MdApps />
        </button>
        
        <Link to="/boards" className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-hover-bg rounded cursor-pointer transition-colors text-lg font-bold">
          <FaTrello className="text-xl" />
          <span className="tracking-tight text-text-heading hidden sm:block">Trello Clone</span>
        </Link>
      </div>

      {/* Middle Section - Search and Create */}
      <div className="flex-1 flex items-center justify-end sm:justify-start lg:justify-center gap-2 px-1 sm:px-4">
        
        {/* Mobile Search Icon */}
        <button className="p-1.5 hover:bg-hover-bg rounded text-xl cursor-pointer transition-colors sm:hidden text-trello-text-light">
          <MdSearch />
        </button>

        {/* Desktop Search Input */}
        <div className="relative hidden sm:block w-full max-w-[600px]">
          <MdSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-trello-text-light text-lg" />
          <input 
            type="text" 
            placeholder="Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="bg-surface hover:bg-surface-raised focus:bg-surface-raised text-trello-text outline-none border border-border focus:border-trello-blue rounded px-8 py-1.5 text-sm w-full transition-all placeholder:text-trello-text-light"
          />
          
          {/* Search Results Dropdown */}
          {isSearchFocused && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 mt-1 w-full rounded-lg shadow-xl border overflow-hidden z-50" style={{ backgroundColor: '#282E33', borderColor: '#3D454D' }}>
              <div className="px-3 py-2 text-xs font-semibold text-trello-text-light uppercase tracking-wider border-b" style={{ borderColor: '#3D454D' }}>
                Cards
              </div>
              <div className="max-h-64 overflow-y-auto">
                {isLoading ? (
                  <div className="p-3 text-sm text-trello-text-light text-center">Searching...</div>
                ) : searchResults?.length > 0 ? (
                  searchResults.map(card => (
                    <Link 
                      key={card.id}
                      to={`/b/${card.list?.boardId}?card=${card.id}`}
                      className="block px-3 py-2 hover:bg-hover-bg transition-colors border-b last:border-0" style={{ borderColor: '#3D454D' }}
                    >
                      <div className="font-semibold text-sm truncate text-text-heading">{card.title}</div>
                      <div className="text-xs text-trello-text-light truncate mt-0.5">
                        {card.list?.board?.title} • {card.list?.title}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-3 text-sm text-trello-text-light text-center">No cards found</div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Create Button (Visible on all screen sizes) */}
        <div className="flex items-center flex-shrink-0">
          <button 
            className="px-3 py-1.5 bg-trello-blue hover:bg-trello-blue-dark text-[#1D2125] rounded text-sm font-semibold transition-colors"
            onClick={() => setIsCreateBoardModalOpen(true)}
          >
            Create
          </button>
        </div>
      </div>
      
      {/* Right Section */}
      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
        <button className="p-1.5 hover:bg-hover-bg rounded text-xl cursor-pointer transition-colors">
          <MdNotificationsNone />
        </button>
        <button className="p-1.5 hover:bg-hover-bg rounded text-xl cursor-pointer transition-colors hidden sm:block">
          <MdInfoOutline />
        </button>
        <button className="p-1 hover:bg-hover-bg rounded-full text-2xl cursor-pointer transition-colors ml-1">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ambuj" 
            alt="Profile" 
            className="w-7 h-7 rounded-full bg-surface"
          />
        </button>
      </div>
      
      <CreateBoardModal 
        isOpen={isCreateBoardModalOpen} 
        onClose={() => setIsCreateBoardModalOpen(false)} 
      />
    </header>
  );
};

export default Header;
