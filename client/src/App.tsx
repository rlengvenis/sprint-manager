import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import SettingsPage from './pages/SettingsPage';
import SprintPage from './pages/SprintPage';
import StatisticsPage from './pages/StatisticsPage';
import { api } from './services/api';

function App() {
  const [hasActiveSprint, setHasActiveSprint] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkActiveSprint();
  }, []);

  const checkActiveSprint = async () => {
    try {
      await api.sprints.getCurrent();
      setHasActiveSprint(true);
    } catch {
      setHasActiveSprint(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <Link 
                  to="/" 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  {loading ? '...' : hasActiveSprint ? '🎯 Active Sprint' : '➕ Add Sprint'}
                </Link>
                <Link 
                  to="/statistics" 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  📊 Statistics
                </Link>
                <Link 
                  to="/settings" 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  ⚙️ Settings
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<SprintPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
