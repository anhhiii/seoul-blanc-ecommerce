import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { sendResponse } from '../../../utils/sendResponse.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';

const prisma = new PrismaClient();

export class AdminAnalyticsController {
  /**
   * Get KPI statistics, monthly chart data, top selling products and low stock alerts
   */
  public getDashboardStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    // 1. KPI Counts
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();

    // Calculate total revenue: sum of totalPrice for CONFIRMED, SHIPPING, DELIVERED orders
    const paidOrders = await prisma.order.findMany({
      where: {
        orderStatus: { in: ['CONFIRMED', 'SHIPPING', 'DELIVERED'] }
      },
      select: { totalPrice: true }
    });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    // 2. Fetch last 6 months data for charts
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const ordersLast6Months = await prisma.order.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        orderStatus: { not: 'CANCELLED' }
      },
      select: {
        totalPrice: true,
        createdAt: true
      }
    });

    // Create 6 months array structure
    const monthlyStats: { [key: string]: { month: string; revenue: number; ordersCount: number } } = {};
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyStats[key] = { month: key, revenue: 0, ordersCount: 0 };
    }

    ordersLast6Months.forEach((order) => {
      const date = new Date(order.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyStats[key]) {
        monthlyStats[key].revenue += order.totalPrice;
        monthlyStats[key].ordersCount += 1;
      }
    });

    const chartData = Object.values(monthlyStats);

    // 3. Top-selling products
    const topProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { sold: 'desc' },
      select: {
        id: true,
        name: true,
        thumbnail: true,
        price: true,
        sold: true
      }
    });

    // 4. Low stock products (warning list: variants with stock < 5)
    const lowStockVariants = await prisma.productVariant.findMany({
      where: { stock: { lt: 5 } },
      take: 10,
      include: {
        product: {
          select: {
            name: true,
            thumbnail: true
          }
        }
      }
    });

    const lowStockAlerts = lowStockVariants.map(v => ({
      variantId: v.id,
      productName: v.product.name,
      thumbnail: v.product.thumbnail,
      color: v.color,
      size: v.size,
      stock: v.stock
    }));

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const topSellingProducts = topProducts.map(p => ({
      id: p.id,
      name: p.name,
      thumbnail: p.thumbnail,
      soldQuantity: p.sold || 0,
      revenue: (p.sold || 0) * p.price
    }));

    return sendResponse(res, 200, 'Lấy dữ liệu thống kê thành công', {
      kpis: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalUsers,
        totalProducts
      },
      monthlyRevenue: chartData,
      topSellingProducts,
      lowStockVariants: lowStockAlerts
    });
  });
}
