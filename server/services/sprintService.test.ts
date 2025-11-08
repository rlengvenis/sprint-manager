import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { connectDB, closeDB, clearDB } from './testHelpers.js';
import * as sprintService from './sprintService.js';
import * as teamService from './teamService.js';
import type { CreateSprintData } from '../types/index.js';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await closeDB();
});

beforeEach(async () => {
  await clearDB();
});

describe('SprintService', () => {
  // Helper to create a test team
  const createTestTeam = async () => {
    const team = await teamService.createTeam({
      name: 'Test Team',
      sprintSizeInDays: 10,
      members: [
        {
          id: 'member-1',
          firstName: 'John',
          lastName: 'Doe',
          velocityWeight: 1.0,
          teamId: 'team-1'
        },
        {
          id: 'member-2',
          firstName: 'Jane',
          lastName: 'Smith',
          velocityWeight: 0.8,
          teamId: 'team-1'
        }
      ]
    });
    return team;
  };

  // Helper to create a test sprint
  const createTestSprint = async (team: any, overrides: Partial<CreateSprintData> = {}): Promise<CreateSprintData> => {
    // Use actual member IDs from the team
    const memberIds = team.members.map((m: any) => m._id.toString());
    
    return {
      name: 'Sprint 1',
      teamId: team._id.toString(),
      memberAvailability: [
        { memberId: memberIds[0], daysOff: 0 },
        { memberId: memberIds[1], daysOff: 2 }
      ],
      comment: 'Test sprint',
      totalDaysAvailable: 18,
      forecastVelocity: 20,
      ...overrides
    };
  };

  describe('createSprint', () => {
    it('should create a new sprint successfully', async () => {
      const team = await createTestTeam();
      const sprintData = await createTestSprint(team);

      const sprint = await sprintService.createSprint(sprintData);

      expect(sprint).toBeDefined();
      expect(sprint.name).toBe('Sprint 1');
      expect(sprint.teamId.toString()).toBe(team._id.toString());
      expect(sprint.memberAvailability).toHaveLength(2);
      expect(sprint.actualVelocity).toBeNull();
    });

    it('should throw error when creating sprint with active sprint exists', async () => {
      const team = await createTestTeam();
      const sprintData = await createTestSprint(team);

      await sprintService.createSprint(sprintData);

      await expect(sprintService.createSprint(sprintData))
        .rejects.toThrow('Cannot create sprint. Please complete the current sprint first.');
    });

    it('should create sprint with correct member availability', async () => {
      const team = await createTestTeam();
      const sprintData = await createTestSprint(team);

      const sprint = await sprintService.createSprint(sprintData);

      expect(sprint.memberAvailability[0].memberId).toBe(team.members[0]._id?.toString());
      expect(sprint.memberAvailability[0].daysOff).toBe(0);
      expect(sprint.memberAvailability[1].memberId).toBe(team.members[1]._id?.toString());
      expect(sprint.memberAvailability[1].daysOff).toBe(2);
    });
  });

  describe('getCurrentSprint', () => {
    it('should return the current active sprint', async () => {
      const team = await createTestTeam();
      const sprintData = await createTestSprint(team);
      const createdSprint = await sprintService.createSprint(sprintData);

      const currentSprint = await sprintService.getCurrentSprint();

      expect(currentSprint).toBeDefined();
      expect(currentSprint._id.toString()).toBe(createdSprint._id.toString());
      expect(currentSprint.actualVelocity).toBeNull();
    });

    it('should throw error when no current sprint exists', async () => {
      await expect(sprintService.getCurrentSprint())
        .rejects.toThrow('No current sprint found');
    });

    it('should not return completed sprints', async () => {
      const team = await createTestTeam();
      const sprintData = await createTestSprint(team);
      const sprint = await sprintService.createSprint(sprintData);
      
      await sprintService.completeSprint(sprint._id.toString(), 25);

      await expect(sprintService.getCurrentSprint())
        .rejects.toThrow('No current sprint found');
    });
  });

  describe('completeSprint', () => {
    it('should complete a sprint with actual velocity', async () => {
      const team = await createTestTeam();
      const sprintData = await createTestSprint(team);
      const sprint = await sprintService.createSprint(sprintData);

      const completedSprint = await sprintService.completeSprint(sprint._id.toString(), 25);

      expect(completedSprint.actualVelocity).toBe(25);
      expect(completedSprint.completedAt).toBeDefined();
      expect(completedSprint.completedAt).toBeInstanceOf(Date);
    });

    it('should throw error when sprint not found', async () => {
      await expect(sprintService.completeSprint('507f1f77bcf86cd799439011', 25))
        .rejects.toThrow('Sprint not found');
    });

    it('should throw error when actualVelocity is undefined', async () => {
      const team = await createTestTeam();
      const sprintData = await createTestSprint(team);
      const sprint = await sprintService.createSprint(sprintData);

      await expect(sprintService.completeSprint(sprint._id.toString(), undefined as any))
        .rejects.toThrow('actualVelocity is required');
    });

    it('should allow creating new sprint after completion', async () => {
      const team = await createTestTeam();
      const sprintData1 = await createTestSprint(team, { name: 'Sprint 1' });
      const sprint1 = await sprintService.createSprint(sprintData1);
      
      await sprintService.completeSprint(sprint1._id.toString(), 25);

      const sprintData2 = await createTestSprint(team, { name: 'Sprint 2' });
      const sprint2 = await sprintService.createSprint(sprintData2);

      expect(sprint2).toBeDefined();
      expect(sprint2.name).toBe('Sprint 2');
    });
  });

  describe('getSprintHistory', () => {
    it('should return empty array when no completed sprints exist', async () => {
      await createTestTeam();

      const history = await sprintService.getSprintHistory();

      expect(history).toEqual([]);
    });

    it('should return completed sprints sorted by completion date', async () => {
      const team = await createTestTeam();
      
      const sprint1Data = await createTestSprint(team, { name: 'Sprint 1' });
      const sprint1 = await sprintService.createSprint(sprint1Data);
      await sprintService.completeSprint(sprint1._id.toString(), 20);

      const sprint2Data = await createTestSprint(team, { name: 'Sprint 2' });
      const sprint2 = await sprintService.createSprint(sprint2Data);
      await sprintService.completeSprint(sprint2._id.toString(), 25);

      const history = await sprintService.getSprintHistory();

      expect(history).toHaveLength(2);
      expect(history[0].name).toBe('Sprint 2'); // Most recent first
      expect(history[1].name).toBe('Sprint 1');
    });

    it('should enrich sprints with member details', async () => {
      const team = await createTestTeam();
      const sprintData = await createTestSprint(team);
      const sprint = await sprintService.createSprint(sprintData);
      await sprintService.completeSprint(sprint._id.toString(), 22);

      const history = await sprintService.getSprintHistory();

      expect(history[0].memberAvailability[0].firstName).toBe('John');
      expect(history[0].memberAvailability[0].lastName).toBe('Doe');
      expect(history[0].memberAvailability[0].velocityWeight).toBe(1.0);
      expect(history[0].memberAvailability[1].firstName).toBe('Jane');
      expect(history[0].memberAvailability[1].lastName).toBe('Smith');
      expect(history[0].memberAvailability[1].velocityWeight).toBe(0.8);
    });

    it('should include team name and sprint size', async () => {
      const team = await createTestTeam();
      const sprintData = await createTestSprint(team);
      const sprint = await sprintService.createSprint(sprintData);
      await sprintService.completeSprint(sprint._id.toString(), 18);

      const history = await sprintService.getSprintHistory();

      expect(history[0].teamName).toBe('Test Team');
      expect(history[0].sprintSizeInDays).toBe(10);
    });

    it('should not include active sprints', async () => {
      const team = await createTestTeam();
      
      const sprint1Data = await createTestSprint(team, { name: 'Sprint 1' });
      const sprint1 = await sprintService.createSprint(sprint1Data);
      await sprintService.completeSprint(sprint1._id.toString(), 20);

      const sprint2Data = await createTestSprint(team, { name: 'Sprint 2 - Active' });
      await sprintService.createSprint(sprint2Data);

      const history = await sprintService.getSprintHistory();

      expect(history).toHaveLength(1);
      expect(history[0].name).toBe('Sprint 1');
    });

    it('should throw error when team not found', async () => {
      // Don't create a team
      await expect(sprintService.getSprintHistory())
        .rejects.toThrow('Team not found');
    });
  });

  describe('getAllSprints', () => {
    it('should return empty array when no sprints exist', async () => {
      const sprints = await sprintService.getAllSprints();

      expect(sprints).toEqual([]);
    });

    it('should return all sprints (active and completed)', async () => {
      const team = await createTestTeam();
      
      const sprint1Data = await createTestSprint(team, { name: 'Sprint 1' });
      const sprint1 = await sprintService.createSprint(sprint1Data);
      await sprintService.completeSprint(sprint1._id.toString(), 20);

      const sprint2Data = await createTestSprint(team, { name: 'Sprint 2 - Active' });
      await sprintService.createSprint(sprint2Data);

      const sprints = await sprintService.getAllSprints();

      expect(sprints).toHaveLength(2);
    });

    it('should sort sprints by creation date (newest first)', async () => {
      const team = await createTestTeam();
      
      const sprint1Data = await createTestSprint(team, { name: 'Sprint 1' });
      const sprint1 = await sprintService.createSprint(sprint1Data);
      await sprintService.completeSprint(sprint1._id.toString(), 22);
      
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const sprint2Data = await createTestSprint(team, { name: 'Sprint 2' });
      const sprint2 = await sprintService.createSprint(sprint2Data);
      await sprintService.completeSprint(sprint2._id.toString(), 20);

      const sprint3Data = await createTestSprint(team, { name: 'Sprint 3' });
      await sprintService.createSprint(sprint3Data);

      const sprints = await sprintService.getAllSprints();

      expect(sprints[0].name).toBe('Sprint 3'); // Newest
      expect(sprints[2].name).toBe('Sprint 1'); // Oldest
    });
  });

  describe('getSprintById', () => {
    it('should return sprint by ID', async () => {
      const team = await createTestTeam();
      const sprintData = await createTestSprint(team);
      const createdSprint = await sprintService.createSprint(sprintData);

      const sprint = await sprintService.getSprintById(createdSprint._id.toString());

      expect(sprint).toBeDefined();
      expect(sprint._id.toString()).toBe(createdSprint._id.toString());
      expect(sprint.name).toBe('Sprint 1');
    });

    it('should throw error when sprint not found', async () => {
      await expect(sprintService.getSprintById('507f1f77bcf86cd799439011'))
        .rejects.toThrow('Sprint not found');
    });
  });
});

