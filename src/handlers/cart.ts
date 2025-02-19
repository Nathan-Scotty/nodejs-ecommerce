import prisma from "../db";
import { CustomerError } from "../errors/errorHandler";

export const getUserCart = async (request, response, next) => {
    try {
        console.log("Received userId:", request.params.userId); // Log du userId pour voir ce qui est reçu
        const { userId } = request.params;

        if (!userId) {
            return response.status(400).json({ error: "User ID is required" });
        }

        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (!cart) {
            return response.status(404).json({ error: "Cart not found" });
        }

        response.json({ data: cart });
    } catch (error) {
        console.error("Error in getUserCart:", error);
        next(new CustomerError("Failed to get user cart", 500));
    }
};

export const addToCart = async (request, response, next) => {
    try {
        const { userId, productId, quantity } = request.body;
        console.log("Received request:", { userId, productId, quantity });

        // Vérifier si le produit existe
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) {
            console.log("Product not found:", productId);
            return response.status(404).json({ error: "Product not found" });
        }
        console.log("Product found:", product);

        // Créer ou récupérer le panier de l'utilisateur
        const cart = await prisma.cart.upsert({
            where: { userId },
            update: {},
            create: { userId }
        });
        console.log("Cart created or retrieved:", cart);

        // Ajouter ou mettre à jour l'article dans le panier
        const cartItem = await prisma.cartItem.upsert({
            where: { cartId_productId: { cartId: cart.id, productId } },
            update: { quantity: { increment: quantity } },
            create: { cartId: cart.id, productId, quantity }
        });
        console.log("Cart item added or updated:", cartItem);

        response.json({ data: cartItem });
    } catch (error) {
        console.error("Error in addToCart:", error);
        response.status(500).json({ error: "Failed to add item to cart", details: error.message });
    }
};

// Supprimer un produit du panier
export const removeFromCart = async (request, response, next) => {
    try {
        const { userId, productId } = request.params;
        console.log("Received request to remove item:", { userId, productId });

        if (!userId || !productId) {
            return response.status(400).json({ error: "Missing userId or productId" });
        }

        // Vérifier si le panier existe
        const cart = await prisma.cart.findUnique({ where: { userId } });
        console.log("Cart found:", cart);

        if (!cart) {
            return response.status(404).json({ error: "Cart not found for this user" });
        }

        // Vérifier si l'article est dans le panier
        const cartItem = await prisma.cartItem.findUnique({
            where: { cartId_productId: { cartId: cart.id, productId } }
        });
        console.log("CartItem found:", cartItem);

        if (!cartItem) {
            return response.status(404).json({ error: "Item not found in cart" });
        }

        // Supprimer l'article du panier
        await prisma.cartItem.delete({
            where: { cartId_productId: { cartId: cart.id, productId } }
        });

        console.log("Item successfully removed");

        return response.json({ message: "Item removed from cart" });
    } catch (error) {
        console.error("Error removing item:", error);
        return response.status(500).json({ error: "Failed to remove item from cart", details: error.message });
    }
};

// Update quantity of an item in the cart
export const updateCartItemQuantity = async (request, response, next) => {
    const { userId, productId } = request.params;
    const { quantity } = request.body;

    console.log("Received PUT request to update cart", { userId, productId, quantity });
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!quantity || quantity < 1) {
        return response.status(400).json({ error: "Invalid quantity" });
    }

    try {
        const cartItem = await prisma.cartItem.findUnique({
            where: { cartId_productId: { cartId: cart.id, productId } }
        });

        if (!cartItem) {
            return response.status(404).json({ error: "Item not found in cart" });
        }

        const updatedItem = await prisma.cartItem.update({
            where: { cartId_productId: { cartId: cart.id, productId } },
            data: { quantity },
        });

        response.json(updatedItem);
    } catch (error) {
        console.error("Error updating cart:", error);
        response.status(500).json({ error: "Failed to update quantity" });
    }
};


