import fs from 'fs';
import path from 'path';

export interface SystemSettings {
  storeName: string;
  tagline: string;
  supportEmail: string;
  hotline: string;
  address: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  updatedAt: string;
}

const defaultSettings: SystemSettings = {
  storeName: 'Seoul Blanc',
  tagline: 'Korean Minimalist Fashion Ecommerce',
  supportEmail: 'support@seoulblanc.com',
  hotline: '1900 8888',
  address: 'Hà Nội & TP. Hồ Chí Minh, Việt Nam',
  freeShippingThreshold: 1000000,
  standardShippingFee: 30000,
  updatedAt: new Date().toISOString(),
};

export class SettingService {
  private getFilePath(): string {
    return path.resolve(process.cwd(), 'settings.json');
  }

  public getSettings = async (): Promise<SystemSettings> => {
    const filePath = this.getFilePath();
    try {
      if (fs.existsSync(filePath)) {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        return {
          ...defaultSettings,
          ...parsed,
          freeShippingThreshold: Number(parsed.freeShippingThreshold) || 1000000,
          standardShippingFee: Number(parsed.standardShippingFee) || 30000,
        };
      }
    } catch (err) {
      console.error('Error reading settings.json:', err);
    }

    // Initialize file if not found
    try {
      await fs.promises.writeFile(filePath, JSON.stringify(defaultSettings, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error initializing settings.json:', e);
    }

    return defaultSettings;
  };

  public updateSettings = async (data: Partial<SystemSettings>): Promise<SystemSettings> => {
    const current = await this.getSettings();
    const updated: SystemSettings = {
      ...current,
      ...data,
      freeShippingThreshold:
        data.freeShippingThreshold !== undefined
          ? Math.max(0, Number(data.freeShippingThreshold))
          : current.freeShippingThreshold,
      standardShippingFee:
        data.standardShippingFee !== undefined
          ? Math.max(0, Number(data.standardShippingFee))
          : current.standardShippingFee,
      updatedAt: new Date().toISOString(),
    };

    const filePath = this.getFilePath();
    await fs.promises.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');

    return updated;
  };
}

export const settingService = new SettingService();

