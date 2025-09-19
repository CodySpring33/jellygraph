import { PrismaClient } from '@prisma/client';
import express from 'express';
import { AnalyticsService } from '../services/analytics';
import { JellyfinService } from '../services/jellyfin';
import { SettingsService } from '../services/settings';

const router = express.Router();
const prisma = new PrismaClient();
const settingsService = new SettingsService(prisma);
const jellyfinService = new JellyfinService(settingsService);
const analyticsService = new AnalyticsService(prisma, jellyfinService);

// Initialize settings on startup
settingsService.initializeSettings().catch(console.error);
jellyfinService.loadConfigurationFromSettings().catch(console.error);

// Dashboard overview endpoint
router.get('/dashboard/overview', async (req, res) => {
  try {
    const overview = await analyticsService.getDashboardOverview();
    res.json(overview);
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
});

// User statistics endpoint
router.get('/users/stats', async (req, res) => {
  try {
    const userStats = await analyticsService.getUserStats();
    res.json(userStats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Content statistics endpoint
router.get('/content/stats', async (req, res) => {
  try {
    const contentStats = await analyticsService.getContentStats();
    res.json(contentStats);
  } catch (error) {
    console.error('Error fetching content stats:', error);
    res.status(500).json({ error: 'Failed to fetch content statistics' });
  }
});

// Activity timeline endpoint
router.get('/activities/timeline', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const timeline = await analyticsService.getActivityTimeline(days);
    res.json(timeline);
  } catch (error) {
    console.error('Error fetching activity timeline:', error);
    res.status(500).json({ error: 'Failed to fetch activity timeline' });
  }
});

// Current active sessions endpoint
router.get('/sessions/active', async (req, res) => {
  try {
    const activeSessions = await analyticsService.getActiveSessions();
    res.json(activeSessions);
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
});

// Sync data from Jellyfin endpoint
router.post('/sync', async (req, res) => {
  try {
    await analyticsService.syncFromJellyfin();
    res.json({ message: 'Data sync completed successfully' });
  } catch (error) {
    console.error('Error syncing data:', error);
    res.status(500).json({ error: 'Failed to sync data from Jellyfin' });
  }
});

// Settings endpoints
router.get('/settings', async (req, res) => {
  try {
    const settings = await settingsService.getAllSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.get('/settings/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const settings = await settingsService.getSettingsByCategory(category);
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings by category:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (typeof value !== 'string') {
      return res.status(400).json({ error: 'Setting value must be a string' });
    }

    await settingsService.setSetting(key, value);

    // If it's a Jellyfin setting, update the service configuration
    if (key.startsWith('jellyfin.')) {
      await jellyfinService.loadConfigurationFromSettings();
    }

    res.json({ message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Error updating setting:', error);
    res
      .status(400)
      .json({ error: error instanceof Error ? error.message : 'Failed to update setting' });
  }
});

router.post('/settings/validate', async (req, res) => {
  try {
    const validation = await settingsService.validateSettings();
    res.json(validation);
  } catch (error) {
    console.error('Error validating settings:', error);
    res.status(500).json({ error: 'Failed to validate settings' });
  }
});

router.post('/settings/test-jellyfin', async (req, res) => {
  try {
    const { url, apiKey } = req.body;

    if (!url || !apiKey) {
      return res.status(400).json({ error: 'URL and API key are required' });
    }

    // Create a temporary Jellyfin service to test the connection
    const testService = new JellyfinService();
    await testService.updateConfiguration(url, apiKey);

    // Try to fetch users to test the connection
    const users = await testService.getUsers();
    const isConnected = users.length > 0 && !users[0].Id.startsWith('user'); // Not mock data

    res.json({
      success: true,
      connected: isConnected,
      message: isConnected
        ? 'Successfully connected to Jellyfin'
        : 'Connected, but using mock data (check configuration)',
      userCount: users.length,
    });
  } catch (error) {
    console.error('Error testing Jellyfin connection:', error);
    res.status(400).json({
      success: false,
      connected: false,
      message: error instanceof Error ? error.message : 'Failed to connect to Jellyfin',
    });
  }
});

export default router;
