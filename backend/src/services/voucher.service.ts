import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class VoucherService {
  /**
   * Create new voucher
   */
  public async createVoucher(data: {
    code: string;
    discountType: string;
    discountValue: number;
    minOrderValue?: number;
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    usageLimit: number;
  }) {
    const existing = await prisma.voucher.findUnique({
      where: { code: data.code.toUpperCase() },
    });
    if (existing) {
      throw new Error('Mã giảm giá này đã tồn tại trên hệ thống.');
    }

    return await prisma.voucher.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue || 0.0,
        maxDiscount: data.maxDiscount || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        usageLimit: data.usageLimit,
      },
    });
  }

  /**
   * Update voucher
   */
  public async updateVoucher(id: string, data: any) {
    const updateData = { ...data };
    if (updateData.code) updateData.code = updateData.code.toUpperCase();
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

    return await prisma.voucher.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete voucher
   */
  public async deleteVoucher(id: string) {
    return await prisma.voucher.delete({
      where: { id },
    });
  }

  /**
   * Get all vouchers for Admin
   */
  public async getAllVouchersAdmin() {
    return await prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get active vouchers for Client
   */
  public async getActiveVouchersClient() {
    const now = new Date();
    return await prisma.voucher.findMany({
      where: {
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Verify and calculate voucher discount amount
   */
  public async verifyVoucher(code: string, subtotal: number) {
    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!voucher) {
      throw new Error('Mã giảm giá không tồn tại.');
    }

    if (voucher.status !== 'ACTIVE') {
      throw new Error('Mã giảm giá không hoạt động.');
    }

    const now = new Date();
    if (now < voucher.startDate) {
      throw new Error('Mã giảm giá chưa đến thời gian áp dụng.');
    }

    if (now > voucher.endDate) {
      throw new Error('Mã giảm giá đã hết hạn sử dụng.');
    }

    if (voucher.usageCount >= voucher.usageLimit) {
      throw new Error('Mã giảm giá đã hết lượt sử dụng.');
    }

    if (subtotal < voucher.minOrderValue) {
      throw new Error(`Đơn hàng tối thiểu từ ${voucher.minOrderValue.toLocaleString('vi-VN')}₫ mới được áp dụng.`);
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (voucher.discountType === 'PERCENTAGE' || voucher.discountType === 'PERCENT') {
      discountAmount = (subtotal * voucher.discountValue) / 100;
      if (voucher.maxDiscount && discountAmount > voucher.maxDiscount) {
        discountAmount = voucher.maxDiscount;
      }
    } else {
      discountAmount = voucher.discountValue;
    }

    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return {
      voucherId: voucher.id,
      code: voucher.code,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      discountAmount,
    };
  }
}
