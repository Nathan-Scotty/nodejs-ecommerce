import prisma from "../db";
import { CustomerError } from "../errors/errorHandler";

// Order Requests
export const placeOrder = async (error, request, response, next) => {
    try {
        const { userId } = request.body
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: { include: { product: true } } }
        })

        if (!cart || cart.items.length === 0) {
            response.status(400).json({ error: 'Cart is empty' });
            return;
        }

        const total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

        const order = await prisma.order.create({
            data: {
                userId,
                total,
                items: {
                    create: cart.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity
                    }))
                }
            }
        })

        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

        response.json({ data: order })
    } catch (error) {
        next(new CustomerError("Failed to place order", 500))
    }
}

export const getUserOrders = async (error, request, response, next) => {
    try {
        const { userId } = request.params
        const orders = await prisma.order.findMany({
            where: { userId },
            include: { items: { include: { product: true } }, payment: true }
        })

        response.json({ data: orders })
    } catch (error) {
        next(new CustomerError("Failed to get user orders", 500))
    }
}