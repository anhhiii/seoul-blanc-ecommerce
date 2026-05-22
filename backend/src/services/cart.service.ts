import { prisma } from '../config/prisma.js';
import { BadRequestException, NotFoundException } from '../exceptions/index.js';

interface CartItemData {
  productVariantId: string;
  quantity: number;
  price: number;
}

interface CartData {
  id: string;
  userId: string;
  items: CartItemData[];
  totalPrice: number;
}

export class CartService {
  /**
   * Helper to populate cart items with current product and variant details
   */
  private populateCartItems = async (cart: CartData) => {
    if (!cart) return null;

    const populatedItems = await Promise.all(
      cart.items.map(async (item: CartItemData) => {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.productVariantId },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                thumbnail: true,
                price: true,
                discountPrice: true,
                status: true,
              },
            },
          },
        });

        return {
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          price: item.price,
          variant: variant
            ? {
                id: variant.id,
                size: variant.size,
                color: variant.color,
                stock: variant.stock,
                sku: variant.sku,
                product: variant.product,
              }
            : null,
        };
      })
    );

    // Filter out items whose variant/product no longer exists or is inactive
    const validItems = populatedItems.filter(
      (item) => item.variant && item.variant.product && item.variant.product.status === 'ACTIVE'
    );

    // If some items were filtered out (deleted/inactive products), we should recalculate the total price and save
    if (validItems.length !== cart.items.length) {
      const updatedItems = validItems.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        price: item.price,
      }));

      const newTotalPrice = updatedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

      const updatedCart = await prisma.cart.update({
        where: { id: cart.id },
        data: {
          items: updatedItems,
          totalPrice: newTotalPrice,
        },
      });

      return {
        ...updatedCart,
        items: validItems,
      };
    }

    return {
      ...cart,
      items: validItems,
    };
  };

  /**
   * Get user's cart or create one if it doesn't exist
   */
  public getOrCreateCart = async (userId: string) => {
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          items: [],
          totalPrice: 0.0,
        },
      });
    }

    return this.populateCartItems(cart);
  };

  /**
   * Add a product variant to user's cart
   */
  public addToCart = async (userId: string, productVariantId: string, quantity: number) => {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    // Check if variant and product exist and product is active
    const variant = await prisma.productVariant.findUnique({
      where: { id: productVariantId },
      include: { product: true },
    });

    if (!variant || !variant.product || variant.product.status !== 'ACTIVE') {
      throw new NotFoundException('Product variant not found or inactive');
    }

    // Verify stock availability
    if (variant.stock < quantity) {
      throw new BadRequestException(`Sản phẩm chỉ còn ${variant.stock} trong kho`);
    }

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          items: [],
          totalPrice: 0.0,
        },
      });
    }

    // Use current product selling price (use discountPrice if available)
    const itemPrice = variant.product.discountPrice ?? variant.product.price;

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productVariantId === productVariantId
    );

    const updatedItems = [...cart.items];

    if (existingItemIndex >= 0) {
      const newQty = updatedItems[existingItemIndex].quantity + quantity;
      if (variant.stock < newQty) {
        throw new BadRequestException(
          `Bạn đã có ${updatedItems[existingItemIndex].quantity} sản phẩm trong giỏ hàng. Kho chỉ còn lại ${variant.stock} sản phẩm.`
        );
      }
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQty,
        price: itemPrice, // update to latest price
      };
    } else {
      updatedItems.push({
        productVariantId,
        quantity,
        price: itemPrice,
      });
    }

    // Recalculate total price
    const totalPrice = updatedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const updatedCart = await prisma.cart.update({
      where: { userId },
      data: {
        items: updatedItems,
        totalPrice,
      },
    });

    return this.populateCartItems(updatedCart);
  };

  /**
   * Update quantity of a variant in the cart
   */
  public updateCartItem = async (userId: string, productVariantId: string, quantity: number) => {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero');
    }

    // Check if variant exists
    const variant = await prisma.productVariant.findUnique({
      where: { id: productVariantId },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    // Verify stock availability
    if (variant.stock < quantity) {
      throw new BadRequestException(`Sản phẩm chỉ còn ${variant.stock} trong kho`);
    }

    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productVariantId === productVariantId
    );

    if (existingItemIndex < 0) {
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
    }

    const updatedItems = [...cart.items];
    updatedItems[existingItemIndex] = {
      ...updatedItems[existingItemIndex],
      quantity,
    };

    // Recalculate total price
    const totalPrice = updatedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const updatedCart = await prisma.cart.update({
      where: { userId },
      data: {
        items: updatedItems,
        totalPrice,
      },
    });

    return this.populateCartItems(updatedCart);
  };

  /**
   * Remove item from cart
   */
  public removeFromCart = async (userId: string, productVariantId: string) => {
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    const updatedItems = cart.items.filter((item) => item.productVariantId !== productVariantId);

    // Recalculate total price
    const totalPrice = updatedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const updatedCart = await prisma.cart.update({
      where: { userId },
      data: {
        items: updatedItems,
        totalPrice,
      },
    });

    return this.populateCartItems(updatedCart);
  };

  /**
   * Clear all items in the cart
   */
  public clearCart = async (userId: string) => {
    const cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    return prisma.cart.update({
      where: { userId },
      data: {
        items: [],
        totalPrice: 0.0,
      },
    });
  };
}
