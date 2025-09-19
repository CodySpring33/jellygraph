import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with sample data...');

  // Clear existing data
  await prisma.activity.deleteMany();
  await prisma.session.deleteMany();
  await prisma.contentStats.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create sample users
  const users = await prisma.user.createMany({
    data: [
      {
        id: 'user-1',
        name: 'Alice Johnson',
        playCount: 45,
        totalRuntime: 162000, // 45 hours
        lastActivityDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: 'user-2',
        name: 'Bob Smith',
        playCount: 32,
        totalRuntime: 115200, // 32 hours
        lastActivityDate: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: 'user-3',
        name: 'Carol Williams',
        playCount: 28,
        totalRuntime: 100800, // 28 hours
        lastActivityDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: 'user-4',
        name: 'David Brown',
        playCount: 21,
        totalRuntime: 75600, // 21 hours
        lastActivityDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        id: 'user-5',
        name: 'Eva Davis',
        playCount: 18,
        totalRuntime: 64800, // 18 hours
        lastActivityDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    ],
  });

  console.log('👥 Created sample users');

  // Create sample content stats
  const contentStats = await prisma.contentStats.createMany({
    data: [
      {
        itemId: 'movie-the-matrix',
        itemName: 'The Matrix',
        itemType: 'Movie',
        playCount: 25,
        totalRuntime: 8184, // 2h 16m 24s
        uniqueUsers: 5,
        lastPlayed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        itemId: 'movie-inception',
        itemName: 'Inception',
        itemType: 'Movie',
        playCount: 22,
        totalRuntime: 8880, // 2h 28m
        uniqueUsers: 4,
        lastPlayed: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        itemId: 'movie-interstellar',
        itemName: 'Interstellar',
        itemType: 'Movie',
        playCount: 19,
        totalRuntime: 10140, // 2h 49m
        uniqueUsers: 4,
        lastPlayed: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        itemId: 'series-breaking-bad-s01e01',
        itemName: 'Breaking Bad - S01E01 - Pilot',
        itemType: 'Episode',
        playCount: 18,
        totalRuntime: 2880, // 48m
        uniqueUsers: 3,
        lastPlayed: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
      {
        itemId: 'series-stranger-things-s01e01',
        itemName: 'Stranger Things - S01E01 - The Vanishing of Will Byers',
        itemType: 'Episode',
        playCount: 16,
        totalRuntime: 2940, // 49m
        uniqueUsers: 3,
        lastPlayed: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        itemId: 'movie-avengers-endgame',
        itemName: 'Avengers: Endgame',
        itemType: 'Movie',
        playCount: 15,
        totalRuntime: 10860, // 3h 1m
        uniqueUsers: 3,
        lastPlayed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        itemId: 'series-the-office-s01e01',
        itemName: 'The Office - S01E01 - Pilot',
        itemType: 'Episode',
        playCount: 14,
        totalRuntime: 1320, // 22m
        uniqueUsers: 4,
        lastPlayed: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
      },
      {
        itemId: 'movie-pulp-fiction',
        itemName: 'Pulp Fiction',
        itemType: 'Movie',
        playCount: 12,
        totalRuntime: 9240, // 2h 34m
        uniqueUsers: 2,
        lastPlayed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('🎬 Created sample content statistics');

  // Create sample activities
  const activities = [];
  const activityTypes = ['play', 'pause', 'stop'];
  const sampleUsers = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];
  const sampleContent = [
    { id: 'movie-the-matrix', name: 'The Matrix', type: 'Movie' },
    { id: 'movie-inception', name: 'Inception', type: 'Movie' },
    { id: 'series-breaking-bad-s01e01', name: 'Breaking Bad - S01E01', type: 'Episode' },
    { id: 'series-stranger-things-s01e01', name: 'Stranger Things - S01E01', type: 'Episode' },
    { id: 'movie-avengers-endgame', name: 'Avengers: Endgame', type: 'Movie' },
  ];

  for (let i = 0; i < 100; i++) {
    const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
    const randomContent = sampleContent[Math.floor(Math.random() * sampleContent.length)];
    const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const randomTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random time in last 7 days

    activities.push({
      userId: randomUser,
      itemId: randomContent.id,
      itemName: randomContent.name,
      itemType: randomContent.type,
      activityType: randomActivity,
      timestamp: randomTime,
      data: JSON.stringify({
        deviceName: ['Chrome Browser', 'Android Phone', 'Roku TV', 'iPad', 'Xbox'][Math.floor(Math.random() * 5)],
        clientName: ['Jellyfin Web', 'Jellyfin Mobile', 'Jellyfin Roku', 'Jellyfin iOS', 'Jellyfin Xbox'][Math.floor(Math.random() * 5)],
        runtime: Math.floor(Math.random() * 7200) + 1800, // 30 minutes to 2 hours
      }),
    });
  }

  await prisma.activity.createMany({
    data: activities,
  });

  console.log('📊 Created sample activities');

  // Create some sample active sessions
  await prisma.session.createMany({
    data: [
      {
        id: 'session-1',
        userId: 'user-1',
        itemId: 'movie-the-matrix',
        itemName: 'The Matrix',
        itemType: 'Movie',
        deviceName: 'Chrome Browser',
        clientName: 'Jellyfin Web',
        playMethod: 'DirectPlay',
        startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 minutes ago
        playbackPositionTicks: 18000000000, // 30 minutes in ticks
        runtimeTicks: 81840000000, // Total runtime in ticks
        isActive: true,
      },
      {
        id: 'session-2',
        userId: 'user-2',
        itemId: 'series-breaking-bad-s01e01',
        itemName: 'Breaking Bad - S01E01 - Pilot',
        itemType: 'Episode',
        deviceName: 'Android Phone',
        clientName: 'Jellyfin Mobile',
        playMethod: 'DirectPlay',
        startTime: new Date(Date.now() - 15 * 60 * 1000), // Started 15 minutes ago
        playbackPositionTicks: 9000000000, // 15 minutes in ticks
        runtimeTicks: 28800000000, // Total runtime in ticks
        isActive: true,
      },
    ],
  });

  console.log('📺 Created sample active sessions');

  console.log('✅ Database seeded successfully!');
  console.log(`
📊 Summary:
- ${users.count} users created
- ${contentStats.count} content items created  
- ${activities.length} activities created
- 2 active sessions created
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
