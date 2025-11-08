export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  velocityWeight: number; // Individual velocity multiplier (e.g., 0.8 for 80% capacity)
  teamId: string;
}

export interface Team {
  id: string;
  name: string;
  sprintSizeInDays: number;
  members: TeamMember[];
  createdAt: Date;
}

export interface MemberAvailability {
  memberId: string;
  daysOff: number;
}

export interface Sprint {
  id: string;
  name: string;
  teamId: string;
  memberAvailability: MemberAvailability[];
  comment: string;
  totalDaysAvailable: number;
  forecastVelocity: number;
  actualVelocity: number | null;
  createdAt: Date;
  completedAt: Date | null;
}

