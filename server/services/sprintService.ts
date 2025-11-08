import Sprint from '../models/Sprint.js';
import Team from '../models/Team.js';
import type { Sprint as SprintType, CreateSprintData } from '../types/index.js';

/**
 * Get current active sprint
 */
export async function getCurrentSprint(): Promise<SprintType> {
  const sprint = await Sprint.findOne({
    actualVelocity: null
  });

  if (!sprint) {
    throw new Error('No current sprint found');
  }

  return sprint;
}

/**
 * Get completed sprints with member details enriched
 */
export async function getSprintHistory(): Promise<any[]> {
  const sprints = await Sprint.find({
    actualVelocity: { $ne: null }
  }).sort({ completedAt: -1 });

  const team = await Team.findOne();
  
  if (!team) {
    throw new Error('Team not found');
  }

  // Enrich sprints with member details and sprint size
  const enrichedSprints = sprints.map((sprint) => {
    const sprintObj: any = sprint.toObject();
    
    sprintObj.memberAvailability = sprintObj.memberAvailability.map((avail: any) => {
      const member = team.members.find((m) => 
        m._id?.toString() === avail.memberId.toString()
      );
      
      return {
        memberId: avail.memberId,
        daysOff: avail.daysOff,
        firstName: member?.firstName || 'Unknown',
        velocityWeight: member?.velocityWeight || 1.0
      };
    });
    
    sprintObj.sprintSizeInDays = team.sprintSizeInDays;
    sprintObj.teamName = team.name;
    
    return sprintObj;
  });

  return enrichedSprints;
}

/**
 * Get all sprints
 */
export async function getAllSprints(): Promise<SprintType[]> {
  const sprints = await Sprint.find().sort({ createdAt: -1 });
  return sprints;
}

/**
 * Get sprint by ID
 */
export async function getSprintById(id: string): Promise<SprintType> {
  const sprint = await Sprint.findById(id);
  
  if (!sprint) {
    throw new Error('Sprint not found');
  }
  
  return sprint;
}

/**
 * Create a new sprint
 */
export async function createSprint(sprintData: CreateSprintData): Promise<SprintType> {
  // Check if there's already an active sprint
  const activeSprint = await Sprint.findOne({ actualVelocity: null });
  
  if (activeSprint) {
    throw new Error('Cannot create sprint. Please complete the current sprint first.');
  }

  const sprint = new Sprint(sprintData);
  await sprint.save();
  
  return sprint;
}

/**
 * Complete a sprint with actual velocity
 */
export async function completeSprint(id: string, actualVelocity: number | undefined): Promise<SprintType> {
  if (actualVelocity === undefined) {
    throw new Error('actualVelocity is required');
  }

  const sprint = await Sprint.findById(id);
  
  if (!sprint) {
    throw new Error('Sprint not found');
  }

  sprint.actualVelocity = actualVelocity;
  sprint.completedAt = new Date();
  await sprint.save();

  return sprint;
}

