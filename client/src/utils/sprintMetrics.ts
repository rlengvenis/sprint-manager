import type { Team, Sprint, MemberAvailability } from '../types';

interface MemberAvailabilityInput {
  memberId: string;
  daysOff: number;
}

interface SprintData {
  actualVelocity: number | null;
  totalDaysAvailable: number;
}

/**
 * Calculate total days available for a sprint
 * Formula: Sum(sprintSize - memberDaysOff)
 * Note: velocityWeight is NOT applied here - it only affects forecast velocity
 */
export function calculateTotalDaysAvailable(
  team: Team,
  memberAvailability: MemberAvailabilityInput[]
): number {
  if (!team || !team.members || team.members.length === 0) {
    return 0;
  }
  
  const sprintSize = team.sprintSizeInDays;
  
  return team.members.reduce((total, member) => {
    const availability = memberAvailability.find(a => a.memberId === member.id);
    const daysOff = availability?.daysOff || 0;
    
    const availableDays = sprintSize - daysOff;
    
    return total + availableDays;
  }, 0);
}

/**
 * Calculate median velocity from past sprints
 * Returns 0 if no completed sprints exist
 */
export function calculateMedianVelocity(sprints: SprintData[]): number {
  const completedSprints = sprints.filter(s => s.actualVelocity !== null && s.actualVelocity > 0);
  
  if (completedSprints.length === 0) {
    return 0;
  }

  const velocities = completedSprints
    .map(s => s.actualVelocity as number)
    .sort((a, b) => a - b);

  const mid = Math.floor(velocities.length / 2);

  if (velocities.length % 2 === 0) {
    return (velocities[mid - 1] + velocities[mid]) / 2;
  } else {
    return velocities[mid];
  }
}

/**
 * Calculate forecast velocity for a sprint
 * Formula: totalDaysAvailable × medianVelocityPerDay
 * If no history exists, returns totalDaysAvailable (assumes 1 point/day)
 */
export function calculateForecastVelocity(
  totalDaysAvailable: number,
  historicalSprints: SprintData[]
): number {
  const medianVelocity = calculateMedianVelocity(historicalSprints);
  
  if (medianVelocity === 0) {
    // No historical data, use 1 point per day as default
    return totalDaysAvailable;
  }

  // Calculate median points per day from historical sprints
  const completedSprints = historicalSprints.filter(
    s => s.actualVelocity !== null && s.totalDaysAvailable > 0
  );
  
  if (completedSprints.length === 0) {
    return totalDaysAvailable;
  }

  const velocitiesPerDay = completedSprints.map(
    s => (s.actualVelocity as number) / s.totalDaysAvailable
  );

  const medianVelocityPerDay = calculateMedianFromArray(velocitiesPerDay);
  
  return totalDaysAvailable * medianVelocityPerDay;
}

/**
 * Calculate delta (difference) between actual and forecast
 * Returns actual - forecast
 * Example: forecast=100, actual=105 returns +5
 * Example: forecast=100, actual=95 returns -5
 */
export function calculateDelta(forecast: number, actual: number | null): number {
  if (actual === null) {
    return 0;
  }

  return actual - forecast;
}

/**
 * Helper function to calculate median from array of numbers
 */
function calculateMedianFromArray(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

/**
 * Calculate historical median velocity per day at the time a sprint was created
 * Returns null if no historical data exists (e.g., first sprint)
 */
export function calculateHistoricalMedianVelocity(
  currentSprint: Sprint,
  allSprints: Sprint[]
): number | null {
  // Get all sprints completed before this sprint was created
  const priorSprints = allSprints.filter(s => {
    const completedDate = s.completedAt ? new Date(s.completedAt) : null;
    const currentCreatedDate = new Date(currentSprint.createdAt);
    return completedDate && completedDate < currentCreatedDate && s.actualVelocity !== null;
  });

  if (priorSprints.length === 0) return null;

  // Calculate median velocity per day from prior sprints
  const velocitiesPerDay = priorSprints.map(s => s.actualVelocity! / s.totalDaysAvailable);
  const sortedVelocities = [...velocitiesPerDay].sort((a, b) => a - b);
  const medianVelocityPerDay = sortedVelocities[Math.floor(sortedVelocities.length / 2)];
  
  return medianVelocityPerDay;
}

/**
 * Calculate member days available based on availability and sprint length
 * Formula: (sprintLength - daysOff) × velocityWeight
 */
export function calculateMemberDaysAvailable(
  availability: MemberAvailability,
  sprintLength: number
): number {
  if (!availability.velocityWeight) return 0;
  
  const workDays = sprintLength - availability.daysOff;
  return workDays * availability.velocityWeight;
}

/**
 * Calculate summary statistics from completed sprints
 */
export function calculateSummaryStats(sprints: Sprint[]): {
  averageDelta: number;
  medianVelocity: number;
  totalSprints: number;
} {
  if (sprints.length === 0) {
    return {
      averageDelta: 0,
      medianVelocity: 0,
      totalSprints: 0,
    };
  }

  const deltas = sprints.map(s => calculateDelta(s.forecastVelocity, s.actualVelocity!));
  const averageDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;

  const velocitiesPerDay = sprints.map(s => s.actualVelocity! / s.totalDaysAvailable);
  const sortedVelocities = [...velocitiesPerDay].sort((a, b) => a - b);
  const medianVelocity = sortedVelocities[Math.floor(sortedVelocities.length / 2)];

  return {
    averageDelta,
    medianVelocity,
    totalSprints: sprints.length,
  };
}

