import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Team from './models/Team.js';
import Sprint from './models/Sprint.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sprint-manager';

// ============================================================================
// SEED DATA - Directly matching MongoDB structure
// ============================================================================

/**
 * Team Data - matches Team collection schema
 */
const teamData = {
  name: 'Engineering Team',
  sprintSizeInDays: 10,
  members: [
    {
      name: 'Andrew',
      velocityWeight: 1.0,
    },
    {
      name: 'Maarten',
      velocityWeight: 1.0,
    },
    {
      name: 'Pawel',
      velocityWeight: 1.0,
    },
  ],
};

/**
 * Sprints Data - matches Sprint collection schema
 * memberAvailability uses member names as keys for readability
 * These will be mapped to actual member IDs during seeding
 */
const sprintsData = [
  {
    name: '15-Oct',
    memberAvailability: { Andrew: 0.5, Maarten: 1, Pawel: 0 },
    totalDaysAvailable: 28.5,
    forecastVelocity: 44.59,
    actualVelocity: 41,
    comment: '',
  },
  {
    name: '29-Oct',
    memberAvailability: { Andrew: 1, Maarten: 0, Pawel: 0 },
    totalDaysAvailable: 29,
    forecastVelocity: 51.26,
    actualVelocity: 37,
    comment: '',
  },
  {
    name: '12-Nov',
    memberAvailability: { Andrew: 0, Maarten: 0, Pawel: 0 },
    totalDaysAvailable: 30,
    forecastVelocity: 55.92,
    actualVelocity: 48,
    comment: '',
  },
  {
    name: '26-Nov',
    memberAvailability: { Andrew: 0, Maarten: 0, Pawel: 0 },
    totalDaysAvailable: 30,
    forecastVelocity: 53.12,
    actualVelocity: 65,
    comment: '',
  },
  {
    name: '10-Dec',
    memberAvailability: { Andrew: 0, Maarten: 0, Pawel: 0 },
    totalDaysAvailable: 30,
    forecastVelocity: 54.99,
    actualVelocity: 54,
    comment: '',
  },
  {
    name: '21-Dec',
    memberAvailability: { Andrew: 7, Maarten: 6, Pawel: 9 },
    totalDaysAvailable: 8,
    forecastVelocity: 21.44,
    actualVelocity: 13,
    comment: 'Holiday period - includes 3 bank holidays per person',
  },
  {
    name: '7-Jan',
    memberAvailability: { Andrew: 1.5, Maarten: 0, Pawel: 0 },
    totalDaysAvailable: 28.5,
    forecastVelocity: 49.86,
    actualVelocity: 65,
    comment: '',
  },
  {
    name: '21-Jan',
    memberAvailability: { Andrew: 0.5, Maarten: 0.5, Pawel: 0.5 },
    totalDaysAvailable: 28.5,
    forecastVelocity: 44.74,
    actualVelocity: 86,
    comment: 'Includes 0.5 bank holiday per person',
  },
  {
    name: '4-Feb',
    memberAvailability: { Andrew: 1, Maarten: 1, Pawel: 1 },
    totalDaysAvailable: 27,
    forecastVelocity: 50.33,
    actualVelocity: 49,
    comment: 'Includes 1 bank holiday per person',
  },
  {
    name: '18-Feb',
    memberAvailability: { Andrew: 1, Maarten: 4, Pawel: 1 },
    totalDaysAvailable: 24,
    forecastVelocity: 34.48,
    actualVelocity: 43,
    comment: '',
  },
  {
    name: '4-Mar',
    memberAvailability: { Andrew: 0, Maarten: 0, Pawel: 0 },
    totalDaysAvailable: 30,
    forecastVelocity: 38.21,
    actualVelocity: 44,
    comment: '',
  },
  {
    name: 'Mar 18',
    memberAvailability: { Andrew: 0, Maarten: 1, Pawel: 0 },
    totalDaysAvailable: 29,
    forecastVelocity: 46.60,
    actualVelocity: 35,
    comment: '',
  },
  {
    name: 'Apr 2',
    memberAvailability: { Andrew: 0, Maarten: 0, Pawel: 0 },
    totalDaysAvailable: 30,
    forecastVelocity: 45.57,
    actualVelocity: 69,
    comment: '',
  },
  {
    name: 'April 15',
    memberAvailability: { Andrew: 6, Maarten: 2, Pawel: 7 },
    totalDaysAvailable: 15,
    forecastVelocity: 25.41,
    actualVelocity: 15,
    comment: 'Includes 2 bank holidays per person',
  },
  {
    name: 'Apr 29',
    memberAvailability: { Andrew: 3, Maarten: 1, Pawel: 1 },
    totalDaysAvailable: 25,
    forecastVelocity: 39.14,
    actualVelocity: 49,
    comment: 'Includes 1 bank holiday per person',
  },
  {
    name: 'May 13',
    memberAvailability: { Andrew: 3, Maarten: 0, Pawel: 1 },
    totalDaysAvailable: 26,
    forecastVelocity: 41.94,
    actualVelocity: 41,
    comment: '',
  },
  {
    name: 'May 27',
    memberAvailability: { Andrew: 2, Maarten: 4, Pawel: 3 },
    totalDaysAvailable: 21,
    forecastVelocity: 30.76,
    actualVelocity: 38,
    comment: 'Includes 2 bank holidays per person',
  },
  {
    name: 'Jun 10',
    memberAvailability: { Andrew: 0, Maarten: 0, Pawel: 9 },
    totalDaysAvailable: 21,
    forecastVelocity: 36.35,
    actualVelocity: 37,
    comment: '',
  },
  {
    name: 'Jun 24',
    memberAvailability: { Andrew: 0, Maarten: 0, Pawel: 0 },
    totalDaysAvailable: 30,
    forecastVelocity: 44.74,
    actualVelocity: 33,
    comment: '',
  },
  {
    name: 'Jul 8',
    memberAvailability: { Andrew: 1, Maarten: 0, Pawel: 0 },
    totalDaysAvailable: 29,
    forecastVelocity: 45.67,
    actualVelocity: 30,
    comment: '',
  },
  {
    name: 'Jul 22',
    memberAvailability: { Andrew: 0, Maarten: 7, Pawel: 0 },
    totalDaysAvailable: 23,
    forecastVelocity: 30.76,
    actualVelocity: 38,
    comment: '',
  },
  {
    name: 'Aug 5',
    memberAvailability: { Andrew: 0, Maarten: 4, Pawel: 0 },
    totalDaysAvailable: 26,
    forecastVelocity: 32.62,
    actualVelocity: 48,
    comment: '',
  },
  {
    name: 'Aug 19',
    memberAvailability: { Andrew: 6, Maarten: 1, Pawel: 1 },
    totalDaysAvailable: 22,
    forecastVelocity: 25.62,
    actualVelocity: 26,
    comment: 'Includes 1 bank holiday per person',
  },
  {
    name: 'Sep 2',
    memberAvailability: { Andrew: 1, Maarten: 2, Pawel: 0 },
    totalDaysAvailable: 27,
    forecastVelocity: 25.16,
    actualVelocity: 34,
    comment: '',
  },
  {
    name: 'Sep 16',
    memberAvailability: { Andrew: 0, Maarten: 2, Pawel: 0 },
    totalDaysAvailable: 28,
    forecastVelocity: 26.10,
    actualVelocity: 24,
    comment: '',
  },
  {
    name: 'Sep 30',
    memberAvailability: { Andrew: 0, Maarten: 2.5, Pawel: 0 },
    totalDaysAvailable: 27.5,
    forecastVelocity: 25.63,
    actualVelocity: 38,
    comment: '',
  },
];

// ============================================================================
// HELPER FUNCTION - Parse sprint name to date
// ============================================================================

/**
 * Parse sprint name to get start date
 * Handles formats: "15-Oct", "Oct 14", "April 15", "Apr 2", etc.
 */
function parseSprintNameToDate(sprintName: string): Date {
  const monthMap: Record<string, number> = {
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
  };

  // Try format: "15-Oct" or "Oct 14" or "Apr 2"
  const match1 = sprintName.match(/(\d+)-(\w+)/); // "15-Oct"
  const match2 = sprintName.match(/(\w+)\s+(\d+)/); // "Oct 14" or "April 15"
  
  let day: number;
  let month: number;
  let year: number;

  if (match1) {
    // Format: "15-Oct"
    day = parseInt(match1[1]);
    const monthStr = match1[2].toLowerCase().substring(0, 3);
    month = monthMap[monthStr];
  } else if (match2) {
    // Format: "Oct 14" or "April 15"
    const monthStr = match2[1].toLowerCase().substring(0, 3);
    month = monthMap[monthStr];
    day = parseInt(match2[2]);
  } else {
    throw new Error(`Cannot parse sprint name: ${sprintName}`);
  }

  // Determine year: Oct-Dec = 2024, Jan-Sep = 2025
  year = month >= 9 ? 2024 : 2025;

  return new Date(year, month, day);
}

// ============================================================================
// SEED FUNCTION
// ============================================================================

async function seed() {
  try {
    console.log('🌱 Starting database seed...');
    console.log(`📡 Connecting to MongoDB: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Team.deleteMany({});
    await Sprint.deleteMany({});
    console.log('✅ Existing data cleared');

    // ========================================================================
    // Create Team
    // ========================================================================
    console.log('👥 Creating team...');
    const team = await Team.create(teamData);
    console.log(`✅ Team created: ${team.name} (${team.members.length} members)`);

    // Build member name -> ID mapping for sprint creation
    const memberIdMap: Record<string, any> = {};
    team.members.forEach((member) => {
      memberIdMap[member.name] = member._id;
    });

    // ========================================================================
    // Create Sprints
    // ========================================================================
    console.log('📊 Creating historical sprints...');
    let sprintCount = 0;

    for (const sprintData of sprintsData) {
      // Transform memberAvailability from name-based to ID-based format
      const memberAvailability = Object.entries(sprintData.memberAvailability).map(
        ([memberName, daysOff]) => ({
          memberId: memberIdMap[memberName],
          daysOff,
        })
      );

      // Parse sprint start date from name
      const startDate = parseSprintNameToDate(sprintData.name);
      const completedDate = new Date(startDate);
      completedDate.setDate(completedDate.getDate() + 14); // Sprint completes 2 weeks after start

      await Sprint.create({
        name: sprintData.name,
        teamId: team._id,
        memberAvailability,
        comment: sprintData.comment,
        totalDaysAvailable: sprintData.totalDaysAvailable,
        forecastVelocity: sprintData.forecastVelocity,
        actualVelocity: sprintData.actualVelocity,
        createdAt: startDate, // Sprint created on date from name
        completedAt: completedDate, // Sprint completed 2 weeks later
      });
      
      sprintCount++;
      process.stdout.write(`\r   Created ${sprintCount}/${sprintsData.length} sprints...`);
    }
    
    console.log('\n✅ All sprints created');
    console.log(`\n🎉 Seed completed successfully!`);
    console.log(`   - Team: ${team.name}`);
    console.log(`   - Members: ${team.members.length}`);
    console.log(`   - Historical sprints: ${sprintCount}`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the seed function
seed();

