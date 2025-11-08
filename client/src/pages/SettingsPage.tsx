import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Team } from '../types';

interface MemberForm {
  id?: string;
  firstName: string;
  lastName: string;
  velocityWeight: number | "";
}

export default function SettingsPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [sprintSize, setSprintSize] = useState<number | "">(10);
  const [members, setMembers] = useState<MemberForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      setLoadingTeam(true);
      const teamData = await api.teams.get();
      setTeam(teamData);
      setTeamName(teamData.name);
      setSprintSize(teamData.sprintSizeInDays);
      setMembers(teamData.members.map((m: { id: string; firstName: string; lastName: string; velocityWeight: number }) => ({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        velocityWeight: m.velocityWeight
      })));
    } catch (err) {
      console.error('Failed to load team:', err);
      // No team exists yet - start with empty form
      setTeam(null);
    } finally {
      setLoadingTeam(false);
    }
  };

  const addMember = () => {
    setMembers([...members, { firstName: '', lastName: '', velocityWeight: 1.0 }]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof MemberForm, value: string | number | "") => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate and convert form data
      if (typeof sprintSize !== 'number' || sprintSize <= 0) {
        throw new Error('Sprint size must be a valid positive number');
      }

      const teamData = {
        name: teamName,
        sprintSizeInDays: sprintSize,
        members: members.map(m => {
          if (typeof m.velocityWeight !== 'number' || m.velocityWeight <= 0) {
            throw new Error(`Velocity weight for ${m.firstName} ${m.lastName} must be a valid positive number`);
          }
          return {
            id: m.id || crypto.randomUUID(),
            firstName: m.firstName,
            lastName: m.lastName,
            velocityWeight: m.velocityWeight,
            teamId: team?.id || '', // Will be set by backend for new teams
          };
        }),
      };

      if (team) {
        // Update existing team
        const result = await api.teams.update(teamData);
        setSuccess(`Team "${result.name}" updated successfully!`);
        await loadTeam();
      } else {
        // Create new team
        const result = await api.teams.create(teamData);
        setSuccess(`Team "${result.name}" created successfully!`);
        await loadTeam();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save team');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (team) {
      setTeamName(team.name);
      setSprintSize(team.sprintSizeInDays);
      setMembers(team.members.map(m => ({
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        velocityWeight: m.velocityWeight
      })));
    } else {
      setTeamName('');
      setSprintSize(10);
      setMembers([]);
    }
    setError(null);
    setSuccess(null);
  };

  if (loadingTeam) {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Team Settings</h1>

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
          {/* Team Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
              Team Information
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Engineering Team Alpha"
                />
              </div>

              <div>
                <label htmlFor="sprintSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Sprint Size (days)
                </label>
                <input
                  type="number"
                  id="sprintSize"
                  required
                  value={sprintSize}
                  onChange={(e) => setSprintSize(e.target.value === "" ? "" : Number(e.target.value))}
                  min="1"
                  max="30"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
              <button
                type="button"
                onClick={addMember}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                + Add Member
              </button>
            </div>

            <div className="space-y-4">
              {members.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
                  <p className="text-gray-600">
                    No team members yet. Click "+ Add Member" to get started.
                  </p>
                </div>
              ) : (
                members.map((member, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-md p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-sm font-medium text-gray-700">Member {index + 1}:</h3>
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={member.firstName}
                          onChange={(e) => updateMember(index, 'firstName', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          placeholder="John"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={member.lastName}
                          onChange={(e) => updateMember(index, 'lastName', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          placeholder="Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Velocity Weight
                        </label>
                        <input
                          type="number"
                          value={member.velocityWeight}
                          onChange={(e) => updateMember(index, 'velocityWeight', e.target.value === "" ? "" : Number(e.target.value))}
                          min="0"
                          max="2"
                          step="0.1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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
              {loading ? 'Saving...' : team ? 'Update Team' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

