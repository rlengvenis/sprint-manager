// Local type definitions to avoid import issues
interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  velocityWeight: number;
}

interface Team {
  id: string;
  name: string;
  sprintSizeInDays: number;
  members: TeamMember[];
}

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
 * Formula: Sum((sprintSize - memberDaysOff) × velocityWeight)
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
    const weightedDays = availableDays * member.velocityWeight;
    
    return total + weightedDays;
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
 * Calculate accuracy percentage between forecast and actual
 * Returns the percentage of forecast achieved
 * Example: forecast=100, actual=95 returns 95%
 */
export function calculateAccuracy(forecast: number, actual: number | null): number {
  if (actual === null || forecast === 0) {
    return 0;
  }

  return (actual / forecast) * 100;
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

