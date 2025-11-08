import mongoose from 'mongoose';

const memberAvailabilitySchema = new mongoose.Schema({
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

const sprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
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

const Sprint = mongoose.model('Sprint', sprintSchema);

export default Sprint;

