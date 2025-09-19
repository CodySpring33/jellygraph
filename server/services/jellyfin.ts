import axios, { type AxiosInstance } from 'axios';

export interface JellyfinUser {
  Id: string;
  Name: string;
  LastActivityDate?: string;
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

export interface JellyfinActivity {
  Id: string;
  Name: string;
  Overview?: string;
  ShortOverview?: string;
  Type: string;
  ItemId?: string;
  Date: string;
  UserId: string;
  UserName: string;
  Severity: string;
}

export class JellyfinService {
  private client: AxiosInstance | null = null;
  private baseUrl: string | null = null;
  private apiKey: string | null = null;

  constructor(private settingsService?: any) {
    // Initialize with environment variables as fallback
    this.baseUrl = process.env.JELLYFIN_URL || null;
    this.apiKey = process.env.JELLYFIN_API_KEY || null;
    this.initializeClient();
  }

  async updateConfiguration(url: string, apiKey: string): Promise<void> {
    this.baseUrl = url;
    this.apiKey = apiKey;
    this.initializeClient();
  }

  async loadConfigurationFromSettings(): Promise<void> {
    if (!this.settingsService) return;

    try {
      const config = await this.settingsService.getJellyfinConfig();
      if (config.url && config.apiKey) {
        this.baseUrl = config.url;
        this.apiKey = config.apiKey;
        this.initializeClient();
      }
    } catch (error) {
      console.warn('Failed to load Jellyfin configuration from settings:', error);
    }
  }

  private initializeClient(): void {
    if (!this.baseUrl || !this.apiKey) {
      console.warn('Jellyfin configuration incomplete, using mock data');
      this.client = null;
      return;
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'X-Emby-Token': this.apiKey,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  isConfigured(): boolean {
    return !!(this.baseUrl && this.apiKey && this.client);
  }

  async getUsers(): Promise<JellyfinUser[]> {
    try {
      if (!this.isConfigured()) {
        return this.getMockUsers();
      }

      const response = await this.client!.get('/Users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users from Jellyfin:', error);
      return this.getMockUsers();
    }
  }

  async getSessions(): Promise<JellyfinSession[]> {
    try {
      if (!this.isConfigured()) {
        return this.getMockSessions();
      }

      const response = await this.client!.get('/Sessions');
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions from Jellyfin:', error);
      return this.getMockSessions();
    }
  }

  async getActivities(startIndex = 0, limit = 100): Promise<JellyfinActivity[]> {
    try {
      if (!this.isConfigured()) {
        return this.getMockActivities();
      }

      const response = await this.client!.get('/System/ActivityLog/Entries', {
        params: {
          startIndex,
          limit,
          hasUserId: true,
        },
      });
      return response.data.Items || [];
    } catch (error) {
      console.error('Error fetching activities from Jellyfin:', error);
      return this.getMockActivities();
    }
  }

  async getLibraryItems(userId?: string): Promise<any[]> {
    try {
      if (!this.isConfigured()) {
        return this.getMockLibraryItems();
      }

      const response = await this.client!.get('/Items', {
        params: {
          userId,
          recursive: true,
          includeItemTypes: 'Movie,Episode,Audio',
          fields: 'PlayCount,DateLastContentAdded',
        },
      });
      return response.data.Items || [];
    } catch (error) {
      console.error('Error fetching library items from Jellyfin:', error);
      return this.getMockLibraryItems();
    }
  }

  private getMockUsers(): JellyfinUser[] {
    return [
      {
        Id: 'user1',
        Name: 'John Doe',
        LastActivityDate: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        Id: 'user2',
        Name: 'Jane Smith',
        LastActivityDate: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        Id: 'user3',
        Name: 'Bob Wilson',
        LastActivityDate: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  }

  private getMockSessions(): JellyfinSession[] {
    return [
      {
        Id: 'session1',
        UserId: 'user1',
        UserName: 'John Doe',
        DeviceName: 'Chrome Browser',
        Client: 'Jellyfin Web',
        PlayState: {
          PositionTicks: 18000000000,
          CanSeek: true,
          IsPaused: false,
        },
        NowPlayingItem: {
          Id: 'movie1',
          Name: 'The Matrix',
          Type: 'Movie',
          RunTimeTicks: 81840000000,
        },
      },
      {
        Id: 'session2',
        UserId: 'user2',
        UserName: 'Jane Smith',
        DeviceName: 'Android Phone',
        Client: 'Jellyfin Mobile',
        PlayState: {
          PositionTicks: 12000000000,
          CanSeek: true,
          IsPaused: true,
        },
        NowPlayingItem: {
          Id: 'episode1',
          Name: 'Breaking Bad S01E01',
          Type: 'Episode',
          RunTimeTicks: 28800000000,
        },
      },
    ];
  }

  private getMockActivities(): JellyfinActivity[] {
    const now = new Date();
    return [
      {
        Id: 'activity1',
        Name: 'John Doe played The Matrix',
        Type: 'VideoPlayback',
        ItemId: 'movie1',
        Date: new Date(now.getTime() - 3600000).toISOString(),
        UserId: 'user1',
        UserName: 'John Doe',
        Severity: 'Info',
      },
      {
        Id: 'activity2',
        Name: 'Jane Smith played Breaking Bad S01E01',
        Type: 'VideoPlayback',
        ItemId: 'episode1',
        Date: new Date(now.getTime() - 7200000).toISOString(),
        UserId: 'user2',
        UserName: 'Jane Smith',
        Severity: 'Info',
      },
    ];
  }

  private getMockLibraryItems(): any[] {
    return [
      {
        Id: 'movie1',
        Name: 'The Matrix',
        Type: 'Movie',
        PlayCount: 15,
        RunTimeTicks: 81840000000,
      },
      {
        Id: 'movie2',
        Name: 'Inception',
        Type: 'Movie',
        PlayCount: 12,
        RunTimeTicks: 88800000000,
      },
      {
        Id: 'episode1',
        Name: 'Breaking Bad S01E01',
        Type: 'Episode',
        PlayCount: 8,
        RunTimeTicks: 28800000000,
      },
    ];
  }
}
