import prisma from "../db";
import { CustomerError } from "../errors/errorHandler";

// Payment Requests
export const addPayment = async (error, request, response, next) => {
    try {
        const { orderId, amount, method, transactionId } = request.body
        const payment = await prisma.payment.create({
            data: {
                orderId,
                amount,
                method,
                transactionId,
                status: "Completed"
            }
        })

        response.json({ data: payment })
    } catch (error) {
        next(new CustomerError("Failed to do payment", 500))
    }
}