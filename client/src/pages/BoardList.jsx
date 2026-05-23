import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBoards, useDeleteBoard } from '../hooks/useBoards';
import { FaTrello, FaRegClock, FaUserFriends, FaCog } from 'react-icons/fa';
import { MdMenu, MdClose, MdDelete } from 'react-icons/md';
import CreateBoardModal from '../components/CreateBoardModal';

const SidebarContent = () => (
  <>
    <nav className="space-y-1">
      <a href="#" className="flex items-center gap-3 px-3 py-2 bg-trello-blue/20 text-trello-blue font-semibold rounded text-sm transition-colors">
        <FaTrello className="text-lg" />
        Boards
      </a>
      <a href="#" className="flex items-center gap-3 px-3 py-2 text-trello-text hover:bg-hover-bg rounded text-sm font-semibold transition-colors">
        <FaTrello className="text-lg" />
        Templates
      </a>
      <a href="#" className="flex items-center gap-3 px-3 py-2 text-trello-text hover:bg-hover-bg rounded text-sm font-semibold transition-colors">
        <FaRegClock className="text-lg" />
        Home
      </a>
    </nav>

    <div className="mt-8">
      <div className="flex items-center justify-between px-3 mb-2">
        <span className="text-xs font-bold text-trello-text-light uppercase tracking-wider">Workspaces</span>
        <button className="text-trello-text-light hover:text-trello-text transition-colors">+</button>
      </div>
      
      <div className="space-y-1">
        <div className="px-3 py-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            T
          </div>
          <span className="font-semibold text-sm text-trello-text">Trello Workspace</span>
        </div>
        <div className="pl-11 space-y-1">
          <a href="#" className="flex items-center gap-2 px-3 py-1.5 text-trello-text hover:bg-hover-bg rounded text-sm transition-colors">
            <FaTrello /> Boards
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-1.5 text-trello-text hover:bg-hover-bg rounded text-sm transition-colors">
            <FaUserFriends /> Members (5)
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-1.5 text-trello-text hover:bg-hover-bg rounded text-sm transition-colors">
            <FaCog /> Settings
          </a>
        </div>
      </div>
    </div>
  </>
);

const BoardList = () => {
  const { data: boardsData, isLoading, isError, error } = useBoards();
  const deleteBoardMutation = useDeleteBoard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const boards = Array.isArray(boardsData) 
    ? boardsData 
    : (boardsData?.data || []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-trello-bg h-full w-full">
        <div className="w-10 h-10 border-4 border-trello-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Error loading boards: {error.message}</div>;
  }

  return (
    <div className="flex-1 bg-trello-bg overflow-y-auto">
      <div className="w-full max-w-7xl px-4 md:px-12 py-4 md:py-10 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar (Desktop only) */}
        <div className="hidden md:block w-64 shrink-0">
          <SidebarContent />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-[70] flex md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <div 
              className="w-64 h-full bg-trello-bg p-4 shadow-xl overflow-y-auto border-r border-border"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => setIsMobileSidebarOpen(false)} 
                  className="p-1 hover:bg-hover-bg rounded text-trello-text-light hover:text-trello-text transition-colors"
                >
                  <MdClose className="text-2xl" />
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6 text-trello-text">
            <button 
              className="md:hidden p-1.5 hover:bg-hover-bg rounded text-xl transition-colors"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <MdMenu />
            </button>
            <FaUserFriends className="text-2xl hidden md:block" />
            <h2 className="text-xl font-bold">Your workspaces</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Board Cards */}
            {boards.map(board => (
              <Link 
                key={board.id} 
                to={`/b/${board.id}`}
                className="group relative h-28 rounded shadow-sm overflow-hidden flex flex-col justify-between p-3 hover:shadow-md transition-shadow"
                style={{ 
                  backgroundColor: board.backgroundColor,
                  backgroundImage: board.backgroundImage ? `url(${board.backgroundImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Dark overlay on hover for better readability */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                
                <h3 className="relative z-10 text-white font-bold text-base line-clamp-2 drop-shadow-sm">
                  {board.title}
                </h3>
                
                {/* Delete icon (appears on hover) */}
                <div className="relative z-10 self-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
                        deleteBoardMutation.mutate(board.id);
                      }
                    }}
                    className="text-white hover:text-red-400 hover:scale-110 transition-all p-1 cursor-pointer"
                  >
                    <MdDelete className="text-xl" />
                  </button>
                </div>
              </Link>
            ))}

            {/* Create new board button */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="h-28 bg-surface hover:bg-surface-raised rounded flex items-center justify-center text-trello-text font-medium transition-colors border border-border shadow-sm cursor-pointer"
            >
              Create new board
            </button>
            
          </div>
        </div>
      </div>

      <CreateBoardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default BoardList;
