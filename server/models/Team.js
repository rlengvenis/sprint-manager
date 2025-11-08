import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
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

const teamSchema = new mongoose.Schema({
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

const Team = mongoose.model('Team', teamSchema);

export default Team;

