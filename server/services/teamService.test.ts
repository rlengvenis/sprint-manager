import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectDB, closeDB, clearDB } from './testHelpers.js';
import * as teamService from './teamService.js';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDB();
});

beforeEach(async () => {
  await clearDB();
});

describe('TeamService', () => {
  const createTestTeamData = (overrides = {}) => ({
    name: 'Engineering Team',
    sprintSizeInDays: 10,
    members: [
      {
        id: 'member-1',
        firstName: 'Alice',
        velocityWeight: 1.0,
        teamId: 'team-1'
      },
      {
        id: 'member-2',
        firstName: 'Bob',
        velocityWeight: 0.9,
        teamId: 'team-1'
      },
      {
        id: 'member-3',
        firstName: 'Charlie',
        velocityWeight: 1.1,
        teamId: 'team-1'
      }
    ],
    ...overrides
  });

  describe('createTeam', () => {
    it('should create a new team successfully', async () => {
      const teamData = createTestTeamData();

      const team = await teamService.createTeam(teamData);

      expect(team).toBeDefined();
      expect(team.name).toBe('Engineering Team');
      expect(team.sprintSizeInDays).toBe(10);
      expect(team.members).toHaveLength(3);
    });

    it('should create team with correct member details', async () => {
      const teamData = createTestTeamData();

      const team = await teamService.createTeam(teamData);

      expect(team.members[0].firstName).toBe('Alice');
      expect(team.members[0].velocityWeight).toBe(1.0);
      expect(team.members[1].firstName).toBe('Bob');
      expect(team.members[1].velocityWeight).toBe(0.9);
    });

    it('should replace existing team when creating new one', async () => {
      const team1Data = createTestTeamData({ name: 'Team One' });
      await teamService.createTeam(team1Data);

      const team2Data = createTestTeamData({ name: 'Team Two' });
      const team2 = await teamService.createTeam(team2Data);

      const retrievedTeam = await teamService.getTeam();

      expect(retrievedTeam.name).toBe('Team Two');
      expect(retrievedTeam._id.toString()).toBe(team2._id.toString());
    });

    it('should create team with different sprint sizes', async () => {
      const teamData = createTestTeamData({ sprintSizeInDays: 14 });

      const team = await teamService.createTeam(teamData);

      expect(team.sprintSizeInDays).toBe(14);
    });

    it('should create team with single member', async () => {
      const teamData = createTestTeamData({
        members: [
          {
            id: 'solo-member',
            firstName: 'Solo',
            velocityWeight: 1.0,
            teamId: 'team-1'
          }
        ]
      });

      const team = await teamService.createTeam(teamData);

      expect(team.members).toHaveLength(1);
      expect(team.members[0].firstName).toBe('Solo');
    });

    it('should create team with no members', async () => {
      const teamData = createTestTeamData({ members: [] });

      const team = await teamService.createTeam(teamData);

      expect(team.members).toHaveLength(0);
    });
  });

  describe('getTeam', () => {
    it('should return the team', async () => {
      const teamData = createTestTeamData();
      const createdTeam = await teamService.createTeam(teamData);

      const team = await teamService.getTeam();

      expect(team).toBeDefined();
      expect(team._id.toString()).toBe(createdTeam._id.toString());
      expect(team.name).toBe('Engineering Team');
    });

    it('should throw error when no team exists', async () => {
      await expect(teamService.getTeam())
        .rejects.toThrow('No team found. Please create a team first.');
    });

    it('should return team with all members', async () => {
      const teamData = createTestTeamData();
      await teamService.createTeam(teamData);

      const team = await teamService.getTeam();

      expect(team.members).toHaveLength(3);
      expect(team.members[0].firstName).toBe('Alice');
      expect(team.members[1].firstName).toBe('Bob');
      expect(team.members[2].firstName).toBe('Charlie');
    });
  });

  describe('getTeamById', () => {
    it('should return team by ID', async () => {
      const teamData = createTestTeamData();
      const createdTeam = await teamService.createTeam(teamData);

      const team = await teamService.getTeamById(createdTeam._id.toString());

      expect(team).toBeDefined();
      expect(team._id.toString()).toBe(createdTeam._id.toString());
      expect(team.name).toBe('Engineering Team');
    });

    it('should throw error when team not found', async () => {
      await expect(teamService.getTeamById('507f1f77bcf86cd799439011'))
        .rejects.toThrow('Team not found');
    });

    it('should return team with correct sprint size', async () => {
      const teamData = createTestTeamData({ sprintSizeInDays: 12 });
      const createdTeam = await teamService.createTeam(teamData);

      const team = await teamService.getTeamById(createdTeam._id.toString());

      expect(team.sprintSizeInDays).toBe(12);
    });
  });

  describe('updateTeam', () => {
    it('should update team name', async () => {
      const teamData = createTestTeamData();
      await teamService.createTeam(teamData);

      const updatedTeam = await teamService.updateTeam({ name: 'Updated Team Name' });

      expect(updatedTeam.name).toBe('Updated Team Name');
    });

    it('should update sprint size', async () => {
      const teamData = createTestTeamData();
      await teamService.createTeam(teamData);

      const updatedTeam = await teamService.updateTeam({ sprintSizeInDays: 15 });

      expect(updatedTeam.sprintSizeInDays).toBe(15);
    });

    it('should update team members', async () => {
      const teamData = createTestTeamData();
      await teamService.createTeam(teamData);

      const newMembers = [
        {
          id: 'new-member-1',
          firstName: 'David',
          velocityWeight: 1.2,
          teamId: 'team-1'
        }
      ];

      const updatedTeam = await teamService.updateTeam({ members: newMembers });

      expect(updatedTeam.members).toHaveLength(1);
      expect(updatedTeam.members[0].firstName).toBe('David');
      expect(updatedTeam.members[0].velocityWeight).toBe(1.2);
    });

    it('should update multiple fields at once', async () => {
      const teamData = createTestTeamData();
      await teamService.createTeam(teamData);

      const updatedTeam = await teamService.updateTeam({
        name: 'New Team Name',
        sprintSizeInDays: 7,
        members: [
          {
            id: 'updated-member',
            firstName: 'Eve',
            velocityWeight: 0.95,
            teamId: 'team-1'
          }
        ]
      });

      expect(updatedTeam.name).toBe('New Team Name');
      expect(updatedTeam.sprintSizeInDays).toBe(7);
      expect(updatedTeam.members).toHaveLength(1);
      expect(updatedTeam.members[0].firstName).toBe('Eve');
    });

    it('should throw error when team does not exist', async () => {
      await expect(teamService.updateTeam({ name: 'Non-existent Team' }))
        .rejects.toThrow('Team not found');
    });

    it('should preserve existing fields when updating subset', async () => {
      const teamData = createTestTeamData();
      const originalTeam = await teamService.createTeam(teamData);

      const updatedTeam = await teamService.updateTeam({ name: 'Only Name Changed' });

      expect(updatedTeam.name).toBe('Only Name Changed');
      expect(updatedTeam.sprintSizeInDays).toBe(originalTeam.sprintSizeInDays);
      expect(updatedTeam.members).toHaveLength(originalTeam.members.length);
    });

    it('should handle adding members to existing team', async () => {
      const teamData = createTestTeamData({
        members: [
          {
            id: 'initial-member',
            firstName: 'Initial',
            velocityWeight: 1.0,
            teamId: 'team-1'
          }
        ]
      });
      await teamService.createTeam(teamData);

      const newMembers = [
        {
          id: 'initial-member',
          firstName: 'Initial',
          velocityWeight: 1.0,
          teamId: 'team-1'
        },
        {
          id: 'added-member',
          firstName: 'Added',
          velocityWeight: 0.9,
          teamId: 'team-1'
        }
      ];

      const updatedTeam = await teamService.updateTeam({ members: newMembers });

      expect(updatedTeam.members).toHaveLength(2);
      expect(updatedTeam.members[1].firstName).toBe('Added');
    });

    it('should handle updating member velocity weights', async () => {
      const teamData = createTestTeamData();
      await teamService.createTeam(teamData);

      const updatedMembers = [
        {
          id: 'member-1',
          firstName: 'Alice',
          velocityWeight: 1.5, // Changed from 1.0
          teamId: 'team-1'
        },
        {
          id: 'member-2',
          firstName: 'Bob',
          velocityWeight: 0.5, // Changed from 0.9
          teamId: 'team-1'
        }
      ];

      const updatedTeam = await teamService.updateTeam({ members: updatedMembers });

      expect(updatedTeam.members[0].velocityWeight).toBe(1.5);
      expect(updatedTeam.members[1].velocityWeight).toBe(0.5);
    });
  });

  describe('Team data integrity', () => {
    it('should maintain consistent team data across operations', async () => {
      const teamData = createTestTeamData();
      const createdTeam = await teamService.createTeam(teamData);
      const retrievedTeam = await teamService.getTeam();
      const teamById = await teamService.getTeamById(createdTeam._id.toString());

      expect(retrievedTeam._id.toString()).toBe(createdTeam._id.toString());
      expect(teamById._id.toString()).toBe(createdTeam._id.toString());
      expect(retrievedTeam.name).toBe(teamById.name);
    });

    it('should handle team with maximum sprint size', async () => {
      const teamData = createTestTeamData({ sprintSizeInDays: 30 });

      const team = await teamService.createTeam(teamData);

      expect(team.sprintSizeInDays).toBe(30);
    });

    it('should handle team with minimum sprint size', async () => {
      const teamData = createTestTeamData({ sprintSizeInDays: 1 });

      const team = await teamService.createTeam(teamData);

      expect(team.sprintSizeInDays).toBe(1);
    });

    it('should handle members with edge case velocity weights', async () => {
      const teamData = createTestTeamData({
        members: [
          {
            id: 'low-velocity',
            firstName: 'Low',
            velocityWeight: 0.1,
            teamId: 'team-1'
          },
          {
            id: 'high-velocity',
            firstName: 'High',
            velocityWeight: 2.0,
            teamId: 'team-1'
          }
        ]
      });

      const team = await teamService.createTeam(teamData);

      expect(team.members[0].velocityWeight).toBe(0.1);
      expect(team.members[1].velocityWeight).toBe(2.0);
    });
  });
});

