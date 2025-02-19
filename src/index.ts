import app from "./server";
import * as dotenv from "dotenv"
dotenv.config();
import config from "./config";

app.listen(config.port, () => {
    console.log(`Hello on http://localhost:${config.port}`)
})