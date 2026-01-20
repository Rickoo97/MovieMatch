import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import SessionPage from './pages/SessionPage';
import Login from './components/Login';

function App() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={currentUser ? <Home /> : <Login />}
      />
      <Route
        path="/session/:sessionId"
        element={currentUser ? <SessionPage /> : <Navigate to="/" replace />}
      />
      {/* Fallback route */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;
