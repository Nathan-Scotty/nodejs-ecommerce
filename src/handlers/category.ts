import prisma from "../db";
import { CustomerError } from "../errors/errorHandler";

//Category requests
export const getCategories = async (request, response, next) => {
    try {
        const categories = await prisma.category.findMany({
            include: { products: true }
        })

        response.json({ data: categories })
    } catch (error) {
        next(new CustomerError("Failed to get categories", 500))
    }
}

export const addCategory = async (request, response, next) => {
    try {
        const { name, description } = request.body;
        const file = request.file;
        // Stocker uniquement le nom de fichier
        const imagePath = file ? file.filename : null;
        console.log("Request Data:", { name, description, imagePath });

        const category = await prisma.category.create({
            data: { name, description, image: imagePath }
        });

        response.json({ data: category })

    } catch (error) {
        console.error("Error adding category:", error);
        next(new CustomerError("Failed to add categorie", 500))
    }
}

export const deleteCategory = async(request, response, next) => {
    try {
        const {id} = request.params;

        // Check if the category exists
        const category = await prisma.category.findUnique({
            where: {id},
        });

        if(!category){
            return next(new CustomerError("Category not found", 404))
        }

        await prisma.category.delete({
            where: {id},
        })

        response.json({message: "Category delete suceesfully"})

    } catch (error) {
        next(new CustomerError("Failed to delete category", 500))
    }
}

export const editCategory = async (request, response, next) => {
    try {
        const {id} = request.params;
        const {name, description} = request.body
        const file = request.file;

        const category = await prisma.category.findUnique({
            where: {id},
        });

        if(!category){
            return next(new CustomerError("Category not found", 404))
        }

        const updatedData  = {
            name: name || category.name,
            description: description || category.description,
            image: file ? file.filename : category.image,
        };
       
        const updatedCategory = await prisma.category.update({
            where: {id},
            data: updatedData
        });
        console.log("updatedCategory: ", updatedCategory);

        response.json({data: updatedCategory});

    } catch (error) {
        next(new CustomerError("Failed to edit category", 500))
    }
}