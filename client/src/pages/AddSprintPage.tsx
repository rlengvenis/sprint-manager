import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Team, Sprint } from '../types';
import { calculateTotalDaysAvailable, calculateForecastVelocity } from '../utils/calculations';

interface MemberAvailabilityInput {
  memberId: string;
  daysOff: number | "";
}

export default function AddSprintPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [historicalSprints, setHistoricalSprints] = useState<Sprint[]>([]);
  const [sprintName, setSprintName] = useState('');
  const [bankHolidays, setBankHolidays] = useState<number | "">(0);
  const [comment, setComment] = useState('');
  const [memberAvailability, setMemberAvailability] = useState<MemberAvailabilityInput[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [checkingActiveSprint, setCheckingActiveSprint] = useState(true);

  // Check for active sprint on mount
  useEffect(() => {
    checkActiveSprint();
  }, []);

  // Load teams on mount
  useEffect(() => {
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkActiveSprint = async () => {
    try {
      const defaultTeam = await api.teams.getDefault();
      await api.sprints.getCurrent(defaultTeam.id);
      // If we get here, there's an active sprint - redirect to active sprint page
      window.location.href = '/';
    } catch {
      // No active sprint, allow access to add sprint page
      setCheckingActiveSprint(false);
    }
  };

  const loadTeams = async () => {
    try {
      const teamsData = await api.teams.getAll();
      setTeams(teamsData);
      
      // Auto-select default team or first team
      const defaultTeam = teamsData.find((t: Team) => t.isDefault) || teamsData[0];
      if (defaultTeam) {
        selectTeam(defaultTeam);
      }
    } catch {
      setError('Failed to load teams');
    }
  };

  const selectTeam = async (team: Team) => {
    setSelectedTeam(team);
    // Initialize member availability with 0 days off for each member
    setMemberAvailability(
      team.members.map(m => ({
        memberId: m.id,
        daysOff: 0,
      }))
    );
    
    // Fetch historical sprints for this team
    try {
      const history = await api.sprints.getHistory(team.id);
      setHistoricalSprints(history);
    } catch {
      setHistoricalSprints([]);
    }
  };

  const updateMemberDaysOff = (memberId: string, daysOff: number | "") => {
    setMemberAvailability(prev =>
      prev.map(ma =>
        ma.memberId === memberId ? { ...ma, daysOff } : ma
      )
    );
  };

  const calculateForecast = () => {
    if (!selectedTeam) return { totalDays: 0, forecastVelocity: 0, hasHistoricalData: false };

    const totalDays = calculateTotalDaysAvailable(
      selectedTeam,
      typeof bankHolidays === "number" ? bankHolidays : Number(bankHolidays) || 0,
      memberAvailability.map(ma => ({
        ...ma,
        daysOff: typeof ma.daysOff === "number" ? ma.daysOff : Number(ma.daysOff) || 0
      }))
    );

    // Use historical sprints if available
    const forecastVelocity = calculateForecastVelocity(totalDays, historicalSprints);
    const completedSprints = historicalSprints.filter(s => s.actualVelocity !== null && s.actualVelocity > 0);
    const hasHistoricalData = completedSprints.length > 0;

    return { totalDays, forecastVelocity, hasHistoricalData };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { totalDays, forecastVelocity } = calculateForecast();

      const sprintData = {
        name: sprintName,
        teamId: selectedTeam.id,
        bankHolidays: typeof bankHolidays === "number" ? bankHolidays : Number(bankHolidays) || 0,
        memberAvailability: memberAvailability.map(ma => ({
          ...ma,
          daysOff: typeof ma.daysOff === "number" ? ma.daysOff : Number(ma.daysOff) || 0
        })),
        comment,
        totalDaysAvailable: totalDays,
        forecastVelocity,
        actualVelocity: null,
        completedAt: null,
      };

      await api.sprints.create(sprintData);
      setSuccess(`Sprint "${sprintName}" created successfully! Redirecting...`);

      // Redirect to active sprint page after brief delay to show success message
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sprint');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSprintName('');
    setBankHolidays(0);
    setComment('');
    if (selectedTeam) {
      setMemberAvailability(
        selectedTeam.members.map(m => ({ memberId: m.id, daysOff: 0 }))
      );
    }
    setError(null);
    setSuccess(null);
  };

  const forecast = calculateForecast();

  // Show loading while checking for active sprint
  if (checkingActiveSprint) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="text-xl text-gray-600">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedTeam) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Sprint</h1>
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
            No teams available. Please create a team first.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add Sprint</h1>

        {/* Team Selection */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-600">Team:</div>
            <div className="text-lg font-semibold text-gray-900">{selectedTeam.name}</div>
            <div className="text-sm text-gray-600">Sprint Size: {selectedTeam.sprintSizeInDays} days</div>
          </div>
          {teams.length > 1 && (
            <select
              value={selectedTeam.id}
              onChange={(e) => {
                const team = teams.find(t => t.id === e.target.value);
                if (team) selectTeam(team);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          )}
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

        <form onSubmit={handleSubmit} className="space-y-6">
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

              <div>
                <label htmlFor="bankHolidays" className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Holidays (days that affect entire team)
                </label>
                <input
                  type="number"
                  id="bankHolidays"
                  value={bankHolidays === "" ? "" : bankHolidays}
                  onChange={(e) => setBankHolidays(e.target.value === "" ? "" : Number(e.target.value))}
                  onBlur={(e) => {
                    if (e.target.value === "" || Number(e.target.value) < 0) {
                      setBankHolidays(0);
                    }
                  }}
                  min="0"
                  max={selectedTeam.sprintSizeInDays}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {selectedTeam.members.map((member) => {
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
                        value={availability?.daysOff === "" ? "" : (availability?.daysOff || 0)}
                        onChange={(e) => updateMemberDaysOff(member.id, e.target.value === "" ? "" : Number(e.target.value))}
                        onBlur={(e) => {
                          if (e.target.value === "" || Number(e.target.value) < 0) {
                            updateMemberDaysOff(member.id, 0);
                          }
                        }}
                        min="0"
                        max={selectedTeam.sprintSizeInDays}
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
              onClick={handleCancel}
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

