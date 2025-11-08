import { Document, Types } from 'mongoose';

export interface TeamMember {
  _id?: Types.ObjectId;
  name: string;
  velocityWeight: number;
}

export interface Team extends Document {
  _id: Types.ObjectId;
  name: string;
  sprintSizeInDays: number;
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberAvailability {
  _id?: Types.ObjectId;
  memberId: string;
  daysOff: number;
  name?: string;
  velocityWeight?: number;
}

export interface Sprint extends Document {
  _id: Types.ObjectId;
  name: string;
  teamId: Types.ObjectId;
  memberAvailability: MemberAvailability[];
  comment: string;
  totalDaysAvailable: number;
  forecastVelocity: number;
  actualVelocity: number | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSprintData {
  name: string;
  teamId: string;
  memberAvailability: {
    memberId: string;
    daysOff: number;
  }[];
  comment?: string;
  totalDaysAvailable: number;
  forecastVelocity: number;
}

