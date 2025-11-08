import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SprintPlanningPage from './pages/SprintPlanningPage';
import TeamSetupPage from './pages/TeamSetupPage';
import ForecastPage from './pages/ForecastPage';
import HistoryPage from './pages/HistoryPage';

function App() {
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
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 hover:text-blue-600 transition"
                >
                  🏠 Home
                </Link>
                <Link 
                  to="/team-setup" 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  👥 Team Setup
                </Link>
                <Link 
                  to="/planning" 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  📋 Sprint Planning
                </Link>
                <Link 
                  to="/forecast" 
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  🎯 Forecast
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
          <Route path="/" element={<ForecastPage />} />
          <Route path="/team-setup" element={<TeamSetupPage />} />
          <Route path="/planning" element={<SprintPlanningPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
