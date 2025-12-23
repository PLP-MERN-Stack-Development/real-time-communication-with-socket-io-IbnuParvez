import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import ChatRoom from './components/ChatRoom';
import { authService } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData.user);
    localStorage.setItem('user', JSON.stringify(userData.user));
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (user) {
    return <ChatRoom user={user} onLogout={handleLogout} />;
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gray-100 flex items-center justify-center">
        <Routes>
          <Route path="/" element={<Login onLogin={handleLogin} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;