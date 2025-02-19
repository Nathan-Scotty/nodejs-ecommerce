import prisma from "../db";
import { CustomerError } from "../errors/errorHandler";
import { comparePassewords, createJWT, hashPassword } from "../modules/auth";

export const createNewUser = async (request, response, next) => {

    try {
        const user = await prisma.user.create({
            data: {
                email: request.body.email,
                password: await hashPassword(request.body.password),
                name: request.body.name,
                role: request.body.role === "admin" ? "admin" : "client"
            },
        })
        const token = createJWT(user)
        response.json({ token, role: user.role })
    } catch (error) {
        error.type = 'input'
        next(error)
    }
}

export const signin = async (request, response, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: request.body.email
            }
        })

        if(!user){
            response.status(401).json({message: "Invalid email"})
            return;
        }

        const isValid = await comparePassewords(request.body.password, user.password);

        if (!isValid) {
            response.status(401).json({message: "Invalid email or password"})
            return;
        }

        const token = createJWT(user);

        response.json({ token, role: user.role })

    } catch (error) {
        console.error("Signin error:", error);
        
        next(new CustomerError("Failed to signin", 500))
    }
}