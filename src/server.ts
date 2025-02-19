import express from "express"
import cors from 'cors'
import router from "./router";
import { protect, requireRole } from "./modules/auth";
import { createNewUser, signin } from "./handlers/user";
import morgan from "morgan"
import { errorHandler } from "./errors/errorHandler";
import multer from 'multer';
import path from "path";
import fs from 'fs'

const app = express()


const uploadsDir = path.join(__dirname, "uploads");
if(!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir), {recursive: true}
}
const storage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, uploadsDir)
    },
    filename: (request, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    }
})

export const upload = multer({ storage: storage }).single("image");

app.use(cors()); 
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use('/api', upload, protect, requireRole("admin", "client"), router);
app.post("/user", createNewUser)
app.post("/signin", signin)
app.use(errorHandler)

export default app