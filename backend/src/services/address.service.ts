import { prisma } from '../config/prisma.js';
import { BadRequestException, NotFoundException } from '../exceptions/index.js';

export class AddressService {
  /**
   * Get all addresses for a user
   */
  public getAddresses = async (userId: string) => {
    return await prisma.address.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  };

  /**
   * Get address by ID
   */
  public getAddressById = async (userId: string, addressId: string) => {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address || address.userId !== userId) {
      throw new NotFoundException('Không tìm thấy địa chỉ');
    }

    return address;
  };

  /**
   * Create a new address
   */
  public createAddress = async (
    userId: string,
    data: {
      fullName: string;
      phoneNumber: string;
      province: string;
      district: string;
      ward: string;
      detail: string;
      latitude?: number | null;
      longitude?: number | null;
      isDefault?: boolean;
    }
  ) => {
    // Check if user has any addresses
    const addressCount = await prisma.address.count({
      where: { userId },
    });

    // If it's the first address, make it default automatically
    const isDefault = addressCount === 0 ? true : !!data.isDefault;

    // If this is set to default, reset other default addresses
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return await prisma.address.create({
      data: {
        userId,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        province: data.province,
        district: data.district,
        ward: data.ward,
        detail: data.detail,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        isDefault,
      },
    });
  };

  /**
   * Update an address
   */
  public updateAddress = async (
    userId: string,
    addressId: string,
    data: {
      fullName?: string;
      phoneNumber?: string;
      province?: string;
      district?: string;
      ward?: string;
      detail?: string;
      latitude?: number | null;
      longitude?: number | null;
      isDefault?: boolean;
    }
  ) => {
    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Không tìm thấy địa chỉ để cập nhật');
    }

    const willBeDefault = data.isDefault !== undefined ? data.isDefault : existing.isDefault;

    // If changing to default, reset others
    if (willBeDefault && !existing.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return await prisma.address.update({
      where: { id: addressId },
      data: {
        fullName: data.fullName ?? existing.fullName,
        phoneNumber: data.phoneNumber ?? existing.phoneNumber,
        province: data.province ?? existing.province,
        district: data.district ?? existing.district,
        ward: data.ward ?? existing.ward,
        detail: data.detail ?? existing.detail,
        latitude: data.latitude !== undefined ? data.latitude : existing.latitude,
        longitude: data.longitude !== undefined ? data.longitude : existing.longitude,
        isDefault: willBeDefault,
      },
    });
  };

  /**
   * Delete an address
   */
  public deleteAddress = async (userId: string, addressId: string) => {
    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Không tìm thấy địa chỉ để xóa');
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    // If the deleted address was the default one, make another address default (if any exists)
    if (existing.isDefault) {
      const anotherAddress = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (anotherAddress) {
        await prisma.address.update({
          where: { id: anotherAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return { message: 'Xóa địa chỉ thành công' };
  };

  /**
   * Set address as default
   */
  public setDefaultAddress = async (userId: string, addressId: string) => {
    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException('Không tìm thấy địa chỉ');
    }

    // Set all others to false
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Set this to true
    return await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });
  };
}
