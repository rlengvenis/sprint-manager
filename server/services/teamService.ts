import Team from '../models/Team.js';
import type { Team as TeamType } from '../types/index.js';

/**
 * Get the team (there's only one in the system)
 */
export async function getTeam(): Promise<TeamType> {
  const team = await Team.findOne();
  
  if (!team) {
    throw new Error('No team found. Please create a team first.');
  }
  
  return team;
}

/**
 * Get team by ID
 */
export async function getTeamById(id: string): Promise<TeamType> {
  const team = await Team.findById(id);
  
  if (!team) {
    throw new Error('Team not found');
  }
  
  return team;
}

/**
 * Create or replace team (single team system)
 */
export async function createTeam(teamData: any): Promise<TeamType> {
  // Delete existing team if any (single team only)
  await Team.deleteMany({});
  
  const team = new Team(teamData);
  await team.save();
  
  return team;
}

/**
 * Update the team
 */
export async function updateTeam(teamData: any): Promise<TeamType> {
  const team = await Team.findOne();
  
  if (!team) {
    throw new Error('Team not found');
  }
  
  Object.assign(team, teamData);
  await team.save();
  
  return team;
}

