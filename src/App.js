import './App.css';

import Sidebar from './components/Sidebar';

import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Files from './pages/Files';
import Configuration from './pages/Configuration';
import Plugins from './pages/Plugins';
import Backup from './pages/Backup';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Sidebar />
        <Routes>
          <Route index element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/files" element={<Files />} />
          <Route path="/configuration" element={<Configuration />} />
          <Route path="/plugins" element={<Plugins />} />
          <Route path="/backup" element={<Backup />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
