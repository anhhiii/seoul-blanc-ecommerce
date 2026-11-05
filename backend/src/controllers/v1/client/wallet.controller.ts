import { Response } from 'express';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { walletService } from '../../../services/wallet.service.js';

export class ClientWalletController {
  public getWallet = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const wallet = walletService.getWallet(userId);
    return sendResponse(res, 200, 'Lấy thông tin ví tài khoản thành công', { wallet });
  });
}

export default ClientWalletController;

