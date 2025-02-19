import { error } from "console";
import prisma from "../db";
import { CustomerError } from "../errors/errorHandler";

//Product requests
export const getProducts = async (request, response, next) => {
    try {
        const products = await prisma.product.findMany({ include: { category: true } });

        response.json({ data: products });
    } catch (error) {
        next(new CustomerError("Failed to get products", 500))
    }
}

export const getOneProduct = async (request, response, next) => {
    try {
        const { id } = request.params;

        // Fetch the product using Prisma
        const product = await prisma.product.findUnique({
            where: { id },
            include: { category: true }, // Include related category if applicable
        });

        // Check if the product exists
        if (!product) {
            return response.status(404).json({ error: "Product not found" });
        }

        // Respond with the product data
        response.status(200).json({ data: product });
    } catch (error) {
        console.error("Error fetching product:", error);
        next(new CustomerError("Failed to get one product", 500));
    }
};

export const addProduct = async (request, response, next) => {
    try {
        const { name, description, price, stock, categoryId } = request.body;
        const file = request.file;
        const imagePath = file ? file.filename : null;

        console.log("Request Body:", request.body);
        console.log("Uploaded File:", file);

        if (!name || !description || !price || !stock || !categoryId || !file) {
            return response.status(400).json({ message: "Missing required fields" });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price), // Ensure correct data type
                stock: parseInt(stock), // Ensure correct data type
                categoryId,
                image: imagePath,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        response.status(201).json({ data: product });
    } catch (error) {
        console.error("Error adding product:", error);
        next(new CustomerError("Failed to add product", 500));
    }
};

export const deleteProduct = async (request, response) => {
    const { id } = request.params;

    try {
        await prisma.product.delete({
            where: { id },
        })

        response.status(200).json({ message: "product deleted successfully" })
    } catch (error) {
        console.error(error)
        response.status(500).json({ error: "Failed to delete product" })
    }
}

export const editProduct = async (request, response) => {
    const { id } = request.params;
    const { name, description, price, stock, categoryId } = request.body;
    const file = request.file
    const image = file ? file.filename : null;

    try {
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: parseFloat(price), // Ensure correct data type
                stock: parseInt(stock), // Ensure correct data type
                image,
                categoryId,
            }
        })

        response.status(200).json(updatedProduct);

    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Failed to edit product" })
    }
}
