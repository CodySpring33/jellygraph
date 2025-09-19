import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
  }
  prisma = global.__prisma;
}

export { prisma };

// Database initialization and migration functions
export async function initializeDatabase(): Promise<void> {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Run any initialization logic here
    await seedInitialData();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('📦 Database disconnected');
}

// Seed some initial data for development
async function seedInitialData(): Promise<void> {
  try {
    const userCount = await prisma.user.count();

    if (userCount === 0) {
      console.log('🌱 Seeding initial data...');

      // Create sample users
      await prisma.user.createMany({
        data: [
          {
            id: 'sample-user-1',
            name: 'Demo User 1',
            playCount: 25,
            totalRuntime: 86400, // 24 hours in seconds
            lastActivityDate: new Date(Date.now() - 3600000), // 1 hour ago
          },
          {
            id: 'sample-user-2',
            name: 'Demo User 2',
            playCount: 18,
            totalRuntime: 64800, // 18 hours in seconds
            lastActivityDate: new Date(Date.now() - 7200000), // 2 hours ago
          },
          {
            id: 'sample-user-3',
            name: 'Demo User 3',
            playCount: 12,
            totalRuntime: 43200, // 12 hours in seconds
            lastActivityDate: new Date(Date.now() - 86400000), // 1 day ago
          },
        ],
      });

      // Create sample content stats
      await prisma.contentStats.createMany({
        data: [
          {
            itemId: 'movie-1',
            itemName: 'The Matrix',
            itemType: 'Movie',
            playCount: 15,
            totalRuntime: 8184, // 2h 16m 24s
            uniqueUsers: 3,
            lastPlayed: new Date(Date.now() - 3600000),
          },
          {
            itemId: 'movie-2',
            itemName: 'Inception',
            itemType: 'Movie',
            playCount: 12,
            totalRuntime: 8880, // 2h 28m
            uniqueUsers: 2,
            lastPlayed: new Date(Date.now() - 7200000),
          },
          {
            itemId: 'episode-1',
            itemName: 'Breaking Bad S01E01',
            itemType: 'Episode',
            playCount: 8,
            totalRuntime: 2880, // 48m
            uniqueUsers: 2,
            lastPlayed: new Date(Date.now() - 86400000),
          },
          {
            itemId: 'episode-2',
            itemName: 'Game of Thrones S01E01',
            itemType: 'Episode',
            playCount: 10,
            totalRuntime: 3720, // 62m
            uniqueUsers: 3,
            lastPlayed: new Date(Date.now() - 172800000),
          },
        ],
      });

      // Create sample activities
      const activities = [];
      const activityTypes = ['play', 'pause', 'stop'];
      const sampleItems = ['movie-1', 'movie-2', 'episode-1', 'episode-2'];
      const sampleUsers = ['sample-user-1', 'sample-user-2', 'sample-user-3'];

      for (let i = 0; i < 50; i++) {
        const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
        const randomItem = sampleItems[Math.floor(Math.random() * sampleItems.length)];
        const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const randomTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random time in last 7 days

        activities.push({
          userId: randomUser,
          itemId: randomItem,
          itemName: `Sample Item ${randomItem}`,
          itemType: randomItem.startsWith('movie') ? 'Movie' : 'Episode',
          activityType: randomActivity,
          timestamp: randomTime,
          data: JSON.stringify({
            deviceName: 'Sample Device',
            clientName: 'Jellyfin Web',
          }),
        });
      }

      await prisma.activity.createMany({
        data: activities,
      });

      console.log('✅ Initial data seeded successfully');
    }
  } catch (error) {
    console.error('❌ Error seeding initial data:', error);
  }
}

export default prisma;
