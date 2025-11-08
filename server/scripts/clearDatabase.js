import mongoose from 'mongoose';
import Team from '../models/Team.js';
import Sprint from '../models/Sprint.js';

const clearDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sprint-manager');
    console.log('✓ Connected to MongoDB');

    // Delete all teams
    const teamsDeleted = await Team.deleteMany({});
    console.log(`✓ Deleted ${teamsDeleted.deletedCount} team(s)`);

    // Delete all sprints
    const sprintsDeleted = await Sprint.deleteMany({});
    console.log(`✓ Deleted ${sprintsDeleted.deletedCount} sprint(s)`);

    console.log('✓ Database cleared successfully!');
    
    // Close connection
    await mongoose.connection.close();
    console.log('✓ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error clearing database:', error.message);
    process.exit(1);
  }
};

clearDatabase();

