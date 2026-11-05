import { Request, Response } from 'express';
import { settingService } from '../services/setting.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendResponse } from '../utils/sendResponse.js';

export class SettingController {
  public getSettings = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingService.getSettings();
    return sendResponse(res, 200, 'Lấy cài đặt hệ thống thành công', { settings });
  });

  public updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingService.updateSettings(req.body);
    return sendResponse(res, 200, 'Cập nhật cài đặt hệ thống thành công', { settings });
  });
}

export const settingController = new SettingController();

