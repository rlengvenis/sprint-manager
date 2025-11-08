import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AddSprintPage from './pages/AddSprintPage';
import TeamSetupPage from './pages/TeamSetupPage';
import ActiveSprintPage from './pages/ActiveSprintPage';
import HistoryPage from './pages/HistoryPage';
import { api } from './services/api';

function App() {
  const [hasActiveSprint, setHasActiveSprint] = useState<boolean>(false);

  useEffect(() => {
    checkActiveSprint();
  }, []);

  const checkActiveSprint = async () => {
    try {
      const defaultTeam = await api.teams.getDefault();
      await api.sprints.getCurrent(defaultTeam.id);
      setHasActiveSprint(true);
    } catch {
      setHasActiveSprint(false);
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
                {!hasActiveSprint && (
                  <Link 
                    to="/add-sprint" 
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                  >
                    ➕ Add Sprint
                  </Link>
                )}
                <Link 
                  to="/" 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  🎯 Active Sprint
                </Link>
                <Link 
                  to="/team-setup" 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  👥 Team Setup
                </Link>
                <Link 
                  to="/history" 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  📊 History
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<ActiveSprintPage />} />
          <Route path="/add-sprint" element={<AddSprintPage />} />
          <Route path="/team-setup" element={<TeamSetupPage />} />
          <Route path="/forecast" element={<ActiveSprintPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
