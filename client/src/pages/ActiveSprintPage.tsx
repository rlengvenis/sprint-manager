import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Sprint, Team } from '../types';

export default function ActiveSprintPage() {
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [historicalSprints, setHistoricalSprints] = useState<Sprint[]>([]);
  const [actualVelocity, setActualVelocity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentSprint();
  }, []);

  const loadCurrentSprint = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First get default team
      const defaultTeam = await api.teams.getDefault();
      setTeam(defaultTeam);
      
      // Then get current sprint for that team
      const currentSprint = await api.sprints.getCurrent(defaultTeam.id);
      setSprint(currentSprint);
      
      // Load historical sprints
      const history = await api.sprints.getHistory(defaultTeam.id);
      setHistoricalSprints(history);
    } catch {
      setError('No active sprint found. Please create a sprint first.');
      setSprint(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sprint || !actualVelocity) {
      setError('Please enter actual velocity');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.sprints.complete(sprint.id, parseFloat(actualVelocity));
      setSuccess('Sprint completed successfully! Reloading...');
      
      // Reload page to update navigation and show empty state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch {
      setError('Failed to complete sprint');
    } finally {
      setLoading(false);
    }
  };

  const calculateMemberDaysAvailable = (memberId: string) => {
    if (!sprint || !team) return 0;
    
    const member = team.members.find(m => m.id === memberId);
    const availability = sprint.memberAvailability.find(a => a.memberId === memberId);
    
    if (!member || !availability) return 0;
    
    const workDays = team.sprintSizeInDays - sprint.bankHolidays - availability.daysOff;
    return workDays * member.velocityWeight;
  };

  const getMedianVelocity = () => {
    const completedSprints = historicalSprints.filter(
      s => s.actualVelocity !== null && s.totalDaysAvailable > 0
    );
    
    if (completedSprints.length === 0) {
      return 'N/A';
    }
    
    const velocitiesPerDay = completedSprints.map(
      s => (s.actualVelocity as number) / s.totalDaysAvailable
    );
    
    const sorted = velocitiesPerDay.sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
    
    return median.toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!sprint || error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Active Sprint</h1>
          
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Active Sprint</h2>
            <p className="text-gray-600 mb-6">There is no active sprint to display.</p>
            <button 
              onClick={() => window.location.href = '/add-sprint'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Create New Sprint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Active Sprint</h1>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Sprint Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-500">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Current Sprint: {sprint.name}</h2>
          <p className="text-gray-600">Team: {team?.name}</p>
        </div>

        {/* Sprint Forecast Metrics */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sprint Forecast</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Days Available */}
            <div className="bg-blue-50 rounded-lg p-6 text-center border border-blue-100">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Total Days Available</div>
              <div className="text-3xl font-bold text-blue-600">
                {sprint.totalDaysAvailable.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 mt-1">days</div>
            </div>

            {/* Forecast Velocity */}
            <div className="bg-green-50 rounded-lg p-6 text-center border border-green-100">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Forecast Velocity</div>
              <div className="text-3xl font-bold text-green-600">
                {sprint.forecastVelocity.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 mt-1">story points</div>
            </div>

            {/* Historical Median Velocity */}
            <div className="bg-purple-50 rounded-lg p-6 text-center border border-purple-100">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-sm font-medium text-gray-600 mb-2">Historical Median</div>
              <div className="text-3xl font-bold text-purple-600">
                {getMedianVelocity()}
              </div>
              <div className="text-sm text-gray-500 mt-1">points/day</div>
            </div>
          </div>
        </div>

        {/* Sprint Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sprint Details</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Bank Holidays:</span>
              <span className="font-medium text-gray-800">{sprint.bankHolidays} days</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Team Members:</span>
              <span className="font-medium text-gray-800">{team?.members.length} members</span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-3">Team Availability:</h4>
            <div className="space-y-2">
              {team?.members.map(member => {
                const availability = sprint.memberAvailability.find(a => a.memberId === member.id);
                const daysAvailable = calculateMemberDaysAvailable(member.id);
                
                return (
                  <div key={member.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                    <span className="text-gray-700">
                      {member.firstName} {member.lastName} <span className="text-gray-500">({member.velocityWeight}x)</span>
                    </span>
                    <span className="text-gray-800 font-medium">
                      {daysAvailable.toFixed(1)} days available
                      {availability && availability.daysOff > 0 && (
                        <span className="text-gray-500 text-sm ml-2">({availability.daysOff} days off)</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Comments */}
        {sprint.comment && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Comments</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{sprint.comment}</p>
          </div>
        )}

        {/* Complete Sprint Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Complete Sprint</h3>
          <p className="text-gray-600 mb-4">When sprint is complete, enter actual velocity:</p>
          
          <form onSubmit={handleCompleteSprint} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Velocity (story points)
              </label>
              <input
                type="number"
                value={actualVelocity}
                onChange={(e) => setActualVelocity(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter actual velocity"
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !actualVelocity}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Completing...' : 'Mark Sprint as Complete'}
            </button>
          </form>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button 
            onClick={() => window.location.href = '/add-sprint'}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Add New Sprint
          </button>
          <button 
            onClick={() => window.location.href = '/history'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            View History
          </button>
        </div>
      </div>
    </div>
  );
}

