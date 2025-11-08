import { describe, it, expect } from 'vitest';
import {
  calculateTotalDaysAvailable,
  calculateMedianVelocity,
  calculateForecastVelocity,
  calculateDelta,
  calculateHistoricalMedianVelocity,
  calculateMemberDaysAvailable,
  calculateSummaryStats,
  getMedianVelocityPerDay,
  calculateMemberWeightedDays,
} from './sprintMetrics';

describe('calculateTotalDaysAvailable', () => {
  it('should calculate total days for a team with multiple members', () => {
    const team = {
      id: '1',
      name: 'Test Team',
      sprintSizeInDays: 10,
      members: [
        { id: '1', name: 'John', velocityWeight: 1.0, teamId: '1' },
        { id: '2', name: 'Jane', velocityWeight: 0.8, teamId: '1' },
      ],
    };

    const availability = [
      { memberId: '1', daysOff: 0 },
      { memberId: '2', daysOff: 2 },
    ];

    const result = calculateTotalDaysAvailable(team, availability);
    expect(result).toBe(18);
  });

  it('should handle members with days off', () => {
    const team = {
      id: '1',
      name: 'Test Team',
      sprintSizeInDays: 10,
      members: [
        { id: '1', name: 'John', velocityWeight: 1.0, teamId: '1' },
      ],
    };

    const availability = [
      { memberId: '1', daysOff: 3 },
    ];

    const result = calculateTotalDaysAvailable(team, availability);
    // 10 - 3 = 7 days (velocity weight not applied to days available)
    expect(result).toBe(7);
  });

  it('should return 0 for empty team', () => {
    const team = {
      id: '1',
      name: 'Test Team',
      sprintSizeInDays: 10,
      members: [],
    };

    const result = calculateTotalDaysAvailable(team, []);
    expect(result).toBe(0);
  });

  it('should handle missing availability (defaults to 0 days off)', () => {
    const team = {
      id: '1',
      name: 'Test Team',
      sprintSizeInDays: 10,
      members: [
        { id: '1', name: 'John', velocityWeight: 1.0, teamId: '1' },
      ],
    };

    const result = calculateTotalDaysAvailable(team, []);
    expect(result).toBe(10);
  });
});

describe('calculateMedianVelocity', () => {
  it('should calculate median for odd number of sprints', () => {
    const sprints = [
      { actualVelocity: 10, totalDaysAvailable: 10 },
      { actualVelocity: 20, totalDaysAvailable: 10 },
      { actualVelocity: 30, totalDaysAvailable: 10 },
    ];

    const result = calculateMedianVelocity(sprints);
    expect(result).toBe(20);
  });

  it('should calculate median for even number of sprints', () => {
    const sprints = [
      { actualVelocity: 10, totalDaysAvailable: 10 },
      { actualVelocity: 20, totalDaysAvailable: 10 },
      { actualVelocity: 30, totalDaysAvailable: 10 },
      { actualVelocity: 40, totalDaysAvailable: 10 },
    ];

    const result = calculateMedianVelocity(sprints);
    expect(result).toBe(25);
  });

  it('should return 0 for empty array', () => {
    const result = calculateMedianVelocity([]);
    expect(result).toBe(0);
  });

  it('should filter out null velocities', () => {
    const sprints = [
      { actualVelocity: 10, totalDaysAvailable: 10 },
      { actualVelocity: null, totalDaysAvailable: 10 },
      { actualVelocity: 20, totalDaysAvailable: 10 },
    ];

    const result = calculateMedianVelocity(sprints);
    expect(result).toBe(15);
  });

  it('should filter out zero velocities', () => {
    const sprints = [
      { actualVelocity: 10, totalDaysAvailable: 10 },
      { actualVelocity: 0, totalDaysAvailable: 10 },
      { actualVelocity: 20, totalDaysAvailable: 10 },
    ];

    const result = calculateMedianVelocity(sprints);
    expect(result).toBe(15);
  });
});

describe('calculateForecastVelocity', () => {
  it('should calculate forecast based on historical median velocity per day', () => {
    const historicalSprints = [
      { actualVelocity: 10, totalDaysAvailable: 10 }, // 1.0 per day
      { actualVelocity: 20, totalDaysAvailable: 10 }, // 2.0 per day
      { actualVelocity: 15, totalDaysAvailable: 10 }, // 1.5 per day
    ];

    const result = calculateForecastVelocity(10, historicalSprints);
    // Median velocity per day is 1.5
    expect(result).toBe(15);
  });

  it('should return totalDaysAvailable when no historical data', () => {
    const result = calculateForecastVelocity(10, []);
    expect(result).toBe(10);
  });

  it('should handle sprints with null velocities', () => {
    const historicalSprints = [
      { actualVelocity: null, totalDaysAvailable: 10 },
      { actualVelocity: null, totalDaysAvailable: 10 },
    ];

    const result = calculateForecastVelocity(10, historicalSprints);
    expect(result).toBe(10);
  });

  it('should calculate correctly with different sprint lengths', () => {
    const historicalSprints = [
      { actualVelocity: 10, totalDaysAvailable: 5 },  // 2.0 per day
      { actualVelocity: 20, totalDaysAvailable: 10 }, // 2.0 per day
    ];

    const result = calculateForecastVelocity(15, historicalSprints);
    // Median velocity per day is 2.0
    expect(result).toBe(30);
  });
});

describe('calculateDelta', () => {
  it('should calculate positive delta when over-delivered', () => {
    const result = calculateDelta(100, 110);
    expect(result).toBe(10);
  });

  it('should calculate negative delta when under-delivered', () => {
    const result = calculateDelta(100, 90);
    expect(result).toBe(-10);
  });

  it('should return 0 when exactly on target', () => {
    const result = calculateDelta(100, 100);
    expect(result).toBe(0);
  });

  it('should return 0 when actual velocity is null', () => {
    const result = calculateDelta(100, null);
    expect(result).toBe(0);
  });

  it('should handle decimal values', () => {
    const result = calculateDelta(100.5, 105.75);
    expect(result).toBeCloseTo(5.25);
  });
});

describe('calculateHistoricalMedianVelocity', () => {
  it('should calculate median from sprints completed before current sprint', () => {
    const sprints = [
      {
        id: '1',
        name: 'Sprint 1',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 10,
        actualVelocity: 10,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-05'),
        completedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        name: 'Sprint 2',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 20,
        actualVelocity: 20,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-15'),
        completedAt: new Date('2024-01-10'),
      },
      {
        id: '3',
        name: 'Sprint 3',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 30,
        actualVelocity: 30,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-25'),
        completedAt: new Date('2024-01-20'),
      },
    ];

    const currentSprint = sprints[2];
    const result = calculateHistoricalMedianVelocity(currentSprint, sprints);
    
    // Should only consider sprints 1 and 2 (completed before sprint 3 was created)
    // Velocities per day: 1.0, 2.0 -> sorted [1.0, 2.0] -> median at index 1 = 2.0
    expect(result).toBe(2.0);
  });

  it('should return null for first sprint (no historical data)', () => {
    const sprints = [
      {
        id: '1',
        name: 'Sprint 1',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 10,
        actualVelocity: 10,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-05'),
        completedAt: new Date('2024-01-10'),
      },
    ];

    const result = calculateHistoricalMedianVelocity(sprints[0], sprints);
    expect(result).toBeNull();
  });

  it('should exclude sprints completed after current sprint was created', () => {
    const sprints = [
      {
        id: '1',
        name: 'Sprint 1',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 10,
        actualVelocity: 10,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-05'),
        completedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        name: 'Sprint 2',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: 100,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-20'),
        completedAt: new Date('2024-01-25'),
      },
    ];

    const currentSprint = {
      id: '3',
      name: 'Sprint 3',
      teamId: 'team1',
      memberAvailability: [],
      comment: '',
      forecastVelocity: 30,
      actualVelocity: 30,
      totalDaysAvailable: 10,
      createdAt: new Date('2024-01-15'),
      completedAt: new Date('2024-01-18'),
    };

    const result = calculateHistoricalMedianVelocity(currentSprint, [...sprints, currentSprint]);
    // Should only consider sprint 1 (completed before current sprint was created)
    expect(result).toBe(1.0);
  });

  it('should handle sprints with null actual velocity', () => {
    const sprints = [
      {
        id: '1',
        name: 'Sprint 1',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 10,
        actualVelocity: 10,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-05'),
        completedAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        name: 'Sprint 2',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 10,
        actualVelocity: null,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-10'),
        completedAt: new Date('2024-01-05'),
      },
    ];

    const currentSprint = {
      id: '3',
      name: 'Sprint 3',
      teamId: 'team1',
      memberAvailability: [],
      comment: '',
      forecastVelocity: 30,
      actualVelocity: 30,
      totalDaysAvailable: 10,
      createdAt: new Date('2024-01-15'),
      completedAt: new Date('2024-01-20'),
    };

    const result = calculateHistoricalMedianVelocity(currentSprint, [...sprints, currentSprint]);
    expect(result).toBe(1.0);
  });
});

describe('calculateMemberDaysAvailable', () => {
  it('should calculate days with velocity weight', () => {
    const availability = {
      memberId: '1',
      daysOff: 2,
      velocityWeight: 1.0,
    };

    const result = calculateMemberDaysAvailable(availability, 10);
    expect(result).toBe(8);
  });

  it('should apply velocity weight correctly', () => {
    const availability = {
      memberId: '1',
      daysOff: 0,
      velocityWeight: 0.8,
    };

    const result = calculateMemberDaysAvailable(availability, 10);
    expect(result).toBe(8);
  });

  it('should handle both days off and velocity weight', () => {
    const availability = {
      memberId: '1',
      daysOff: 2,
      velocityWeight: 0.8,
    };

    const result = calculateMemberDaysAvailable(availability, 10);
    // (10 - 2) * 0.8 = 6.4
    expect(result).toBe(6.4);
  });

  it('should return 0 if velocity weight is missing', () => {
    const availability = {
      memberId: '1',
      daysOff: 2,
    };

    const result = calculateMemberDaysAvailable(availability, 10);
    expect(result).toBe(0);
  });

  it('should handle zero days off', () => {
    const availability = {
      memberId: '1',
      daysOff: 0,
      velocityWeight: 1.0,
    };

    const result = calculateMemberDaysAvailable(availability, 10);
    expect(result).toBe(10);
  });
});

describe('calculateSummaryStats', () => {
  it('should calculate stats from multiple sprints', () => {
    const sprints = [
      {
        id: '1',
        name: 'Sprint 1',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: 110,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-01'),
        completedAt: new Date('2024-01-10'),
      },
      {
        id: '2',
        name: 'Sprint 2',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: 90,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-15'),
        completedAt: new Date('2024-01-25'),
      },
      {
        id: '3',
        name: 'Sprint 3',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: 100,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-02-01'),
        completedAt: new Date('2024-02-10'),
      },
    ];

    const result = calculateSummaryStats(sprints);

    // Average delta: (10 + (-10) + 0) / 3 = 0
    expect(result.averageDelta).toBe(0);
    // Median velocity per day: (11, 9, 10) -> sorted (9, 10, 11) -> 10
    expect(result.medianVelocity).toBe(10);
    expect(result.totalSprints).toBe(3);
  });

  it('should return zeros for empty sprint array', () => {
    const result = calculateSummaryStats([]);

    expect(result.averageDelta).toBe(0);
    expect(result.medianVelocity).toBe(0);
    expect(result.totalSprints).toBe(0);
  });

  it('should calculate median correctly for even number of sprints', () => {
    const sprints = [
      {
        id: '1',
        name: 'Sprint 1',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: 100,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-01'),
        completedAt: new Date('2024-01-10'),
      },
      {
        id: '2',
        name: 'Sprint 2',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: 100,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-15'),
        completedAt: new Date('2024-01-25'),
      },
      {
        id: '3',
        name: 'Sprint 3',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: 200,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-02-01'),
        completedAt: new Date('2024-02-10'),
      },
      {
        id: '4',
        name: 'Sprint 4',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: 300,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-02-15'),
        completedAt: new Date('2024-02-25'),
      },
    ];

    const result = calculateSummaryStats(sprints);

    // Velocities per day: 10, 10, 20, 30 -> sorted -> median = (10 + 20) / 2 = 15
    expect(result.medianVelocity).toBe(15);
  });

  it('should handle single sprint', () => {
    const sprints = [
      {
        id: '1',
        name: 'Sprint 1',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: 105,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-01'),
        completedAt: new Date('2024-01-10'),
      },
    ];

    const result = calculateSummaryStats(sprints);

    expect(result.averageDelta).toBe(5);
    expect(result.medianVelocity).toBe(10.5);
    expect(result.totalSprints).toBe(1);
  });

  it('should handle different sprint lengths', () => {
    const sprints = [
      {
        id: '1',
        name: 'Sprint 1',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: 100,
        totalDaysAvailable: 5,  // 20 per day
        createdAt: new Date('2024-01-01'),
        completedAt: new Date('2024-01-05'),
      },
      {
        id: '2',
        name: 'Sprint 2',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: 100,
        totalDaysAvailable: 10, // 10 per day
        createdAt: new Date('2024-01-10'),
        completedAt: new Date('2024-01-20'),
      },
    ];

    const result = calculateSummaryStats(sprints);

    // Velocities per day: [20, 10] -> sorted [10, 20] -> median = (10 + 20) / 2 = 15
    expect(result.medianVelocity).toBe(15);
  });
});

describe('getMedianVelocityPerDay', () => {
  it('should return formatted median velocity per day', () => {
    const sprints = [
      {
        id: '1',
        name: 'Sprint 1',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: 100,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-01'),
        completedAt: new Date('2024-01-10'),
      },
      {
        id: '2',
        name: 'Sprint 2',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: 200,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-15'),
        completedAt: new Date('2024-01-25'),
      },
    ];

    const result = getMedianVelocityPerDay(sprints);
    // Velocities per day: [10, 20] -> median = 15
    expect(result).toBe('15.00');
  });

  it('should return N/A when no historical data', () => {
    const result = getMedianVelocityPerDay([]);
    expect(result).toBe('N/A');
  });

  it('should filter out null velocities', () => {
    const sprints = [
      {
        id: '1',
        name: 'Sprint 1',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: null,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-01'),
        completedAt: new Date('2024-01-10'),
      },
      {
        id: '2',
        name: 'Sprint 2',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: 150,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-15'),
        completedAt: new Date('2024-01-25'),
      },
    ];

    const result = getMedianVelocityPerDay(sprints);
    expect(result).toBe('15.00');
  });

  it('should handle single sprint', () => {
    const sprints = [
      {
        id: '1',
        name: 'Sprint 1',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: 125,
        totalDaysAvailable: 10,
        createdAt: new Date('2024-01-01'),
        completedAt: new Date('2024-01-10'),
      },
    ];

    const result = getMedianVelocityPerDay(sprints);
    expect(result).toBe('12.50');
  });

  it('should format to 2 decimal places', () => {
    const sprints = [
      {
        id: '1',
        name: 'Sprint 1',
        teamId: 'team1',
        memberAvailability: [],
        comment: '',
        forecastVelocity: 100,
        actualVelocity: 100,
        totalDaysAvailable: 3,
        createdAt: new Date('2024-01-01'),
        completedAt: new Date('2024-01-03'),
      },
    ];

    const result = getMedianVelocityPerDay(sprints);
    // 100 / 3 = 33.333... -> formatted as 33.33
    expect(result).toBe('33.33');
  });
});

describe('calculateMemberWeightedDays', () => {
  it('should calculate weighted days with full availability', () => {
    const result = calculateMemberWeightedDays(10, 0, 1.0);
    expect(result).toBe(10);
  });

  it('should apply velocity weight', () => {
    const result = calculateMemberWeightedDays(10, 0, 0.8);
    expect(result).toBe(8);
  });

  it('should account for days off', () => {
    const result = calculateMemberWeightedDays(10, 3, 1.0);
    expect(result).toBe(7);
  });

  it('should apply both days off and velocity weight', () => {
    const result = calculateMemberWeightedDays(10, 2, 0.8);
    // (10 - 2) * 0.8 = 6.4
    expect(result).toBe(6.4);
  });

  it('should handle zero days off', () => {
    const result = calculateMemberWeightedDays(10, 0, 0.5);
    expect(result).toBe(5);
  });

  it('should handle velocity weight greater than 1', () => {
    const result = calculateMemberWeightedDays(10, 2, 1.2);
    // (10 - 2) * 1.2 = 9.6
    expect(result).toBe(9.6);
  });

  it('should handle all days off', () => {
    const result = calculateMemberWeightedDays(10, 10, 1.0);
    expect(result).toBe(0);
  });
});

