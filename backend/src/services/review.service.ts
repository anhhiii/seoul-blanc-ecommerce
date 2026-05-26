import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReviewService {
  /**
   * Create or update a product review
   */
  public async createReview(userId: string, productId: string, rating: number, comment?: string) {
    // 1. Verify that the user has a DELIVERED order containing this product
    const orders = await prisma.order.findMany({
      where: {
        userId,
        orderStatus: 'DELIVERED',
      },
    });

    const hasPurchased = orders.some((order) =>
      order.items.some((item) => item.productId === productId)
    );

    if (!hasPurchased) {
      throw new Error('Bạn chỉ có thể đánh giá các sản phẩm đã được giao thành công.');
    }

    // 2. Check if a review already exists from this user for this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });

    let review;
    if (existingReview) {
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment,
          createdAt: new Date(),
        },
      });
    } else {
      review = await prisma.review.create({
        data: {
          userId,
          productId,
          rating,
          comment,
        },
      });
    }

    // 3. Recalculate average rating and total review counts for the product
    const reviews = await prisma.review.findMany({
      where: { productId },
    });

    const totalReviews = reviews.length;
    const sumRatings = reviews.reduce((sum, r) => sum + r.rating, 0);
    const ratingAverage = totalReviews > 0 ? parseFloat((sumRatings / totalReviews).toFixed(1)) : 0.0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAverage,
        totalReviews,
      },
    });

    return review;
  }

  /**
   * Get all reviews for a specific product
   */
  public async getProductReviews(productId: string) {
    return await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
