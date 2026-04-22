import './App.css';

import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import Configuration from './pages/Configuration';
import Plugins from './pages/Plugins';
import Backup from './pages/Backup';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <div className="App">
              <Sidebar />
              <div className="page-wrapper">
                <Routes>
                  <Route index element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/files" element={<ProtectedRoute><Files /></ProtectedRoute>} />
                  <Route path="/configuration" element={<ProtectedRoute><Configuration /></ProtectedRoute>} />
                  <Route path="/plugins" element={<ProtectedRoute><Plugins /></ProtectedRoute>} />
                  <Route path="/backup" element={<ProtectedRoute><Backup /></ProtectedRoute>} />
                </Routes>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

