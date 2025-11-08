import mongoose, { Schema, Model } from 'mongoose';
import type { Team as TeamType, TeamMember } from '../types/index.js';

const teamMemberSchema = new Schema<TeamMember>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  velocityWeight: {
    type: Number,
    required: true,
    default: 1.0,
    min: 0,
    max: 2,
  },
});

const teamSchema = new Schema<TeamType>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sprintSizeInDays: {
    type: Number,
    required: true,
    min: 1,
    max: 30,
  },
  members: [teamMemberSchema],
}, {
  timestamps: true,
});

const Team: Model<TeamType> = mongoose.model<TeamType>('Team', teamSchema);

export default Team;

