import { prisma } from '../config/prisma.js';
import { NotFoundException } from '../exceptions/index.js';

export class WishlistService {
  /**
   * Get user's wishlist and return detailed products list
   */
  public getWishlist = async (userId: string) => {
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId,
          productIds: [],
        },
      });
    }

    // Fetch details of all active products in wishlist
    const products = await prisma.product.findMany({
      where: {
        id: { in: wishlist.productIds },
        status: 'ACTIVE',
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return products;
  };

  /**
   * Toggle a product in user's wishlist (Add if not present, remove if present)
   */
  public toggleWishlist = async (userId: string, productId: string) => {
    // 1. Verify product exists and is active
    const product = await prisma.product.findFirst({
      where: { id: productId, status: 'ACTIVE' },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại hoặc đã bị ẩn');
    }

    // 2. Get or create wishlist
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId,
          productIds: [],
        },
      });
    }

    const exists = wishlist.productIds.includes(productId);
    let updatedProductIds = [...wishlist.productIds];
    let added = false;

    if (exists) {
      // Remove product
      updatedProductIds = updatedProductIds.filter((id) => id !== productId);
    } else {
      // Add product
      updatedProductIds.push(productId);
      added = true;
    }

    // 3. Update in database
    await prisma.wishlist.update({
      where: { userId },
      data: {
        productIds: updatedProductIds,
      },
    });

    return {
      added,
      productIds: updatedProductIds,
    };
  };

  /**
   * Check if a list of productIds are favorited by the user
   */
  public getWishlistIds = async (userId: string) => {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      select: { productIds: true },
    });

    return wishlist ? wishlist.productIds : [];
  };
}
