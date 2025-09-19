import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

export interface SettingDefinition {
  key: string;
  defaultValue?: string;
  description: string;
  category: string;
  isEncrypted?: boolean;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'url' | 'password';
  validation?: (value: string) => boolean;
}

export const SETTING_DEFINITIONS: SettingDefinition[] = [
  {
    key: 'jellyfin.url',
    defaultValue: 'http://localhost:8096',
    description: 'Jellyfin server URL (including http:// or https://)',
    category: 'jellyfin',
    required: true,
    type: 'url',
    validation: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
  },
  {
    key: 'jellyfin.apiKey',
    description: 'Jellyfin API key for authentication',
    category: 'jellyfin',
    required: true,
    type: 'password',
    isEncrypted: true,
  },
  {
    key: 'jellyfin.syncInterval',
    defaultValue: '300000',
    description: 'Sync interval in milliseconds (default: 5 minutes)',
    category: 'jellyfin',
    type: 'number',
    validation: (value: string) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && num >= 60000 && num <= 3600000; // 1 minute to 1 hour
    },
  },
  {
    key: 'app.title',
    defaultValue: 'Jellyfin Analytics',
    description: 'Application title displayed in the header',
    category: 'general',
    type: 'string',
  },
  {
    key: 'app.theme',
    defaultValue: 'dark',
    description: 'Application theme (dark or light)',
    category: 'general',
    type: 'string',
    validation: (value: string) => ['dark', 'light'].includes(value),
  },
];

export class SettingsService {
  private encryptionKey: string;

  constructor(private prisma: PrismaClient) {
    // Use environment variable or generate a key for encryption
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
  }

  async initializeSettings(): Promise<void> {
    console.log('🔧 Initializing application settings...');

    for (const definition of SETTING_DEFINITIONS) {
      const existing = await this.prisma.settings.findUnique({
        where: { key: definition.key },
      });

      if (!existing && definition.defaultValue) {
        await this.prisma.settings.create({
          data: {
            key: definition.key,
            value: definition.isEncrypted
              ? this.encrypt(definition.defaultValue)
              : definition.defaultValue,
            description: definition.description,
            category: definition.category,
            isEncrypted: definition.isEncrypted || false,
          },
        });
        console.log(`✅ Created default setting: ${definition.key}`);
      }
    }
  }

  async getSetting(key: string): Promise<string | null> {
    const setting = await this.prisma.settings.findUnique({
      where: { key },
    });

    if (!setting || !setting.value) {
      // Return default value if available
      const definition = SETTING_DEFINITIONS.find(def => def.key === key);
      return definition?.defaultValue || null;
    }

    return setting.isEncrypted ? this.decrypt(setting.value) : setting.value;
  }

  async setSetting(key: string, value: string): Promise<void> {
    const definition = SETTING_DEFINITIONS.find(def => def.key === key);

    if (!definition) {
      throw new Error(`Unknown setting key: ${key}`);
    }

    // Validate the value
    if (definition.validation && !definition.validation(value)) {
      throw new Error(`Invalid value for setting ${key}`);
    }

    const encryptedValue = definition.isEncrypted ? this.encrypt(value) : value;

    await this.prisma.settings.upsert({
      where: { key },
      update: {
        value: encryptedValue,
        updatedAt: new Date(),
      },
      create: {
        key,
        value: encryptedValue,
        description: definition.description,
        category: definition.category,
        isEncrypted: definition.isEncrypted || false,
      },
    });
  }

  async getSettingsByCategory(category: string): Promise<
    Array<{
      key: string;
      value: string | null;
      description: string;
      type: string;
      required: boolean;
      isEncrypted: boolean;
    }>
  > {
    const definitions = SETTING_DEFINITIONS.filter(def => def.category === category);
    const results = [];

    for (const definition of definitions) {
      const value = await this.getSetting(definition.key);
      results.push({
        key: definition.key,
        value: definition.isEncrypted ? (value ? '••••••••' : null) : value,
        description: definition.description,
        type: definition.type || 'string',
        required: definition.required || false,
        isEncrypted: definition.isEncrypted || false,
      });
    }

    return results;
  }

  async getAllSettings(): Promise<
    Array<{
      category: string;
      settings: Array<{
        key: string;
        value: string | null;
        description: string;
        type: string;
        required: boolean;
        isEncrypted: boolean;
      }>;
    }>
  > {
    const categories = [...new Set(SETTING_DEFINITIONS.map(def => def.category))];
    const results = [];

    for (const category of categories) {
      const settings = await this.getSettingsByCategory(category);
      results.push({
        category,
        settings,
      });
    }

    return results;
  }

  async validateSettings(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const definition of SETTING_DEFINITIONS) {
      if (definition.required) {
        const value = await this.getSetting(definition.key);
        if (!value) {
          errors.push(`Required setting '${definition.key}' is not configured`);
        } else if (definition.validation && !definition.validation(value)) {
          errors.push(`Invalid value for setting '${definition.key}'`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async getJellyfinConfig(): Promise<{
    url: string | null;
    apiKey: string | null;
    syncInterval: number;
  }> {
    const [url, apiKey, syncIntervalStr] = await Promise.all([
      this.getSetting('jellyfin.url'),
      this.getSetting('jellyfin.apiKey'),
      this.getSetting('jellyfin.syncInterval'),
    ]);

    return {
      url,
      apiKey,
      syncInterval: syncIntervalStr ? parseInt(syncIntervalStr, 10) : 300000,
    };
  }

  private encrypt(text: string): string {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Prepend IV to encrypted data
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return text; // Fallback to plain text
    }
  }

  private decrypt(encryptedText: string): string {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 2) {
        // Handle legacy format or plain text
        return encryptedText;
      }

      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      return encryptedText; // Fallback to encrypted text
    }
  }
}
