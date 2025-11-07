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
  isDefault: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Ensure only one default team exists
teamSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await mongoose.model('Team').updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

const Team = mongoose.model('Team', teamSchema);

export default Team;

