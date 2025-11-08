import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Sprint, Team } from '../types';
import { 
  calculateTotalDaysAvailable, 
  calculateForecastVelocity,
  getMedianVelocityPerDay,
  calculateMemberWeightedDays
} from '../utils/sprintMetrics';
import { MetricCard } from '../components/MetricCard';

interface MemberAvailabilityInput {
  memberId: string;
  daysOff: number;
}

const normalizeMemberAvailability = (availability: MemberAvailabilityInput[]) => 
  availability.map(ma => ({ ...ma, daysOff: ma.daysOff }));

export default function SprintPage() {
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [historicalSprints, setHistoricalSprints] = useState<Sprint[]>([]);
  const [actualVelocity, setActualVelocity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Add Sprint form state
  const [sprintName, setSprintName] = useState('');
  const [comment, setComment] = useState('');
  const [memberAvailability, setMemberAvailability] = useState<MemberAvailabilityInput[]>([]);

  useEffect(() => {
    loadCurrentSprint();
  }, []);

  const loadCurrentSprint = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the team (there's only one)
      const teamData = await api.teams.get();
      setTeam(teamData);
      
      try {
        // Try to get current sprint
        const currentSprint = await api.sprints.getCurrent();
        setSprint(currentSprint);
      } catch {
        // No active sprint - initialize add sprint form
        setSprint(null);
        setMemberAvailability(
          teamData.members.map((m: { id: string }) => ({
            memberId: m.id,
            daysOff: 0,
          }))
        );
      }
      
      // Load historical sprints
      const history = await api.sprints.getHistory();
      setHistoricalSprints(history);
    } catch {
      setError('Failed to load team data.');
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
      setSuccess('Sprint completed successfully! Redirecting to statistics...');
      
      // Redirect to statistics page
      setTimeout(() => {
        window.location.href = '/statistics';
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
    
    return calculateMemberWeightedDays(
      team.sprintSizeInDays,
      availability.daysOff,
      member.velocityWeight
    );
  };

  // Add Sprint functions
  const updateMemberDaysOff = (memberId: string, daysOff: number) => {
    setMemberAvailability(prev =>
      prev.map(ma =>
        ma.memberId === memberId ? { ...ma, daysOff } : ma
      )
    );
  };

  const calculateForecast = () => {
    if (!team) return { totalDays: 0, forecastVelocity: 0, hasHistoricalData: false };

    const totalDays = calculateTotalDaysAvailable(team, normalizeMemberAvailability(memberAvailability));
    const forecastVelocity = calculateForecastVelocity(totalDays, historicalSprints);
    const completedSprints = historicalSprints.filter(s => s.actualVelocity !== null && s.actualVelocity > 0);
    const hasHistoricalData = completedSprints.length > 0;

    return { totalDays, forecastVelocity, hasHistoricalData };
  };

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { totalDays, forecastVelocity } = calculateForecast();

      const sprintData = {
        name: sprintName,
        teamId: team.id,
        memberAvailability: normalizeMemberAvailability(memberAvailability),
        comment,
        totalDaysAvailable: totalDays,
        forecastVelocity,
        actualVelocity: null,
        completedAt: null,
      };

      await api.sprints.create(sprintData);
      setSuccess(`Sprint "${sprintName}" created successfully! Reloading...`);

      // Reload the page to show the new active sprint
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sprint');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCreate = () => {
    setSprintName('');
    setComment('');
    if (team) {
      setMemberAvailability(
        team.members.map(m => ({ memberId: m.id, daysOff: 0 }))
      );
    }
    setError(null);
    setSuccess(null);
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

  // If no active sprint, show add sprint form
  if (!sprint) {
    if (!team) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Active Sprint</h1>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
              No teams available. Please create a team first in Settings.
            </div>
          </div>
        </div>
      );
    }

    const forecast = calculateForecast();

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Sprint</h1>

          {/* Team Info */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="text-sm text-gray-600">Team:</div>
            <div className="text-lg font-semibold text-gray-900">{team.name}</div>
            <div className="text-sm text-gray-600">Sprint Size: {team.sprintSizeInDays} days</div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateSprint} className="space-y-6">
            {/* Sprint Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                Sprint Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="sprintName" className="block text-sm font-medium text-gray-700 mb-1">
                    Sprint Name
                  </label>
                  <input
                    type="text"
                    id="sprintName"
                    value={sprintName}
                    onChange={(e) => setSprintName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Sprint 23 - Q4 2025"
                  />
                </div>
              </div>
            </div>

            {/* Team Member Availability */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                Team Member Availability
              </h2>

              <div className="space-y-3">
                {team.members.map((member) => {
                  const availability = memberAvailability.find(ma => ma.memberId === member.id);
                  return (
                    <div
                      key={member.id}
                      className="bg-gray-50 border border-gray-200 rounded-md p-4 flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          Velocity Weight: {member.velocityWeight}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700">Days Off:</label>
                        <input
                          type="number"
                          value={availability?.daysOff || 0}
                          onChange={(e) => updateMemberDaysOff(member.id, Number(e.target.value) || 0)}
                          required
                          min="0"
                          max={team.sprintSizeInDays}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sprint Forecast */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4 border-b border-blue-300 pb-2">
                Sprint Forecast (Auto-calculated)
              </h2>

              <div className="space-y-2 text-blue-900">
                <div className="flex justify-between">
                  <span className="font-medium">Total Days Available:</span>
                  <span className="text-lg font-bold">{forecast.totalDays.toFixed(1)} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Forecast Velocity:</span>
                  <span className="text-lg font-bold">{forecast.forecastVelocity.toFixed(1)} story points</span>
                </div>
                <div className="text-sm text-blue-700 mt-2">
                  {forecast.hasHistoricalData ? (
                    <>
                      * Forecast based on median velocity from {historicalSprints.filter(s => s.actualVelocity !== null && s.actualVelocity > 0).length} completed sprint(s)
                    </>
                  ) : (
                    <>* Forecast assumes 1 story point per day (no historical data yet)</>
                  )}
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                Comments
              </h2>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any notes or comments about this sprint..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={handleCancelCreate}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Sprint'}
              </button>
            </div>
          </form>
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
            <MetricCard
              icon="📊"
              label="Total Days Available"
              value={sprint.totalDaysAvailable.toFixed(1)}
              unit="days"
              colorClass="blue"
            />
            <MetricCard
              icon="🎯"
              label="Forecast Velocity"
              value={sprint.forecastVelocity.toFixed(2)}
              unit="story points"
              colorClass="green"
            />
            <MetricCard
              icon="📈"
              label="Historical Median"
              value={getMedianVelocityPerDay(historicalSprints)}
              unit="points/day"
              colorClass="purple"
            />
          </div>
        </div>

        {/* Sprint Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sprint Details</h3>
          
          <div className="space-y-3">
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
            onClick={() => window.location.href = '/statistics'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            View Statistics
          </button>
        </div>
      </div>
    </div>
  );
}

