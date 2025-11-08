import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Sprint } from '../types';
import { 
  calculateDelta, 
  calculateHistoricalMedianVelocity, 
  calculateMemberDaysAvailable,
  calculateSummaryStats 
} from '../utils/sprintMetrics';
import { formatDate, getDeltaColor, formatDelta } from '../utils/formatting';
import { MetricCard } from '../components/MetricCard';
import { LoadingScreen } from '../components/LoadingScreen';
import { Alert } from '../components/Alert';

export default function StatisticsPage() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [expandedSprintId, setExpandedSprintId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveSprint, setHasActiveSprint] = useState(false);

  useEffect(() => {
    loadHistory();
    checkActiveSprint();
  }, []);

  const checkActiveSprint = async () => {
    try {
      await api.sprints.getCurrent();
      setHasActiveSprint(true);
    } catch {
      setHasActiveSprint(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get completed sprints with enriched member data
      const completedSprints = await api.sprints.getHistory();
      setSprints(completedSprints);
    } catch {
      setError('Failed to load sprint statistics. Please make sure you have a team set up.');
      setSprints([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (sprintId: string) => {
    setExpandedSprintId(expandedSprintId === sprintId ? null : sprintId);
  };

  if (loading) {
    return <LoadingScreen maxWidth="7xl" />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Sprint Statistics</h1>
          <Alert type="error" message={error} className="mb-6" />
        </div>
      </div>
    );
  }

  if (sprints.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Sprint Statistics</h1>
          
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Sprint Statistics Yet</h2>
            <p className="text-gray-600 mb-6">Complete your first sprint to see statistics.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create New Sprint
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateSummaryStats(sprints);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Sprint Statistics</h1>

        {/* Team Header */}
        {sprints.length > 0 && sprints[0].teamName && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Team: {sprints[0].teamName}</h2>
                <p className="text-gray-600">Completed Sprints: {sprints.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Summary Statistics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Average Delta - custom styling for dynamic color */}
            <div className="bg-blue-50 rounded-lg p-6 text-center border border-blue-100">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Average Delta</div>
              <div className={`text-3xl font-bold ${getDeltaColor(stats.averageDelta)}`}>
                {formatDelta(stats.averageDelta)}
              </div>
              <div className="text-sm text-gray-500 mt-1">points</div>
            </div>
            <MetricCard
              icon="🎯"
              label="Median Velocity"
              value={stats.medianVelocity.toFixed(2)}
              unit="points/day"
              colorClass="green"
            />
            <MetricCard
              icon="📈"
              label="Total Sprints"
              value={stats.totalSprints.toString()}
              unit=""
              colorClass="purple"
            />
          </div>
        </div>

        {/* Sprint History Table */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-800">Sprint History</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sprint Name</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Days Avail.</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Median V/D</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Forecast</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actual</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Delta</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sprints.map((sprint) => {
                  const delta = calculateDelta(sprint.forecastVelocity, sprint.actualVelocity!);
                  const historicalMedian = calculateHistoricalMedianVelocity(sprint, sprints);
                  const isExpanded = expandedSprintId === sprint.id;

                  return (
                    <>
                      <tr 
                        key={sprint.id}
                        className="hover:bg-gray-50 cursor-pointer transition"
                        onClick={() => toggleExpanded(sprint.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800">{sprint.name}</div>
                          <div className="text-sm text-gray-500">{formatDate(sprint.completedAt)}</div>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-700">
                          {sprint.totalDaysAvailable.toFixed(1)}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600 text-sm">
                          {historicalMedian ? historicalMedian.toFixed(2) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-700">
                          {sprint.forecastVelocity.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-700 font-medium">
                          {sprint.actualVelocity?.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 text-center font-semibold ${getDeltaColor(delta)}`}>
                          {formatDelta(delta)}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-400">
                          {isExpanded ? '▼' : '▶'}
                        </td>
                      </tr>
                      
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-3">
                              <h4 className="font-semibold text-gray-800 mb-3">Sprint Details</h4>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Team Members:</span>
                                  <span className="ml-2 font-medium text-gray-800">{sprint.memberAvailability.length}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Completed:</span>
                                  <span className="ml-2 font-medium text-gray-800">{formatDate(sprint.completedAt)}</span>
                                </div>
                              </div>

                              <div className="mt-4">
                                <h5 className="font-medium text-gray-700 mb-2">Team Availability:</h5>
                                <div className="space-y-1 text-sm">
                                  {sprint.memberAvailability.map((availability) => {
                                    const sprintLength = sprint.sprintSizeInDays || 10;
                                    const daysAvailable = calculateMemberDaysAvailable(availability, sprintLength);
                                    
                                    return (
                                      <div key={availability.memberId} className="flex justify-between py-1">
                                        <span className="text-gray-700">
                                          • {availability.name} ({availability.velocityWeight}x)
                                        </span>
                                        <span className="text-gray-800">
                                          {daysAvailable.toFixed(1)} days
                                          {availability.daysOff > 0 && (
                                            <span className="text-gray-500 ml-1">({availability.daysOff} days off)</span>
                                          )}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {sprint.comment && (
                                <div className="mt-4">
                                  <h5 className="font-medium text-gray-700 mb-2">Comments:</h5>
                                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{sprint.comment}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {hasActiveSprint ? 'Back to Active Sprint' : 'Add New Sprint'}
          </button>
        </div>
      </div>
    </div>
  );
}

