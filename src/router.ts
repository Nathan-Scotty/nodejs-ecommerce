import { Router } from "express";
import { addProduct, deleteProduct, editProduct, getOneProduct, getProducts } from "./handlers/product";
import { addToCart, getUserCart, removeFromCart, updateCartItemQuantity } from "./handlers/cart";
import { getUserOrders, placeOrder } from "./handlers/order";
import { addCategory, deleteCategory, editCategory, getCategories } from "./handlers/category";
import { addPayment } from "./handlers/payment";


const router = Router()

router.get("/", (request, response) => {
    response.json({message: "get in touch"})
})

/**
 * Product
 */

router.get("/product", getProducts)
router.get("/product/:id", getOneProduct) 
router.post("/product", addProduct)
router.put("/product/:id", editProduct)
router.delete("/product/:id", deleteProduct)

/**
 * Cart
 */
router.get("/cart/:userId", getUserCart)
router.post("/cart", addToCart)
router.put("/cart/:userId/:productId", updateCartItemQuantity)
router.delete("/cart/:userId/:productId", removeFromCart)

/**
 * Order
 */
router.get("/order", getUserOrders)
router.post("/order", placeOrder)
router.put("/order/:id", async(request, response) =>{})
router.delete("/order/:id", async(request, response) =>{})

/**
 * Category
 */
router.get("/category", getCategories)
router.post("/category", addCategory)
router.put("/category/:id", editCategory)
router.delete("/category/:id", deleteCategory)

/**
 * Payment
 */
router.post("/payment", addPayment)
router.get("/payment/status/:orderId", async(request, response) =>{})

export default router;