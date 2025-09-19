export interface DashboardOverview {
  totalUsers: number;
  totalContent: number;
  activeSessions: number;
  totalWatchTime: number;
  topUsers: TopUser[];
  topContent: TopContent[];
}

export interface TopUser {
  id: string;
  name: string;
  playCount: number;
  totalRuntime: number;
}

export interface TopContent {
  id: string;
  name: string;
  type: string;
  playCount: number;
}

export interface UserStats {
  mostActiveUsers: ActiveUser[];
}

export interface ActiveUser {
  id: string;
  name: string;
  playCount: number;
  totalRuntime: number;
  lastActivity: string | null;
}

export interface ContentStats {
  mostWatchedContent: WatchedContent[];
}

export interface WatchedContent {
  id: string;
  name: string;
  type: string;
  playCount: number;
  totalRuntime: number;
  uniqueUsers: number;
}

export interface ActivityTimelinePoint {
  date: string;
  count: number;
  totalRuntime: number;
}

export interface JellyfinSession {
  Id: string;
  UserId: string;
  UserName: string;
  DeviceName: string;
  Client: string;
  PlayState?: {
    PositionTicks?: number;
    CanSeek: boolean;
    IsPaused: boolean;
  };
  NowPlayingItem?: {
    Id: string;
    Name: string;
    Type: string;
    RunTimeTicks?: number;
  };
}

export interface ApiError {
  error: string;
  message?: string;
}

// Chart data interfaces
export interface ChartDataPoint {
  name: string;
  value: number;
  label?: string;
}

export interface TimelineChartData {
  date: string;
  activities: number;
  watchTime: number;
}
