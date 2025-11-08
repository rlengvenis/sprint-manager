import mongoose, { Schema, Model } from 'mongoose';
import type { Sprint as SprintType, MemberAvailability } from '../types/index.js';

const memberAvailabilitySchema = new Schema<MemberAvailability>({
  memberId: {
    type: String,
    required: true,
  },
  daysOff: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
});

const sprintSchema = new Schema<SprintType>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  memberAvailability: [memberAvailabilitySchema],
  comment: {
    type: String,
    trim: true,
    default: '',
  },
  totalDaysAvailable: {
    type: Number,
    required: true,
    min: 0,
  },
  forecastVelocity: {
    type: Number,
    required: true,
    min: 0,
  },
  actualVelocity: {
    type: Number,
    default: null,
    min: 0,
  },
  completedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

const Sprint: Model<SprintType> = mongoose.model<SprintType>('Sprint', sprintSchema);

export default Sprint;

