import { PrismaClient } from '@prisma/client';
import {
  JellyfinService,
  type JellyfinActivity,
  type JellyfinSession,
  type JellyfinUser,
} from './jellyfin';

export interface DashboardOverview {
  totalUsers: number;
  totalContent: number;
  activeSessions: number;
  totalWatchTime: number; // in hours
  topUsers: Array<{
    id: string;
    name: string;
    playCount: number;
    totalRuntime: number;
  }>;
  topContent: Array<{
    id: string;
    name: string;
    type: string;
    playCount: number;
  }>;
}

export interface UserStats {
  mostActiveUsers: Array<{
    id: string;
    name: string;
    playCount: number;
    totalRuntime: number; // in seconds
    lastActivity: Date | null;
  }>;
}

export interface ContentStats {
  mostWatchedContent: Array<{
    id: string;
    name: string;
    type: string;
    playCount: number;
    totalRuntime: number;
    uniqueUsers: number;
  }>;
}

export interface ActivityTimelinePoint {
  date: string;
  count: number;
  totalRuntime: number;
}

export class AnalyticsService {
  constructor(
    // eslint-disable-next-line no-unused-vars
    private prisma: PrismaClient,
    // eslint-disable-next-line no-unused-vars
    private jellyfinService: JellyfinService
  ) {}

  async getDashboardOverview(): Promise<DashboardOverview> {
    // Sync recent data
    await this.syncFromJellyfin();

    const [totalUsers, totalContent, activeSessions, userStats, contentStats] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.contentStats.count(),
      this.getActiveSessionsCount(),
      this.getTopUsers(5),
      this.getTopContent(5),
    ]);

    const totalWatchTime = await this.getTotalWatchTime();

    return {
      totalUsers,
      totalContent,
      activeSessions,
      totalWatchTime,
      topUsers: userStats,
      topContent: contentStats,
    };
  }

  async getUserStats(): Promise<UserStats> {
    const users = await this.prisma.user.findMany({
      orderBy: {
        playCount: 'desc',
      },
      take: 20,
    });

    return {
      mostActiveUsers: users.map((user: any) => ({
        id: user.id,
        name: user.name,
        playCount: user.playCount,
        totalRuntime: user.totalRuntime,
        lastActivity: user.lastActivityDate,
      })),
    };
  }

  async getContentStats(): Promise<ContentStats> {
    const content = await this.prisma.contentStats.findMany({
      orderBy: {
        playCount: 'desc',
      },
      take: 20,
    });

    return {
      mostWatchedContent: content.map((item: any) => ({
        id: item.itemId,
        name: item.itemName,
        type: item.itemType,
        playCount: item.playCount,
        totalRuntime: item.totalRuntime,
        uniqueUsers: item.uniqueUsers,
      })),
    };
  }

  async getActivityTimeline(days = 7): Promise<ActivityTimelinePoint[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await this.prisma.activity.findMany({
      where: {
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Group activities by date
    const timelineMap = new Map<string, { count: number; totalRuntime: number }>();

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      timelineMap.set(dateStr, { count: 0, totalRuntime: 0 });
    }

    activities.forEach((activity: any) => {
      const dateStr = activity.timestamp.toISOString().split('T')[0];
      const existing = timelineMap.get(dateStr) || { count: 0, totalRuntime: 0 };
      existing.count++;
      // Parse additional data if available
      try {
        const data = activity.data ? JSON.parse(activity.data) : {};
        existing.totalRuntime += data.runtime || 0;
      } catch (e) {
        // Ignore parsing errors
      }
      timelineMap.set(dateStr, existing);
    });

    return Array.from(timelineMap.entries())
      .map(([date, data]) => ({
        date,
        count: data.count,
        totalRuntime: data.totalRuntime,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getActiveSessions(): Promise<JellyfinSession[]> {
    return await this.jellyfinService.getSessions();
  }

  async syncFromJellyfin(): Promise<void> {
    try {
      // Sync users
      const jellyfinUsers = await this.jellyfinService.getUsers();
      await this.syncUsers(jellyfinUsers);

      // Sync sessions
      const jellyfinSessions = await this.jellyfinService.getSessions();
      await this.syncSessions(jellyfinSessions);

      // Sync activities
      const jellyfinActivities = await this.jellyfinService.getActivities();
      await this.syncActivities(jellyfinActivities);

      // Sync library items
      const libraryItems = await this.jellyfinService.getLibraryItems();
      await this.syncContentStats(libraryItems);

      console.log('✅ Data sync from Jellyfin completed');
    } catch (error) {
      console.error('❌ Error syncing data from Jellyfin:', error);
      throw error;
    }
  }

  private async syncUsers(jellyfinUsers: JellyfinUser[]): Promise<void> {
    for (const jellyfinUser of jellyfinUsers) {
      await this.prisma.user.upsert({
        where: { id: jellyfinUser.Id },
        update: {
          name: jellyfinUser.Name,
          lastActivityDate: jellyfinUser.LastActivityDate
            ? new Date(jellyfinUser.LastActivityDate)
            : null,
          updatedAt: new Date(),
        },
        create: {
          id: jellyfinUser.Id,
          name: jellyfinUser.Name,
          lastActivityDate: jellyfinUser.LastActivityDate
            ? new Date(jellyfinUser.LastActivityDate)
            : null,
        },
      });
    }
  }

  private async syncSessions(jellyfinSessions: JellyfinSession[]): Promise<void> {
    // Mark all existing sessions as inactive
    await this.prisma.session.updateMany({
      where: { isActive: true },
      data: { isActive: false, endTime: new Date() },
    });

    // Create/update current sessions
    for (const session of jellyfinSessions) {
      if (session.NowPlayingItem) {
        await this.prisma.session.upsert({
          where: { id: session.Id },
          update: {
            isActive: true,
            deviceName: session.DeviceName,
            clientName: session.Client,
            playbackPositionTicks: session.PlayState?.PositionTicks || 0,
            updatedAt: new Date(),
          },
          create: {
            id: session.Id,
            userId: session.UserId,
            itemId: session.NowPlayingItem.Id,
            itemName: session.NowPlayingItem.Name,
            itemType: session.NowPlayingItem.Type,
            deviceName: session.DeviceName,
            clientName: session.Client,
            playMethod: 'DirectPlay', // Default value
            startTime: new Date(),
            playbackPositionTicks: session.PlayState?.PositionTicks || 0,
            runtimeTicks: session.NowPlayingItem.RunTimeTicks || 0,
            isActive: true,
          },
        });
      }
    }
  }

  private async syncActivities(jellyfinActivities: JellyfinActivity[]): Promise<void> {
    for (const activity of jellyfinActivities) {
      // Only process video playback activities
      if (activity.Type === 'VideoPlayback' && activity.UserId) {
        const existingActivity = await this.prisma.activity.findFirst({
          where: {
            id: activity.Id,
          },
        });

        if (!existingActivity) {
          await this.prisma.activity.create({
            data: {
              id: activity.Id,
              userId: activity.UserId,
              itemId: activity.ItemId || null,
              itemName: activity.Name,
              itemType: 'Video',
              activityType: 'play',
              timestamp: new Date(activity.Date),
              data: JSON.stringify({
                deviceName: 'Unknown',
                clientName: 'Unknown',
              }),
            },
          });

          // Update user play count
          await this.prisma.user.update({
            where: { id: activity.UserId },
            data: {
              playCount: { increment: 1 },
            },
          });
        }
      }
    }
  }

  private async syncContentStats(libraryItems: any[]): Promise<void> {
    for (const item of libraryItems) {
      if (item.PlayCount && item.PlayCount > 0) {
        await this.prisma.contentStats.upsert({
          where: { itemId: item.Id },
          update: {
            itemName: item.Name,
            itemType: item.Type,
            playCount: item.PlayCount || 0,
            totalRuntime: Math.floor((item.RunTimeTicks || 0) / 10000000), // Convert from ticks to seconds
            lastPlayed: new Date(),
            updatedAt: new Date(),
          },
          create: {
            itemId: item.Id,
            itemName: item.Name,
            itemType: item.Type,
            playCount: item.PlayCount || 0,
            totalRuntime: Math.floor((item.RunTimeTicks || 0) / 10000000),
            uniqueUsers: 1,
            lastPlayed: new Date(),
          },
        });
      }
    }
  }

  private async getActiveSessionsCount(): Promise<number> {
    const sessions = await this.jellyfinService.getSessions();
    return sessions.filter(session => session.NowPlayingItem).length;
  }

  private async getTopUsers(limit = 5): Promise<
    Array<{
      id: string;
      name: string;
      playCount: number;
      totalRuntime: number;
    }>
  > {
    const users = await this.prisma.user.findMany({
      orderBy: { playCount: 'desc' },
      take: limit,
    });

    return users.map((user: any) => ({
      id: user.id,
      name: user.name,
      playCount: user.playCount,
      totalRuntime: user.totalRuntime,
    }));
  }

  private async getTopContent(limit = 5): Promise<
    Array<{
      id: string;
      name: string;
      type: string;
      playCount: number;
    }>
  > {
    const content = await this.prisma.contentStats.findMany({
      orderBy: { playCount: 'desc' },
      take: limit,
    });

    return content.map((item: any) => ({
      id: item.itemId,
      name: item.itemName,
      type: item.itemType,
      playCount: item.playCount,
    }));
  }

  private async getTotalWatchTime(): Promise<number> {
    const result = await this.prisma.user.aggregate({
      _sum: {
        totalRuntime: true,
      },
    });

    // Convert seconds to hours
    return Math.round((result._sum.totalRuntime || 0) / 3600);
  }
}
