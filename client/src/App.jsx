import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import BoardList from './pages/BoardList';
import Board from './pages/Board';

const NotFound = () => <div className="p-4 text-white">404 - Page Not Found</div>;

const Layout = ({ children }) => {
  return (
    <div className="h-screen flex flex-col font-sans overflow-hidden">
      <Header />
      <main className="flex-1 relative flex overflow-hidden">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/boards" replace />} />
          <Route path="/boards" element={<BoardList />} />
          <Route path="/b/:id" element={<Board />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
